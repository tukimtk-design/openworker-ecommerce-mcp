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
            let basePath = '';
            if (os.platform() === 'win32') {
                 basePath = path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'openworker-ecommerce');
            } else {
                 basePath = path.join(os.homedir(), '.openworker-ecommerce');
            }

            if (!fs.existsSync(basePath)) {
                fs.mkdirSync(basePath, { recursive: true });
            }

            const dbPath = path.join(basePath, dbName);
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

    async get(key: string): Promise<string | null> {
        if (this.db) {
            try {
                const stmt = this.db.prepare("SELECT value FROM cache WHERE key = ?");
                const row = stmt.get(key) as { value: string } | undefined;
                return row ? row.value : null;
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

    async close(): Promise<void> {
        if (this.db && typeof this.db.close === 'function') {
            try {
                this.db.close();
            } catch (e) {}
        }
    }
}
