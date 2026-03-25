import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CashMovement {
  saleId: string;
  amount: number;
  at: string;
}

interface CashRegisterState {
  isOpen: boolean;
  openingAmount: number;
  openedAt?: string;
  closedAt?: string;
  closingAmount?: number;
  movements: CashMovement[];
}

const initialState: CashRegisterState = {
  isOpen: false,
  openingAmount: 0,
  movements: [],
};

const cashRegisterSlice = createSlice({
  name: 'cashRegister',
  initialState,
  reducers: {
    openRegister: (state, action: PayloadAction<{ openingAmount: number }>) => {
      state.isOpen = true;
      state.openingAmount = action.payload.openingAmount;
      state.openedAt = new Date().toISOString();
      state.closedAt = undefined;
      state.closingAmount = undefined;
      state.movements = [];
    },
    closeRegister: (state, action: PayloadAction<{ closingAmount: number }>) => {
      state.isOpen = false;
      state.closedAt = new Date().toISOString();
      state.closingAmount = action.payload.closingAmount;
    },
    recordCashSale: (state, action: PayloadAction<{ saleId: string; amount: number }>) => {
      if (!state.isOpen) return;
      state.movements.push({
        saleId: action.payload.saleId,
        amount: action.payload.amount,
        at: new Date().toISOString(),
      });
    },
  },
});

export const { openRegister, closeRegister, recordCashSale } = cashRegisterSlice.actions;
export default cashRegisterSlice.reducer;
