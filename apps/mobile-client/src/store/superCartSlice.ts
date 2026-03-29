import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Address, PaymentMethod, ProductItem } from '../types/superApp';

interface CartLine {
  productId: string;
  businessId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

interface SuperCartState {
  items: CartLine[];
  selectedAddress: Address | null;
  selectedPaymentMethod: PaymentMethod | null;
}

const initialState: SuperCartState = {
  items: [],
  selectedAddress: null,
  selectedPaymentMethod: null,
};

const superCartSlice = createSlice({
  name: 'superCart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<ProductItem>) {
      const found = state.items.find((line) => line.productId === action.payload.id);
      if (found) {
        found.quantity += 1;
        return;
      }

      state.items.push({
        productId: action.payload.id,
        businessId: action.payload.businessId,
        productName: action.payload.name,
        unitPrice: action.payload.price,
        quantity: 1,
      });
    },
    incrementQty(state, action: PayloadAction<string>) {
      const found = state.items.find((line) => line.productId === action.payload);
      if (found) found.quantity += 1;
    },
    decrementQty(state, action: PayloadAction<string>) {
      const found = state.items.find((line) => line.productId === action.payload);
      if (!found) return;
      found.quantity -= 1;
      if (found.quantity <= 0) {
        state.items = state.items.filter((line) => line.productId !== action.payload);
      }
    },
    clearCart(state) {
      state.items = [];
    },
    setSelectedAddress(state, action: PayloadAction<Address>) {
      state.selectedAddress = action.payload;
    },
    setSelectedPaymentMethod(state, action: PayloadAction<PaymentMethod>) {
      state.selectedPaymentMethod = action.payload;
    },
  },
});

export const {
  addToCart,
  incrementQty,
  decrementQty,
  clearCart,
  setSelectedAddress,
  setSelectedPaymentMethod,
} = superCartSlice.actions;

export default superCartSlice.reducer;
