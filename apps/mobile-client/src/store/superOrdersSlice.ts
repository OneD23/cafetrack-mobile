import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { superAppApi } from '../services/superAppApi';
import { Order } from '../types/superApp';

interface SuperOrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
}

const initialState: SuperOrdersState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
};

export const fetchMyOrders = createAsyncThunk('superOrders/fetchMyOrders', async (payload: { userId: string }) => {
  return superAppApi.getMyOrders(payload.userId);
});

export const fetchOrderById = createAsyncThunk('superOrders/fetchOrderById', async (payload: { orderId: string }) => {
  return superAppApi.getOrderById(payload.orderId);
});

export const createClientOrder = createAsyncThunk(
  'superOrders/createClientOrder',
  async (payload: {
    userId: string;
    businessId: string;
    items: Array<{ productId: string; name: string; quantity: number; unitPrice: number }>;
    notes?: string;
  }) => {
    return superAppApi.createOrder(payload);
  }
);

const superOrdersSlice = createSlice({
  name: 'superOrders',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
      })
      .addCase(createClientOrder.fulfilled, (state, action) => {
        state.orders = [action.payload, ...state.orders];
        state.selectedOrder = action.payload;
      });
  },
});

export default superOrdersSlice.reducer;
