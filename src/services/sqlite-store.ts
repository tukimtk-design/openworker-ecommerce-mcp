import sqlite3 from 'sqlite3';

export class SqliteStore {
    private db: sqlite3.Database;

    constructor(dbPath: string = ':memory:') {
        this.db = new sqlite3.Database(dbPath);
        this.initDb();
    }

    private initDb() {
        this.db.serialize(() => {
            this.db.run("CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, value TEXT)");
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
