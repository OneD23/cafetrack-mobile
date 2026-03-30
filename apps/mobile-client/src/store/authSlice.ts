import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}
interface Business {
  id: string;
  name: string;
  type: string;
  status?: string;
  enabledModules?: string[];
}

interface AuthState {
  user: User | null;
  business: Business | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  business: null,
  token: null,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.login(credentials);
      const token = response.token;
      const user = response.user;
      const business = response.business;

      if (!token || !user || !business) {
        throw new Error('Respuesta de autenticación inválida');
      }

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('business', JSON.stringify(business));
      return { user, business, token };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Credenciales inválidas');
    }
  }
);

export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const token = await AsyncStorage.getItem('token');
  const userRaw = await AsyncStorage.getItem('user');
  const businessRaw = await AsyncStorage.getItem('business');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const business = businessRaw ? JSON.parse(businessRaw) : null;

  if (!token || !user || !business) {
    return { user: null, business: null, token: null };
  }

  try {
    const response = await api.me();
    const currentUser = response?.user || user;
    const currentBusiness = response?.business || business;
    await AsyncStorage.setItem('user', JSON.stringify(currentUser));
    await AsyncStorage.setItem('business', JSON.stringify(currentBusiness));
    return { user: currentUser, business: currentBusiness, token };
  } catch {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('business');
    return { user: null, business: null, token: null };
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.business = null;
      state.token = null;
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
      AsyncStorage.removeItem('business');
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.business = action.payload.business;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Error de login';
      })
      .addCase(restoreSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.business = action.payload.business;
        state.token = action.payload.token;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;  // ← DEFAULT EXPORTw
