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
        let rawVal: string | null = null;
        if (this.db) {
            try {
                const stmt = this.db.prepare("SELECT value FROM cache WHERE key = ?");
                const row = stmt.get(key) as { value: string } | undefined;
                rawVal = row ? row.value : null;
            } catch (e) {
                rawVal = this.memoryMap.get(key) || null;
            }
        } else {
            rawVal = this.memoryMap.get(key) || null;
        }

        if (rawVal) {
            try {
                const parsed = JSON.parse(rawVal);
                if (parsed._timestamp) {
                    const ageMs = Date.now() - parsed._timestamp;
                    if (ageMs > 15 * 60 * 1000) {
                        return null; // Expired (> 15 mins)
                    }
                    return parsed.value;
                }
            } catch (e) {
                // Not JSON wrapped, assume valid forever
                return rawVal;
            }
        }
        return rawVal;
    }

    async set(key: string, value: string): Promise<void> {
        const wrapped = JSON.stringify({ _timestamp: Date.now(), value });
        if (this.db) {
            try {
                const stmt = this.db.prepare("INSERT OR REPLACE INTO cache (key, value) VALUES (?, ?)");
                stmt.run(key, wrapped);
                return;
            } catch (e) {
                this.memoryMap.set(key, wrapped);
                return;
            }
        }
        this.memoryMap.set(key, wrapped);
    }

    async close(): Promise<void> {
        if (this.db && typeof this.db.close === 'function') {
            try {
                this.db.close();
            } catch (e) {}
        }
    }
}
