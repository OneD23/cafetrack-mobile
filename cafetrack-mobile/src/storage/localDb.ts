import * as SQLite from 'expo-sqlite';

export type OfflineOpType = 'sale' | 'update' | 'delete';

export interface OfflineOperationRow {
  id: string;
  type: OfflineOpType;
  data: any;
  timestamp: number;
  retries: number;
}

let dbPromise: Promise<any> | null = null;

const getDb = async () => {
  if (!dbPromise) {
    dbPromise = (SQLite as any).openDatabaseAsync('cafetrack_local.db');
  }
  return dbPromise;
};

export const initLocalDb = async () => {
  const db = await getDb();
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
  const db = await getDb();
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
  const db = await getDb();
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
  const db = await getDb();
  await db.runAsync(`DELETE FROM offline_operations WHERE id = ?`, id);
};

export const clearOfflineOperations = async () => {
  await initLocalDb();
  const db = await getDb();
  await db.runAsync(`DELETE FROM offline_operations`);
};
