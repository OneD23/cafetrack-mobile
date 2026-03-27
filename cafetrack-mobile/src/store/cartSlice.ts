import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';

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
  totals: {
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
  },
  processingSale: false,
};

const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  return {
    subtotal,
    discount: 0,
    tax: subtotal * 0.16,
    total: subtotal * 1.16,
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
    { getState }
  ) => {
    const state = getState() as { cart: CartState };
    const { items } = state.cart;

    if (!items.length) {
      throw new Error('No hay productos en el carrito');
    }

    const salePayload = {
      paymentMethod: payload.paymentMethod,
      customer: payload.customerName ? { name: payload.customerName } : undefined,
      discount:
        Number(payload.discount || 0) > 0
          ? { type: 'fixed', value: Number(payload.discount || 0) }
          : { type: 'none', value: 0 },
      items: items.map((item) => ({
        productId: item.id,
        recipeId: item.recipeId || null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      createdAt: new Date().toISOString(),
    };

    const response = await api.createSale(salePayload);
    return response;
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

      state.totals = calculateTotals(state.items);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => String(item.id) !== String(action.payload));
      state.totals = calculateTotals(state.items);
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
      state.totals = calculateTotals(state.items);
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

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
