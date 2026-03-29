import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { superAppApi } from '../services/superAppApi';
import { Order } from '../types/superApp';

interface SuperOrdersState {
  orders: Order[];
  isLoading: boolean;
}

const initialState: SuperOrdersState = {
  orders: [],
  isLoading: false,
};

export const fetchOrders = createAsyncThunk('superOrders/fetchOrders', async () => {
  return superAppApi.getOrders();
});

const superOrdersSlice = createSlice({
  name: 'superOrders',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default superOrdersSlice.reducer;
