import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { addToQueuePersisted } from './offlineSlice';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  icon?: string;
  stock?: number;
  hasRecipe?: boolean;
  recipeId?: string | null;
}

interface CartState {
  items: CartItem[];
  taxEnabled: boolean;
  taxRate: number;
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
  processingSale: boolean;
}

const initialState: CartState = {
  items: [],
  taxEnabled: true,
  taxRate: 0.16,
  totals: {
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
  },
  processingSale: false,
};

const calculateTotals = (items: CartItem[], taxEnabled = true, taxRate = 0.16) => {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const appliedTaxRate = taxEnabled ? Math.max(0, Number(taxRate || 0)) : 0;
  const tax = subtotal * appliedTaxRate;
  return {
    subtotal,
    discount: 0,
    tax,
    total: subtotal + tax,
  };
};

export const processSale = createAsyncThunk(
  'cart/processSale',
  async (
    payload: {
      paymentMethod: string;
      customerName?: string;
      customerId?: string;
      discount?: number;
    },
    { getState, dispatch }
  ) => {
    const state = getState() as { cart: CartState; auth: any };
    const { items, taxEnabled, taxRate } = state.cart;
    const businessId = state.auth?.business?.id || state.auth?.user?.businessId || undefined;

    if (!items.length) {
      throw new Error('No hay productos en el carrito');
    }

    const salePayload = {
      operationId: `op-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      paymentMethod: payload.paymentMethod,
      customer: payload.customerName ? { name: payload.customerName } : undefined,
      customerId: payload.customerId || undefined,
      discount:
        Number(payload.discount || 0) > 0
          ? { type: 'fixed', value: Number(payload.discount || 0) }
          : { type: 'none', value: 0 },
      applyTax: taxEnabled,
      taxRate: taxRate,
      items: items.map((item) => ({
        productId: item.id,
        recipeId: item.recipeId || null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      createdAt: new Date().toISOString(),
      businessId,
      source: 'local_pos',
    };

    try {
      const response = await api.createSale(salePayload);
      return response;
    } catch (error: any) {
      const message = String(error?.message || '');
      const networkLike =
        message.toLowerCase().includes('network') ||
        message.toLowerCase().includes('failed to fetch') ||
        message.toLowerCase().includes('fetch') ||
        message.toLowerCase().includes('connection') ||
        message.toLowerCase().includes('token inválido') ||
        message.toLowerCase().includes('unauthorized') ||
        message.toLowerCase().includes('abort') ||
        message.toLowerCase().includes('timeout');

      if (!networkLike) {
        throw error;
      }

      dispatch(
        addToQueuePersisted({
          type: 'sale',
          data: salePayload,
        }) as any
      );

      return {
        offline: true,
        data: {
          saleId: `OFF-${Date.now()}`,
          createdAt: new Date().toISOString(),
          customer: salePayload.customer || null,
        },
      };
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any;
      return !state.cart.processingSale;
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<any>) => {
      const incomingId = String(action.payload.id ?? action.payload._id);
      const existing = state.items.find((item) => String(item.id) === incomingId);

      const incomingStock =
        action.payload.stock === undefined || action.payload.stock === null
          ? Number.MAX_SAFE_INTEGER
          : Number(action.payload.stock);

      if (existing) {
        if (existing.quantity < incomingStock) {
          existing.quantity += 1;
        }
      } else {
        state.items.push({
          ...action.payload,
          id: incomingId,
          quantity: 1,
          stock: incomingStock,
        });
      }

      state.totals = calculateTotals(state.items, state.taxEnabled, state.taxRate);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => String(item.id) !== String(action.payload));
      state.totals = calculateTotals(state.items, state.taxEnabled, state.taxRate);
    },

    updateQuantity: (state, action: PayloadAction<{ id: string; qty: number }>) => {
      const item = state.items.find((item) => String(item.id) === String(action.payload.id));
      if (item) {
        const maxStock =
          item.stock === undefined || item.stock === null
            ? Number.MAX_SAFE_INTEGER
            : Number(item.stock);

        item.quantity = Math.max(1, Math.min(Number(action.payload.qty), maxStock));
      }
      state.totals = calculateTotals(state.items, state.taxEnabled, state.taxRate);
    },

    setTaxConfig: (state, action: PayloadAction<{ enabled: boolean; rate?: number }>) => {
      state.taxEnabled = Boolean(action.payload.enabled);
      if (action.payload.rate !== undefined && !Number.isNaN(Number(action.payload.rate))) {
        state.taxRate = Math.max(0, Number(action.payload.rate));
      }
      state.totals = calculateTotals(state.items, state.taxEnabled, state.taxRate);
    },

    clearCart: (state) => {
      state.items = [];
      state.totals = { subtotal: 0, discount: 0, tax: 0, total: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processSale.pending, (state) => {
        state.processingSale = true;
      })
      .addCase(processSale.fulfilled, (state) => {
        state.processingSale = false;
        state.items = [];
        state.totals = { subtotal: 0, discount: 0, tax: 0, total: 0 };
      })
      .addCase(processSale.rejected, (state) => {
        state.processingSale = false;
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, setTaxConfig, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
