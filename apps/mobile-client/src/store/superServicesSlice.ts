import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ServiceBooking } from '../types/superApp';

interface SuperServicesState {
  bookings: ServiceBooking[];
}

const initialState: SuperServicesState = {
  bookings: [],
};

const superServicesSlice = createSlice({
  name: 'superServices',
  initialState,
  reducers: {
    addServiceBooking: (state, action: PayloadAction<ServiceBooking>) => {
      state.bookings.unshift(action.payload);
    },
    updateServiceBookingStatus: (
      state,
      action: PayloadAction<{ id: string; status: ServiceBooking['status'] }>
    ) => {
      const booking = state.bookings.find((item) => item.id === action.payload.id);
      if (booking) {
        booking.status = action.payload.status;
      }
    },
  },
});

export const { addServiceBooking, updateServiceBookingStatus } = superServicesSlice.actions;
export default superServicesSlice.reducer;
