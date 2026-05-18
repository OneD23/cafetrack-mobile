import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  clearOfflineOperations,
  insertOfflineOperation,
  listOfflineOperations,
  removeOfflineOperation,
} from '../storage/localDb';

interface OfflineOperation {
  id: string;
  type: 'sale' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

interface OfflineState {
  queue: OfflineOperation[];
  isSyncing: boolean;
  lastSync: number | null;
}

const initialState: OfflineState = {
  queue: [],
  isSyncing: false,
  lastSync: null,
};

const buildOfflineOp = (payload: Omit<OfflineOperation, 'id' | 'timestamp' | 'retries'>): OfflineOperation => ({
  ...payload,
  id: Math.random().toString(36).slice(2, 11),
  timestamp: Date.now(),
  retries: 0,
});

export const rehydrateOfflineQueue = createAsyncThunk('offline/rehydrate', async () => {
  const rows = await listOfflineOperations();
  return rows as OfflineOperation[];
});

export const addToQueuePersisted = createAsyncThunk(
  'offline/addPersisted',
  async (payload: Omit<OfflineOperation, 'id' | 'timestamp' | 'retries'>) => {
    const operation = buildOfflineOp(payload);
    await insertOfflineOperation({
      id: operation.id,
      type: operation.type,
      data: operation.data,
      timestamp: operation.timestamp,
      retries: operation.retries,
    });
    return operation;
  }
);

export const removeFromQueuePersisted = createAsyncThunk(
  'offline/removePersisted',
  async (id: string) => {
    await removeOfflineOperation(id);
    return id;
  }
);

export const clearQueuePersisted = createAsyncThunk('offline/clearPersisted', async () => {
  await clearOfflineOperations();
});

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    addToQueue: (state: any, action: PayloadAction<Omit<OfflineOperation, 'id' | 'timestamp' | 'retries'>>) => {
      state.queue.push(buildOfflineOp(action.payload));
    },
    removeFromQueue: (state: any, action: PayloadAction<string>) => {
      state.queue = state.queue.filter((item: any) => item.id !== action.payload);
    },
    clearQueue: (state: any) => {
      state.queue = [];
    },
    setSyncing: (state: any, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },
    incrementRetry: (state: any, action: PayloadAction<string>) => {
      const item = state.queue.find((item: any) => item.id === action.payload);
      if (item) item.retries += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(rehydrateOfflineQueue.fulfilled, (state: any, action) => {
        state.queue = action.payload || [];
      })
      .addCase(addToQueuePersisted.fulfilled, (state: any, action) => {
        state.queue.push(action.payload);
      })
      .addCase(removeFromQueuePersisted.fulfilled, (state: any, action) => {
        state.queue = state.queue.filter((item: any) => item.id !== action.payload);
      })
      .addCase(clearQueuePersisted.fulfilled, (state: any) => {
        state.queue = [];
      });
  },
});

export const { addToQueue, removeFromQueue, clearQueue, setSyncing, incrementRetry } = offlineSlice.actions;
export const getQueue = (state: any) => state.offline.queue;
export default offlineSlice.reducer;
