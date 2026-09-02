import { describe, it } from "node:test";
import assert from "node:assert";
import { TokenBucketLimiter, jitteredDelayMs } from "../services/rate-limiter.js";
import {
    saveSnapshot, getLatestSnapshot, getHistory, pruneHistory,
    CompetitorSnapshot,
} from "../services/competitor-store.js";
import { buildPriceWarPlaybook, buildCostBasis } from "../services/price-war-playbook.js";
import { handleEcommerceCompetitorRadar, mockScanExtractor } from "../tools/competitor-radar.js";

function parse(result: any) {
    return JSON.parse(result.content[0].text);
}

describe("Rate limiter (Task 14.1)", () => {
    it("allows a burst up to capacity then throttles", () => {
        const limiter = new TokenBucketLimiter(3, 60);
        assert.strictEqual(limiter.tryAcquire(), true);
        assert.strictEqual(limiter.tryAcquire(), true);
        assert.strictEqual(limiter.tryAcquire(), true);
        assert.strictEqual(limiter.tryAcquire(), false);
        assert.ok(limiter.msUntilToken() > 0); // ~1s per token at 60/min
    });

    it("refills over time", async () => {
        const limiter = new TokenBucketLimiter(1, 60000); // 1000 tokens/sec
        assert.strictEqual(limiter.tryAcquire(), true);
        assert.strictEqual(limiter.tryAcquire(), false);
        await new Promise(r => setTimeout(r, 30));
        assert.strictEqual(limiter.tryAcquire(), true);
    });

    it("jitter stays inside the requested band", () => {
        for (let i = 0; i < 50; i++) {
            const ms = jitteredDelayMs(100, 200);
            assert.ok(ms >= 100 && ms < 200);
        }
    });
});

describe("Competitor store (Task 14.2)", () => {
    it("saves, reads latest and full history", async () => {
        const base = { platform: "shopee", skuId: "COMP-T1", price: 100 };
        await saveSnapshot({ ...base, price: 100, timestamp: 1000 });
        await saveSnapshot({ ...base, price: 90, timestamp: 2000 });
        await saveSnapshot({ ...base, price: 80, timestamp: 3000 });

        const latest = await getLatestSnapshot("shopee", "COMP-T1");
        assert.strictEqual(latest!.price, 80);

        const history = await getHistory("shopee", "COMP-T1");
        assert.strictEqual(history.length, 3);
        assert.deepStrictEqual(history.map(h => h.price), [100, 90, 80]);
    });

    it("caps history and prunes by retention", async () => {
        const now = Date.now();
        for (let i = 0; i < 7; i++) {
            await saveSnapshot({ platform: "tiktok", skuId: "COMP-T2", price: 50 + i, timestamp: i + 1 });
        }
        assert.strictEqual((await getHistory("tiktok", "COMP-T2")).length, 7);

        await saveSnapshot({ platform: "tiktok", skuId: "COMP-T2", price: 99, timestamp: now });
        const removed = await pruneHistory(30); // drop everything older than 30 days
        assert.ok(removed >= 7);
        const after = await getHistory("tiktok", "COMP-T2");
        assert.strictEqual(after.length, 1);
        assert.strictEqual(after[0].price, 99);
    });

    it("rejects snapshots without a numeric price", async () => {
        await assert.rejects(() => saveSnapshot({ platform: "lazada", skuId: "X", price: "cheap" as any }));
    });
});

describe("Price-war playbook (Task 14.3)", () => {
    const cost = { totalCost: 100, minMarginPercent: 20 }; // floor = 120

    it("recommends matching when the gap is small and margin survives", () => {
        const pb = buildPriceWarPlaybook(150, 140, cost);
        assert.strictEqual(pb.recommended, "match_price");
        assert.strictEqual(pb.plans[0].feasible, true);
        assert.ok(pb.priceGapPercent > 0 && pb.priceGapPercent < 20);
    });

    it("respects the margin floor and falls back to promo when matching is infeasible", () => {
        const pb = buildPriceWarPlaybook(200, 100, cost); // competitor below floor 120
        assert.strictEqual(pb.plans[0].feasible, false);
        assert.strictEqual(pb.plans[0].effectivePrice, 120); // clamped to floor
        assert.strictEqual(pb.recommended, "promo_bundle");
        // promo = half the gap: 200 * (1 - 0.25) = 150 >= floor
        assert.strictEqual(pb.plans[1].effectivePrice, 150);
        assert.strictEqual(pb.plans[1].feasible, true);
    });

    it("recommends hold when even promo would break the margin floor", () => {
        const pb = buildPriceWarPlaybook(125, 60, cost); // promo ~102 < floor 120
        assert.strictEqual(pb.plans[1].feasible, false);
        assert.strictEqual(pb.recommended, "hold");
    });

    it("builds cost basis from a COGS cache record or fallback", () => {
        const fromCogs = buildCostBasis({ cogs: 80, inboundShipping: 10, packagingCost: 10, minMarginPercent: 20 });
        assert.deepStrictEqual(fromCogs, { totalCost: 100, minMarginPercent: 20 });
        const fromFallback = buildCostBasis(null, { unitCost: 100, minMarginPercent: 20 });
        assert.deepStrictEqual(fromFallback, { totalCost: 100, minMarginPercent: 20 });
        assert.strictEqual(buildCostBasis(null, {}), null);
    });
});

describe("Competitor Radar tool", () => {
    it("scans targets rate-limited and persists snapshots", async () => {
        const res = parse(await handleEcommerceCompetitorRadar({
            action: "scan",
            platform: "shopee",
            targets: [{ competitorId: "c1", skuId: "RADAR-1" }, { skuId: "RADAR-2" }],
            maxPerMinute: 30,
        }));
        assert.strictEqual(res.status, "completed");
        assert.strictEqual(res.results.length, 2);
        assert.ok(res.results.every((r: any) => r.status === "scanned"));
        const hist = parse(await handleEcommerceCompetitorRadar({ action: "get_history", platform: "shopee", skuId: "RADAR-1" }));
        assert.ok(hist.count >= 1);
        assert.strictEqual(hist.latest.skuId, "RADAR-1");
    });

    it("uses a custom extractor when injected", async () => {
        const res = parse(await handleEcommerceCompetitorRadar({
            action: "scan",
            platform: "lazada",
            targets: [{ skuId: "CUSTOM-1" }],
            _extractor: async () => ({ price: 42, stock: 5, title: "injected" }),
        }));
        assert.strictEqual(res.results[0].snapshot.price, 42);
    });

    it("marks a failing target as failed without killing the batch", async () => {
        const res = parse(await handleEcommerceCompetitorRadar({
            action: "scan",
            platform: "lazada",
            targets: [{ skuId: "BAD-1" }],
            _extractor: async () => { throw new Error("boom"); },
        }));
        assert.strictEqual(res.results[0].status, "failed");
        assert.ok(res.results[0].message.includes("boom"));
    });

    it("builds the playbook from the COGS cache key convention", async () => {
        await handleEcommerceCompetitorRadar({
            action: "record_snapshot",
            snapshot: { platform: "shopee", skuId: "PLAY-1", price: 140 },
        });
        // Seed COGS via the generic cache tool convention cogs:{platform}:{productId}:{skuId}
        const { handleEcommerceLocalSqliteCache } = await import("../tools/local-cache.js");
        await handleEcommerceLocalSqliteCache({
            action: "set",
            key: "cogs:shopee:MY-PROD:PLAY-1",
            value: JSON.stringify({ cogs: 80, inboundShipping: 10, packagingCost: 10, minMarginPercent: 20 }),
        });

        const res = parse(await handleEcommerceCompetitorRadar({
            action: "price_war_playbook",
            platform: "shopee",
            productId: "MY-PROD",
            skuId: "PLAY-1",
            myPrice: 150,
            competitorPrice: 140,
        }));
        assert.strictEqual(res.status, "success");
        assert.strictEqual(res.playbook.totalCost, 100);
        assert.strictEqual(res.playbook.recommended, "match_price");
        assert.strictEqual(res.playbook.plans.length, 3);
    });

    it("errors without a COGS basis and validates input", async () => {
        const noCost = await handleEcommerceCompetitorRadar({
            action: "price_war_playbook", myPrice: 100, competitorPrice: 90,
        });
        assert.strictEqual(noCost.isError, true);
        assert.ok((noCost.content[0].text as string).includes("COGS"));

        assert.strictEqual((await handleEcommerceCompetitorRadar({ action: "scan", platform: "shopee", targets: [] })).isError, true);
        assert.strictEqual((await handleEcommerceCompetitorRadar({ action: "record_snapshot", snapshot: { skuId: "A" } })).isError, true);
        assert.strictEqual((await handleEcommerceCompetitorRadar({ action: "get_history", platform: "shopee" })).isError, true);
        assert.strictEqual((await handleEcommerceCompetitorRadar({ action: "nope" })).isError, true);
    });
});
