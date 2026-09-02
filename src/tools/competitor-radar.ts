// Phase 14: Competitor Radar tool
// Actions: scan (rate-limited via pluggable extractor), record_snapshot,
// get_history, price_war_playbook (COGS-aware), prune_history.
//
// The built-in extractor is a deterministic mock (repo Phase 3 convention).
// Swap `extractor` for a CDP-based implementation when a live browser exists.
import { TokenBucketLimiter, jitteredDelayMs, sleep } from "../services/rate-limiter.js";
import {
    saveSnapshot, getLatestSnapshot, getHistory, pruneHistory,
    CompetitorSnapshot,
} from "../services/competitor-store.js";
import { SqliteStore } from "../services/sqlite-store.js";
import { buildPriceWarPlaybook, buildCostBasis, PlaybookResult } from "../services/price-war-playbook.js";

const store = new SqliteStore();

export type ScanExtractor = (platform: string, skuId: string, competitorId?: string) => Promise<Partial<CompetitorSnapshot>>;

// Deterministic mock extractor: simulates a marketplace listing scrape.
export const mockScanExtractor: ScanExtractor = async (platform, skuId) => {
    const seed = skuId.length * 7 + 13;
    return {
        platform,
        skuId,
        title: `Competitor listing for ${skuId}`,
        price: 100 + (seed % 150),
        stock: 20 + (seed % 80),
        soldCount: 30 + (seed % 70),
        rating: 4 + (seed % 10) / 10,
    };
};

function parse(result: any) {
    return JSON.parse(result.content[0].text);
}

async function lookupCostBasis(platform: string, productId: string | undefined, skuId: string | undefined, args: any) {
    let cogsRecord: any = null;
    if (productId && skuId) {
        const raw = await store.get(`cogs:${platform}:${productId}:${skuId}`);
        if (raw) {
            try { cogsRecord = JSON.parse(raw); } catch (e) { cogsRecord = null; }
        }
    }
    return buildCostBasis(cogsRecord, { unitCost: args?.unitCost, minMarginPercent: args?.minMarginPercent });
}

export async function handleEcommerceCompetitorRadar(args: any) {
    const action = args?.action;

    if (action === "scan") {
        const platform = args?.platform;
        const targets = args?.targets;
        if (!platform || !Array.isArray(targets) || targets.length === 0) {
            return { isError: true, content: [{ type: "text", text: "platform and a non-empty targets array are required" }] };
        }
        const maxPerMinute = Math.max(1, Math.min(30, args?.maxPerMinute ?? 6));
        const limiter = new TokenBucketLimiter(maxPerMinute, maxPerMinute);
        const extractor: ScanExtractor = args?._extractor ?? mockScanExtractor;

        const results: Array<any> = [];
        for (const t of targets) {
            if (!t || typeof t.skuId !== "string") {
                return { isError: true, content: [{ type: "text", text: "each target needs skuId (string)" }] };
            }
            const waitMs = limiter.msUntilToken() + jitteredDelayMs(50, 250);
            await sleep(waitMs);
            limiter.tryAcquire();
            try {
                const data = await extractor(platform, t.skuId, t.competitorId);
                const snap = await saveSnapshot({
                    platform,
                    competitorId: t.competitorId,
                    skuId: t.skuId,
                    price: data.price!,
                    stock: data.stock,
                    soldCount: data.soldCount,
                    rating: data.rating,
                    title: data.title,
                });
                results.push({ status: "scanned", snapshot: snap });
            } catch (e: any) {
                results.push({ status: "failed", skuId: t.skuId, message: e.message });
            }
        }
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "completed", scanned: results.length, maxPerMinute, results }) }]
        };
    }

    if (action === "record_snapshot") {
        const snap = args?.snapshot;
        if (!snap || typeof snap.price !== "number" || typeof snap.skuId !== "string" || typeof snap.platform !== "string") {
            return { isError: true, content: [{ type: "text", text: "snapshot requires platform (string), skuId (string) and price (number)" }] };
        }
        const saved = await saveSnapshot(snap as CompetitorSnapshot);
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", snapshot: saved }) }]
        };
    }

    if (action === "get_history") {
        const { platform, skuId } = args || {};
        if (typeof platform !== "string" || typeof skuId !== "string") {
            return { isError: true, content: [{ type: "text", text: "platform and skuId are required" }] };
        }
        const latest = await getLatestSnapshot(platform, skuId);
        const history = await getHistory(platform, skuId, args?.limit);
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", latest, count: history.length, history }) }]
        };
    }

    if (action === "price_war_playbook") {
        const { platform, productId, skuId, myPrice, competitorPrice } = args || {};
        if (typeof myPrice !== "number" || typeof competitorPrice !== "number") {
            return { isError: true, content: [{ type: "text", text: "myPrice (number) and competitorPrice (number) are required" }] };
        }
        const cost = await lookupCostBasis(platform, productId, skuId, args);
        if (!cost) {
            return {
                isError: true,
                content: [{ type: "text", text: "No COGS basis found. Save one via cache key 'cogs:{platform}:{productId}:{skuId}' or pass unitCost (+ optional minMarginPercent)." }],
            };
        }
        const playbook: PlaybookResult = buildPriceWarPlaybook(myPrice, competitorPrice, cost);
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", playbook }) }]
        };
    }

    if (action === "prune_history") {
        const removed = await pruneHistory(args?.retentionDays ?? 90);
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", removedEntries: removed }) }]
        };
    }

    return {
        isError: true,
        content: [{ type: "text", text: "Invalid action. Use 'scan', 'record_snapshot', 'get_history', 'price_war_playbook', or 'prune_history'." }]
    };
}

// Exposed for tests without touching the public tool surface
export const _internal = { parse };
