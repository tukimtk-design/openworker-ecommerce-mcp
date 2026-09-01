import { describe, it } from "node:test";
import assert from "node:assert";
import {
    forecastInventory,
    bulkForecast,
    normalizeSalesHistory,
    weightedAverage,
    trendSlope,
    stdDev,
    zScoreForServiceLevel,
} from "../services/predictive-engine.js";
import { handleEcommercePredictiveInventory } from "../tools/predictive-inventory.js";

function parse(result: any) {
    return JSON.parse(result.content[0].text);
}

describe("Predictive Engine (unit)", () => {
    it("fills missing days and sorts the series", () => {
        const series = normalizeSalesHistory([
            { date: "2026-09-03", unitsSold: 2 },
            { date: "2026-09-01", unitsSold: 1 },
        ]);
        assert.strictEqual(series.length, 3);
        assert.deepStrictEqual(series.map(s => s.date), ["2026-09-01", "2026-09-02", "2026-09-03"]);
        assert.strictEqual(series[1].unitsSold, 0);
    });

    it("keeps the last value for duplicate dates", () => {
        const series = normalizeSalesHistory([
            { date: "2026-09-01", unitsSold: 1 },
            { date: "2026-09-01", unitsSold: 5 },
        ]);
        assert.strictEqual(series.length, 1);
        assert.strictEqual(series[0].unitsSold, 5);
    });

    it("rejects invalid records", () => {
        assert.strictEqual(normalizeSalesHistory([{ date: "bad", unitsSold: 1 } as any]).length, 0);
        assert.strictEqual(normalizeSalesHistory([]).length, 0);
    });

    it("weights recent days more heavily", () => {
        assert.strictEqual(weightedAverage([5, 0, 0]), 5 / 6);
        assert.strictEqual(weightedAverage([0, 0, 5]), 2.5);
    });

    it("computes trend slope and stddev", () => {
        assert.strictEqual(trendSlope([1, 2, 3, 4, 5]), 1);
        assert.strictEqual(trendSlope([4, 4, 4]), 0);
        assert.strictEqual(trendSlope([7]), 0);
        assert.ok(Math.abs(stdDev([2, 4, 4, 4, 5, 5, 7, 9]) - 2.138) < 0.01);
    });

    it("maps service levels to z-scores", () => {
        assert.strictEqual(zScoreForServiceLevel(0.95), 1.645);
        assert.strictEqual(zScoreForServiceLevel(0.99), 2.33);
        assert.strictEqual(zScoreForServiceLevel(undefined), 1.645);
    });
});

describe("Predictive Engine (forecast)", () => {
    const TODAY = "2026-09-01";

    it("forecasts steady demand with a healthy risk level", () => {
        const history = Array.from({ length: 14 }, (_, i) => ({
            date: `2026-08-${String(18 + i).padStart(2, "0")}`,
            unitsSold: 10,
        }));
        const f = forecastInventory(
            { productId: "P1", currentStock: 600, salesHistory: history },
            { today: TODAY }
        );
        assert.strictEqual(f.avgDailySales, 10);
        assert.strictEqual(f.trendPerDay, 0);
        assert.strictEqual(f.projectedDailySales, 10);
        assert.strictEqual(f.daysOfCover, 60);
        assert.strictEqual(f.stockoutDate, "2026-10-31");
        assert.strictEqual(f.risk, "healthy");
        assert.strictEqual(f.suggestedReorderQty, 0);
    });

    it("flags critical risk and suggests an urgent reorder when stock is below the reorder point", () => {
        const history = Array.from({ length: 14 }, (_, i) => ({
            date: `2026-08-${String(18 + i).padStart(2, "0")}`,
            unitsSold: 10,
        }));
        const f = forecastInventory(
            { productId: "P2", currentStock: 50, salesHistory: history },
            { today: TODAY }
        );
        assert.strictEqual(f.risk, "critical");
        assert.strictEqual(f.daysOfCover, 5);
        assert.ok(f.suggestedReorderQty > 0);
        assert.ok(f.recommendation.includes("สั่งซื้อด่วน"));
    });

    it("projects rising demand above the flat average when trending up", () => {
        const history = Array.from({ length: 7 }, (_, i) => ({
            date: `2026-08-2${5 + i}`, // 2026-08-25 .. 2026-08-31
            unitsSold: i + 1, // 1..7, slope = 1
        }));
        const f = forecastInventory(
            { productId: "P3", currentStock: 100, salesHistory: history },
            { today: TODAY }
        );
        assert.strictEqual(f.trendPerDay, 1);
        assert.ok(f.projectedDailySales > f.avgDailySales);
        assert.ok(f.daysOfCover < 100 / f.avgDailySales);
    });

    it("handles zero demand and never divides by zero", () => {
        const history = [{ date: "2026-08-25", unitsSold: 0 }, { date: "2026-09-01", unitsSold: 0 }];
        const f = forecastInventory({ productId: "P4", currentStock: 10, salesHistory: history }, { today: TODAY });
        assert.strictEqual(f.projectedDailySales, 0);
        assert.strictEqual(f.daysOfCover, 999);
        assert.strictEqual(f.stockoutDate, null);
        assert.strictEqual(f.risk, "healthy");
        assert.strictEqual(f.suggestedReorderQty, 0);
    });

    it("throws on empty history", () => {
        assert.throws(() => forecastInventory({ productId: "P5", currentStock: 5, salesHistory: [] }));
    });
});

describe("Predictive Engine (bulk)", () => {
    it("sorts products by urgency: critical first, then least cover", () => {
        const mk = (n: number, units: number, stock: number) =>
            Array.from({ length: 5 }, (_, i) => ({ date: `2026-08-2${i + 1}`, unitsSold: units }));
        const forecasts = bulkForecast([
            { productId: "HEALTHY", currentStock: 500, salesHistory: mk(1, 2, 500) },
            { productId: "CRITICAL", currentStock: 5, salesHistory: mk(2, 10, 5) },
            { productId: "WARNING", currentStock: 40, salesHistory: mk(3, 5, 40) },
        ], { today: "2026-09-01" });

        assert.deepStrictEqual(forecasts.map(f => f.productId), ["CRITICAL", "WARNING", "HEALTHY"]);
    });
});

describe("Predictive Inventory Tool", () => {
    it("forecasts via the forecast action", async () => {
        const result = await handleEcommercePredictiveInventory({
            action: "forecast",
            platform: "shopee",
            productId: "P123",
            currentStock: 50,
            leadTimeDays: 7,
            targetCoverDays: 30,
            today: "2026-09-01",
            salesHistory: Array.from({ length: 10 }, (_, i) => ({
                date: `2026-08-2${i + 1}`,
                unitsSold: 10,
            })),
        });
        const parsed = parse(result);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.forecast.risk, "critical");
        assert.strictEqual(parsed.forecast.productId, "P123");
    });

    it("returns validation errors for bad input", async () => {
        const noStock = await handleEcommercePredictiveInventory({ action: "forecast", salesHistory: [{ date: "2026-09-01", unitsSold: 1 }] });
        assert.strictEqual(noStock.isError, true);

        const badHistory = await handleEcommercePredictiveInventory({
            action: "forecast",
            currentStock: 10,
            salesHistory: [{ date: "2026-09-01", unitsSold: "ten" }],
        });
        assert.strictEqual(badHistory.isError, true);

        const invalidAction = await handleEcommercePredictiveInventory({ action: "nope" });
        assert.strictEqual(invalidAction.isError, true);
    });

    it("bulk_forecasts multiple products sorted by urgency", async () => {
        const result = await handleEcommercePredictiveInventory({
            action: "bulk_forecast",
            today: "2026-09-01",
            products: [
                { productId: "A", currentStock: 500, salesHistory: [{ date: "2026-09-01", unitsSold: 1 }] },
                { productId: "B", currentStock: 3, salesHistory: [{ date: "2026-09-01", unitsSold: 10 }] },
            ],
        });
        const parsed = parse(result);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.count, 2);
        assert.strictEqual(parsed.forecasts[0].productId, "B");
        assert.strictEqual(parsed.forecasts[0].risk, "critical");
    });
});
