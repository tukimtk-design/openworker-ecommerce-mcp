// Inspect the persistent SqliteStore DB to debug test failures.
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import os from 'os';

const dbPath = process.argv[2] || path.join(process.env.APPDATA || '', 'openworker-ecommerce', 'ecommerce_cache.db');
console.log('DB:', dbPath);
const db = new DatabaseSync(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('tables:', tables.map(t => t.name).join(', '));

if (tables.some(t => t.name === 'cache')) {
  const rows = db.prepare('SELECT key, length(value) as len, value FROM cache').all();
  for (const r of rows) {
    console.log(`[cache] ${r.key} (${r.len} bytes):`, String(r.value).slice(0, 300));
  }
}
for (const t of ['audit_logs', 'telemetry_logs', 'selector_cache', 'variant_mappings', 'recipes']) {
  if (tables.some(x => x.name === t)) {
    const c = db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get();
    console.log(`[${t}] rows: ${c.c}`);
    const sample = db.prepare(`SELECT data FROM ${t} LIMIT 3`).all();
    for (const s of sample) console.log(`  sample:`, String(s.data).slice(0, 200));
  }
}
db.close();
