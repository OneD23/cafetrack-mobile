import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';

// Thunks para API
export const fetchIngredients = createAsyncThunk(
  'inventory/fetchIngredients',
  async () => {
    const response = await api.getIngredients();
    return response.data;
  }
);

export const addIngredient = createAsyncThunk(
  'inventory/addIngredient',
  async (ingredientData: any) => {
    const response = await api.createIngredient(ingredientData);
    return response.data;
  }
);

export const deleteIngredient = createAsyncThunk(
  'inventory/deleteIngredient',
  async (id: string) => {
    await api.deleteIngredient(id);
    return id;
  }
);

export const restockIngredient = createAsyncThunk(
  'inventory/restockIngredient',
  async ({ ingredientId, quantity, reason }: { ingredientId: string; quantity: number; reason?: string }) => {
    const response = await api.restockIngredient(ingredientId, quantity, reason);
    return response.data;
  }
);

export const adjustStock = createAsyncThunk(
  'inventory/adjustStock',
  async ({ ingredientId, newStock, reason }: { ingredientId: string; newStock: number; reason: string }) => {
    const response = await api.adjustStock(ingredientId, newStock, reason);
    return response.data;
  }
);

export const deductIngredientsForSale = createAsyncThunk(
  'inventory/deductIngredientsForSale',
  async ({ recipeId, quantity, saleId }: { recipeId: string; quantity: number; saleId: string }) => {
    const response = await api.deductIngredients(recipeId, quantity, saleId);
    return response.data;
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    ingredients: [],
    movements: [],
    loading: false,
    error: null,
    lastSync: null,
    lowStockAlerts: [],
  },
  reducers: {
    setIngredients: (state, action) => {
      state.ingredients = action.payload;
      state.lastSync = new Date().toISOString();
    },
    updateIngredient: (state, action) => {
      const index = state.ingredients.findIndex((i: any) => i.id === action.payload.id);
      if (index !== -1) {
        state.ingredients[index] = action.payload;
      } else {
        state.ingredients.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchIngredients
      .addCase(fetchIngredients.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.loading = false;
        state.ingredients = action.payload;
        state.lowStockAlerts = action.payload
          .filter((ing: any) => ing.stock <= ing.minStock)
          .map((ing: any) => ing.id);
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // addIngredient
      .addCase(addIngredient.pending, (state) => {
        state.loading = true;
      })
      .addCase(addIngredient.fulfilled, (state, action) => {
        state.loading = false;
        state.ingredients.push(action.payload);
      })
      .addCase(addIngredient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // deleteIngredient
      .addCase(deleteIngredient.fulfilled, (state, action) => {
        state.ingredients = state.ingredients.filter((i: any) => i.id !== action.payload);
      })
      // restockIngredient
      .addCase(restockIngredient.fulfilled, (state, action) => {
        const index = state.ingredients.findIndex((i: any) => i.id === action.payload.id);
        if (index !== -1) {
          state.ingredients[index] = action.payload;
        }
      })
      // adjustStock
      .addCase(adjustStock.fulfilled, (state, action) => {
        const index = state.ingredients.findIndex((i: any) => i.id === action.payload.id);
        if (index !== -1) {
          state.ingredients[index] = action.payload;
        }
      })
      // deductIngredientsForSale
      .addCase(deductIngredientsForSale.fulfilled, (state, action) => {
        // Actualizar stock de ingredientes si la respuesta incluye los ingredientes actualizados
        if (action.payload.ingredients) {
          action.payload.ingredients.forEach((updatedIng: any) => {
            const index = state.ingredients.findIndex((i: any) => i.id === updatedIng.id);
            if (index !== -1) {
              state.ingredients[index] = updatedIng;
            }
          });
        }
      });
  },
});

export const { setIngredients, updateIngredient } = inventorySlice.actions;
export default inventorySlice.reducer;