declare module 'expo-sqlite' {
  export function openDatabaseAsync(name: string): Promise<{
    execAsync: (sql: string) => Promise<void>;
    runAsync: (sql: string, ...params: any[]) => Promise<void>;
    getAllAsync: (sql: string, ...params: any[]) => Promise<any[]>;
  }>;
}
