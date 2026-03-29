import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthSession, UserProfile } from '../types/superApp';
import { superAppApi } from '../services/superAppApi';

const SESSION_KEY = 'superapp:session';

interface SuperAuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SuperAuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const loginClient = createAsyncThunk(
  'superAuth/loginClient',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const session = await superAppApi.login(payload.email);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'No fue posible iniciar sesión');
    }
  }
);

export const registerClient = createAsyncThunk(
  'superAuth/registerClient',
  async (payload: { fullName: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const session = await superAppApi.register(payload.fullName, payload.email);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'No fue posible registrarse');
    }
  }
);

export const restoreClientSession = createAsyncThunk('superAuth/restoreSession', async () => {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as AuthSession;
});

const superAuthSlice = createSlice({
  name: 'superAuth',
  initialState,
  reducers: {
    logoutClient(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      AsyncStorage.removeItem(SESSION_KEY);
    },
    setSession(state, action: PayloadAction<AuthSession>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loginClient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginClient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Error de autenticación';
      })
      .addCase(registerClient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerClient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Error de registro';
      })
      .addCase(restoreClientSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreClientSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload?.user || null;
        state.token = action.payload?.token || null;
      })
      .addCase(restoreClientSession.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { logoutClient, setSession } = superAuthSlice.actions;
export default superAuthSlice.reducer;
