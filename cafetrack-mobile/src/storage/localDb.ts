import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type OfflineOpType = 'sale' | 'update' | 'delete';

export interface OfflineOperationRow {
  id: string;
  type: OfflineOpType;
  data: any;
  timestamp: number;
  retries: number;
}

let dbPromise: Promise<any> | null = null;
const WEB_QUEUE_KEY = 'offline_queue_web_fallback';

const getDb = async () => {
  if (Platform.OS === 'web') return null;
  if (!dbPromise) {
    const SQLite = await import('expo-sqlite');
    dbPromise = (SQLite as any).openDatabaseAsync('cafetrack_local.db');
  }
  return dbPromise;
};

export const initLocalDb = async () => {
  if (Platform.OS === 'web') {
    const existing = await AsyncStorage.getItem(WEB_QUEUE_KEY);
    if (!existing) {
      await AsyncStorage.setItem(WEB_QUEUE_KEY, '[]');
    }
    return;
  }

  const db = await getDb();
  if (!db) return;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS offline_operations (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      retries INTEGER NOT NULL DEFAULT 0
    );
  `);
};

export const insertOfflineOperation = async (row: OfflineOperationRow) => {
  await initLocalDb();

  if (Platform.OS === 'web') {
    const existing = await listOfflineOperations();
    const next = [...existing.filter((op) => op.id !== row.id), row];
    await AsyncStorage.setItem(WEB_QUEUE_KEY, JSON.stringify(next));
    return;
  }

  const db = await getDb();
  if (!db) return;
  await db.runAsync(
    `INSERT OR REPLACE INTO offline_operations (id, type, data, timestamp, retries)
     VALUES (?, ?, ?, ?, ?)`,
    row.id,
    row.type,
    JSON.stringify(row.data ?? {}),
    row.timestamp,
    row.retries
  );
};

export const listOfflineOperations = async (): Promise<OfflineOperationRow[]> => {
  await initLocalDb();

  if (Platform.OS === 'web') {
    const raw = await AsyncStorage.getItem(WEB_QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return (Array.isArray(parsed) ? parsed : []).map((r: any) => ({
      id: String(r.id),
      type: r.type,
      data: r.data ?? {},
      timestamp: Number(r.timestamp || Date.now()),
      retries: Number(r.retries || 0),
    }));
  }

  const db = await getDb();
  if (!db) return [];
  const rows = await db.getAllAsync(`SELECT * FROM offline_operations ORDER BY timestamp ASC`);
  return (rows || []).map((r: any) => ({
    id: String(r.id),
    type: r.type,
    data: (() => {
      try {
        return JSON.parse(r.data || '{}');
      } catch {
        return {};
      }
    })(),
    timestamp: Number(r.timestamp || Date.now()),
    retries: Number(r.retries || 0),
  }));
};

export const removeOfflineOperation = async (id: string) => {
  await initLocalDb();

  if (Platform.OS === 'web') {
    const existing = await listOfflineOperations();
    const next = existing.filter((r) => r.id !== id);
    await AsyncStorage.setItem(WEB_QUEUE_KEY, JSON.stringify(next));
    return;
  }

  const db = await getDb();
  if (!db) return;
  await db.runAsync(`DELETE FROM offline_operations WHERE id = ?`, id);
};

export const clearOfflineOperations = async () => {
  await initLocalDb();

  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(WEB_QUEUE_KEY, '[]');
    return;
  }

  const db = await getDb();
  if (!db) return;
  await db.runAsync(`DELETE FROM offline_operations`);
};
