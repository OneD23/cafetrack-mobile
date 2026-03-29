import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { superAppApi } from '../services/superAppApi';
import { BusinessCategory, BusinessItem } from '../types/superApp';

interface SuperBusinessState {
  categories: BusinessCategory[];
  businesses: BusinessItem[];
  search: string;
  selectedCategoryId: string | null;
  isLoading: boolean;
}

const initialState: SuperBusinessState = {
  categories: [],
  businesses: [],
  search: '',
  selectedCategoryId: null,
  isLoading: false,
};

export const fetchClientCatalog = createAsyncThunk('superBusiness/fetchClientCatalog', async () => {
  const [categories, businesses] = await Promise.all([superAppApi.getCategories(), superAppApi.getBusinesses()]);
  return { categories, businesses };
});

const superBusinessSlice = createSlice({
  name: 'superBusiness',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<string | null>) {
      state.selectedCategoryId = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchClientCatalog.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchClientCatalog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload.categories;
        state.businesses = action.payload.businesses;
      })
      .addCase(fetchClientCatalog.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setSearch, setSelectedCategory } = superBusinessSlice.actions;
export default superBusinessSlice.reducer;
