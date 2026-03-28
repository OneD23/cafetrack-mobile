import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import inventoryReducer from './inventorySlice';
import recipesReducer from './recipesSlice';
import offlineReducer from './offlineSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    inventory: inventoryReducer,
    recipes: recipesReducer,
    offline: offlineReducer,
  },
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
