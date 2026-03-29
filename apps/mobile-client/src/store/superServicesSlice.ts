import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { BusinessOwnerConfig, ServiceBooking } from '../types/superApp';

interface SuperServicesState {
  bookings: ServiceBooking[];
  ownerConfig: BusinessOwnerConfig | null;
}

const initialState: SuperServicesState = {
  bookings: [],
  ownerConfig: null,
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
    setOwnerConfig: (state, action: PayloadAction<BusinessOwnerConfig>) => {
      state.ownerConfig = action.payload;
    },
  },
});

export const { addServiceBooking, updateServiceBookingStatus, setOwnerConfig } = superServicesSlice.actions;
export default superServicesSlice.reducer;
