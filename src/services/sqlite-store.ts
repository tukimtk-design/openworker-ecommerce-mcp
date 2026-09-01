import os from 'os';
import path from 'path';
import fs from 'fs';
// @ts-ignore
import { DatabaseSync } from 'node:sqlite';

export class SqliteStore {
    private db: any = null;
    private memoryMap = new Map<string, string>();

    constructor(dbName: string = 'ecommerce_cache.db') {
        try {
            // OPENWORKER_DB_PATH (full file path) > OPENWORKER_DATA_DIR (directory) > platform default.
            // Env overrides let tests run hermetically against a throwaway DB instead of
            // polluting the user's real %APPDATA% store.
            let dbPath: string;
            if (process.env.OPENWORKER_DB_PATH) {
                dbPath = process.env.OPENWORKER_DB_PATH;
            } else if (process.env.OPENWORKER_DATA_DIR) {
                dbPath = path.join(process.env.OPENWORKER_DATA_DIR, dbName);
            } else if (os.platform() === 'win32') {
                 const basePath = path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'openworker-ecommerce');
                 dbPath = path.join(basePath, dbName);
            } else {
                 dbPath = path.join(os.homedir(), '.openworker-ecommerce', dbName);
            }

            const dbDir = path.dirname(dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            if (DatabaseSync) {
                this.db = new DatabaseSync(dbPath);
                this.initDb();
            }
        } catch (err: any) {
            // Fallback gracefully to in-memory map
        }
    }

    private initDb() {
        if (!this.db) return;
        try {
            this.db.exec("CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, value TEXT)");
            this.db.exec("CREATE TABLE IF NOT EXISTS recipes (id TEXT PRIMARY KEY, data TEXT)");
            this.db.exec("CREATE TABLE IF NOT EXISTS selector_cache (key TEXT PRIMARY KEY, data TEXT)");
            this.db.exec("CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)");
            this.db.exec("CREATE TABLE IF NOT EXISTS telemetry_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)");
            this.db.exec("CREATE TABLE IF NOT EXISTS variant_mappings (id TEXT PRIMARY KEY, data TEXT)");
        } catch (e: any) {}
    }

    // Values written before the schema refactor were wrapped as {"_timestamp":..., "value":"..."}.
    // Unwrap so legacy rows stay readable; new writes are plain strings.
    private normalizeStored(raw: string): string {
        try {
            const parsed = JSON.parse(raw);
            if (
                parsed && typeof parsed === 'object' && !Array.isArray(parsed) &&
                typeof (parsed as any)._timestamp === 'number' &&
                typeof (parsed as any).value === 'string'
            ) {
                return (parsed as any).value;
            }
        } catch (e) {
            // Not JSON — return as-is
        }
        return raw;
    }

    async get(key: string): Promise<string | null> {
        if (this.db) {
            try {
                const stmt = this.db.prepare("SELECT value FROM cache WHERE key = ?");
                const row = stmt.get(key) as { value: string } | undefined;
                return row ? this.normalizeStored(row.value) : null;
            } catch (e) {
                return this.memoryMap.get(key) || null;
            }
        }
        return this.memoryMap.get(key) || null;
    }

    async set(key: string, value: string): Promise<void> {
        if (this.db) {
            try {
                const stmt = this.db.prepare("INSERT OR REPLACE INTO cache (key, value) VALUES (?, ?)");
                stmt.run(key, value);
                return;
            } catch (e) {
                this.memoryMap.set(key, value);
                return;
            }
        }
        this.memoryMap.set(key, value);
    }

    async delete(key: string): Promise<void> {
        if (this.db) {
            try {
                this.db.prepare("DELETE FROM cache WHERE key = ?").run(key);
                return;
            } catch (e) {
                this.memoryMap.delete(key);
                return;
            }
        }
        this.memoryMap.delete(key);
    }

    async close(): Promise<void> {
        if (this.db && typeof this.db.close === 'function') {
            try {
                this.db.close();
            } catch (e) {}
        }
    }
}
