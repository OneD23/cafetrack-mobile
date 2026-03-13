import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { deductIngredientsForSale } from './inventorySlice';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  icon: string;
  stock: number;
  hasRecipe: boolean;
  recipeId?: string;
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
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    subtotal,
    discount: 0,
    tax: subtotal * 0.16,
    total: subtotal * 1.16,
  };
};

// Thunk para procesar venta con descuento de inventario
export const processSale = createAsyncThunk(
  'cart/processSale',
  async (payload: { paymentMethod: string; customerName?: string }, { getState, dispatch }) => {
    const state = getState() as { cart: CartState };
    const { items } = state.cart;
    
    // Verificar stock de ingredientes para todos los items
    for (const item of items) {
      if (item.hasRecipe && item.recipeId) {
        try {
          await dispatch(deductIngredientsForSale({
            recipeId: item.recipeId,
            quantity: item.quantity,
            saleId: `SALE-${Date.now()}`,
          })).unwrap();
        } catch (error) {
          throw new Error(`No hay suficiente stock para: ${item.name}`);
        }
      }
    }
    
    return { success: true, timestamp: new Date().toISOString() };
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<any>) => {
      const existing = state.items.find((item: any) => item.id === action.payload.id);
      if (existing) {
        if (existing.quantity < existing.stock) {
          existing.quantity += 1;
        }
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      state.totals = calculateTotals(state.items);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item: any) => item.id !== action.payload);
      state.totals = calculateTotals(state.items);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; qty: number }>) => {
      const item = state.items.find((item: any) => item.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(1, Math.min(action.payload.qty, item.stock));
      }
      state.totals = calculateTotals(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.totals = { subtotal: 0, discount: 0, tax: 0, total: 0 };
    },
    setDiscount: (state, action: PayloadAction<{ type: 'percentage' | 'fixed'; value: number }>) => {
      const { type, value } = action.payload;
      if (type === 'percentage') {
        state.totals.discount = state.totals.subtotal * (value / 100);
      } else {
        state.totals.discount = Math.min(value, state.totals.subtotal);
      }
      state.totals.total = (state.totals.subtotal - state.totals.discount) * 1.16;
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

export const { addToCart, removeFromCart, updateQuantity, clearCart, setDiscount } = cartSlice.actions;
export default cartSlice.reducer;