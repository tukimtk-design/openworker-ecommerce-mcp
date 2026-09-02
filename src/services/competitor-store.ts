// Phase 14 Task 14.2: Competitor snapshot time-series in SqliteStore.
// Key convention (matches pre-existing data in the wild):
//   competitor:{platform}:{skuId}        -> latest snapshot (object)
//   competitor_history:{platform}:{skuId} -> full time-series (JSON array)
import { SqliteStore } from "./sqlite-store.js";

const store = new SqliteStore();

export interface CompetitorSnapshot {
    platform: string;
    competitorId?: string;
    skuId: string;
    title?: string;
    price: number;
    stock?: number;
    soldCount?: number;
    rating?: number;
    timestamp?: number; // epoch ms
}

const HISTORY_CAP = 500;
const DEFAULT_RETENTION_DAYS = 90;

function historyKey(platform: string, skuId: string): string {
    return `competitor_history:${platform}:${skuId}`;
}

async function loadHistory(platform: string, skuId: string): Promise<CompetitorSnapshot[]> {
    const stored = await store.get(historyKey(platform, skuId));
    if (!stored) return [];
    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

async function saveHistory(platform: string, skuId: string, history: CompetitorSnapshot[]): Promise<void> {
    await store.set(historyKey(platform, skuId), JSON.stringify(history.slice(-HISTORY_CAP)));
}

// The store has no key enumeration, so known history keys are tracked
// under this meta key for pruneHistory to walk.
const HISTORY_KEYS_META = "competitor_history_keys";

async function trackHistoryKey(key: string): Promise<void> {
    const raw = await store.get(HISTORY_KEYS_META);
    let knownKeys: string[] = [];
    if (raw) {
        try { knownKeys = JSON.parse(raw); } catch (e) { knownKeys = []; }
    }
    if (!knownKeys.includes(key)) {
        knownKeys.push(key);
        await store.set(HISTORY_KEYS_META, JSON.stringify(knownKeys));
    }
}

export async function saveSnapshot(snap: CompetitorSnapshot): Promise<CompetitorSnapshot> {
    if (typeof snap.price !== "number") {
        throw new Error("snapshot.price must be a number");
    }
    const entry: CompetitorSnapshot = { ...snap, timestamp: snap.timestamp ?? Date.now() };
    const key = historyKey(entry.platform, entry.skuId);

    await store.set(`competitor:${entry.platform}:${entry.skuId}`, JSON.stringify(entry));

    const history = await loadHistory(entry.platform, entry.skuId);
    history.push(entry);
    await saveHistory(entry.platform, entry.skuId, history);
    await trackHistoryKey(key);
    return entry;
}

export async function getLatestSnapshot(platform: string, skuId: string): Promise<CompetitorSnapshot | null> {
    const stored = await store.get(`competitor:${platform}:${skuId}`);
    if (!stored) return null;
    try { return JSON.parse(stored); } catch (e) { return null; }
}

export async function getHistory(platform: string, skuId: string, limit?: number): Promise<CompetitorSnapshot[]> {
    const history = await loadHistory(platform, skuId);
    const sliced = limit ? history.slice(-limit) : history;
    return sliced;
}

/** Drop history entries older than `retentionDays`; returns entries removed. */
export async function pruneHistory(retentionDays: number = DEFAULT_RETENTION_DAYS): Promise<number> {
    const cutoff = Date.now() - retentionDays * 86400000;
    const raw = await store.get(HISTORY_KEYS_META);
    let knownKeys: string[] = [];
    if (raw) {
        try { knownKeys = JSON.parse(raw); } catch (e) { knownKeys = []; }
    }

    let removed = 0;
    const nextKeys: string[] = [];
    for (const key of knownKeys) {
        // key format: competitor_history:{platform}:{skuId}
        const [, platform, skuId] = key.split(":");
        if (!platform || !skuId) continue;
        const history = await loadHistory(platform, skuId);
        const kept = history.filter(h => (h.timestamp ?? 0) >= cutoff);
        removed += history.length - kept.length;
        if (kept.length > 0) {
            await saveHistory(platform, skuId, kept);
            nextKeys.push(key);
        } else {
            await store.delete(key);
            await store.delete(`competitor:${platform}:${skuId}`);
        }
    }
    await store.set(HISTORY_KEYS_META, JSON.stringify(nextKeys));
    return removed;
}
