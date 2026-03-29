import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import inventoryReducer from './inventorySlice';
import recipesReducer from './recipesSlice';
import offlineReducer from './offlineSlice';
import superAuthReducer from './superAuthSlice';
import superBusinessReducer from './superBusinessSlice';
import superCartReducer from './superCartSlice';
import superOrdersReducer from './superOrdersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    inventory: inventoryReducer,
    recipes: recipesReducer,
    offline: offlineReducer,
    superAuth: superAuthReducer,
    superBusiness: superBusinessReducer,
    superCart: superCartReducer,
    superOrders: superOrdersReducer,
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
