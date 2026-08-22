import sqlite3 from 'sqlite3';
import os from 'os';
import path from 'path';
import fs from 'fs';

export class SqliteStore {
    private db: sqlite3.Database;

    constructor(dbName: string = 'ecommerce_cache.db') {
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
        console.log(`[SqliteStore] Initializing DB at ${dbPath}`);
        this.db = new sqlite3.Database(dbPath);
        this.initDb();
    }

    private initDb() {

        this.db.serialize(() => {
            this.db.run("CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, value TEXT)");
            this.db.run("CREATE TABLE IF NOT EXISTS recipes (id TEXT PRIMARY KEY, data TEXT)");
            this.db.run("CREATE TABLE IF NOT EXISTS selector_cache (key TEXT PRIMARY KEY, data TEXT)");
            this.db.run("CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)");
            this.db.run("CREATE TABLE IF NOT EXISTS telemetry_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)");
            this.db.run("CREATE TABLE IF NOT EXISTS variant_mappings (id TEXT PRIMARY KEY, data TEXT)");
        });
    }

    async get(key: string): Promise<string | null> {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT value FROM cache WHERE key = ?", [key], (err, row: any) => {
                if (err) reject(err);
                else resolve(row ? row.value : null);
            });
        });
    }

    async set(key: string, value: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run("INSERT OR REPLACE INTO cache (key, value) VALUES (?, ?)", [key, value], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}
