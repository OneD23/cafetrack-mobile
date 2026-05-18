import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';

export const fetchProducts = createAsyncThunk('recipes/fetchProducts', async () => {
  const response = await api.getProducts();
  return response.data;
});

export const createProductWithRecipe = createAsyncThunk(
  'recipes/createProductWithRecipe',
  async (payload: any) => {
    const response = await api.createProduct(payload);
    return response.data;
  }
);

export const updateProductWithRecipe = createAsyncThunk(
  'recipes/updateProductWithRecipe',
  async ({ id, payload }: { id: string; payload: any }) => {
    const response = await api.updateProduct(id, payload);
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk(
  'recipes/deleteProduct',
  async (id: string) => {
    await api.deleteProduct(id);
    return id;
  }
);

export const toggleProductActive = createAsyncThunk(
  'recipes/toggleProductActive',
  async (id: string, { getState, rejectWithValue }: any) => {
    const state = getState();
    const product = state.recipes.products.find((p: any) => String(p.id) === String(id));

    if (!product) {
      return rejectWithValue('Producto no encontrado');
    }

    const response = await api.updateProduct(id, { isActive: !product.isActive });
    return response.data;
  }
);

const recipesSlice = createSlice({
  name: 'recipes',
  initialState: {
    products: [],
    recipes: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state: any, action) => {
        state.loading = false;
        state.products = action.payload.map((product: any) => ({
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          icon: product.icon,
          image: product.image,
          isActive: product.isActive,
          recipeId: product.recipe?._id || null,
          hasRecipe: !!product.recipe,
        }));

        state.recipes = action.payload
          .filter((product: any) => product.recipe)
          .map((product: any) => ({
            id: product.recipe._id,
            productId: product._id,
            preparationTime: product.recipe.preparationTime,
            image: product.recipe.image,
            items: product.recipe.items.map((item: any) => ({
              ingredientId: item.ingredient?._id || item.ingredient,
              quantity: item.quantity,
            })),
          }));
      })
      .addCase(fetchProducts.rejected, (state: any, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createProductWithRecipe.fulfilled, (state: any, action) => {
        const product = action.payload;

        state.products.unshift({
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          icon: product.icon,
          image: product.image,
          isActive: product.isActive,
          recipeId: product.recipe?._id || null,
          hasRecipe: !!product.recipe,
        });

        if (product.recipe) {
          state.recipes.unshift({
            id: product.recipe._id,
            productId: product._id,
            preparationTime: product.recipe.preparationTime,
            image: product.recipe.image,
            items: product.recipe.items.map((item: any) => ({
              ingredientId: item.ingredient?._id || item.ingredient,
              quantity: item.quantity,
            })),
          });
        }
      })
      .addCase(updateProductWithRecipe.fulfilled, (state: any, action) => {
        const product = action.payload;
        const idx = state.products.findIndex((p: any) => p.id === product._id);
        if (idx !== -1) {
          state.products[idx] = {
            id: product._id,
            name: product.name,
            price: product.price,
            category: product.category,
            icon: product.icon,
            image: product.image,
            isActive: product.isActive,
            recipeId: product.recipe?._id || null,
            hasRecipe: !!product.recipe,
          };
        }

        if (product.recipe) {
          const ridx = state.recipes.findIndex((r: any) => r.id === product.recipe._id);
          const normalized = {
            id: product.recipe._id,
            productId: product._id,
            preparationTime: product.recipe.preparationTime,
            image: product.recipe.image,
            items: product.recipe.items.map((item: any) => ({
              ingredientId: item.ingredient?._id || item.ingredient,
              quantity: item.quantity,
            })),
          };

          if (ridx !== -1) state.recipes[ridx] = normalized;
          else state.recipes.unshift(normalized);
        }
      })
      .addCase(deleteProduct.fulfilled, (state: any, action) => {
        state.products = state.products.filter((p: any) => p.id !== action.payload);
        state.recipes = state.recipes.filter((r: any) => r.productId !== action.payload);
      })
      .addCase(toggleProductActive.fulfilled, (state: any, action) => {
        const product = action.payload;
        const idx = state.products.findIndex((p: any) => p.id === product._id);

        if (idx !== -1) {
          state.products[idx] = {
            ...state.products[idx],
            isActive: product.isActive,
          };
        }
      });
  },
});

export default recipesSlice.reducer;
