import { describe, it } from "node:test";
import assert from "node:assert";
import {
    getDemandMultiplier,
    seasonalAdjustedDemand,
    seasonalityPreview,
} from "../services/seasonality.js";
import { forecastInventory } from "../services/predictive-engine.js";
import { runInventoryWatchdog } from "../services/inventory-watchdog.js";
import { handleEcommerceReorderWorkflow } from "../tools/reorder-workflow.js";
import { handleEcommerceSendNotification } from "../tools/notify.js";
import { handleEcommerceAutonomousStoreManager } from "../tools/store-agent-tool.js";

function parse(result: any) {
    return JSON.parse(result.content[0].text);
}

// 10 units/day flat history ending 2026-09-01
function flatHistory(days: number, units: number, endMonthDay: string[]) {
    return endMonthDay.slice(0, days).map((d, i) => ({ date: d, unitsSold: units }));
}

describe("Seasonality (Task 13.2)", () => {
    it("boosts demand on double-day mega sales", () => {
        const f = getDemandMultiplier("2026-11-11");
        assert.ok(f.multiplier >= 1.8);
        assert.ok(f.reasons.some(r => r.includes("Double-Day Mega Sale")));
    });

    it("has pre-sale ramp two days before a double day", () => {
        const f = getDemandMultiplier("2026-12-10");
        assert.ok(f.multiplier > 1);
        assert.ok(f.reasons.some(r => r.includes("Pre-Sale")));
    });

    it("boosts Songkran window", () => {
        const f = getDemandMultiplier("2026-04-13");
        assert.ok(f.multiplier >= 1.35);
    });

    it("compounds overlapping events but stays capped", () => {
        // 2026-12-30: Thai New Year window (1.45) x payday (1.15)
        const f = getDemandMultiplier("2026-12-30");
        assert.ok(Math.abs(f.multiplier - 1.45 * 1.15) < 1e-9);
        assert.strictEqual(f.reasons.length, 2);
        // 2026-11-11: mega sale only (payday window is d>=25 or d<=3, not the 11th)
        const solo = getDemandMultiplier("2026-11-11");
        assert.ok(Math.abs(solo.multiplier - 1.8) < 1e-9);
        assert.strictEqual(solo.reasons.length, 1);
    });

    it("is neutral on an ordinary day", () => {
        const f = getDemandMultiplier("2026-06-15");
        assert.strictEqual(f.multiplier, 1);
        assert.strictEqual(f.reasons.length, 0);
    });

    it("raises seasonal-adjusted average demand across a sale window", () => {
        // 7 days ending on 11.11 vs 7 ordinary June days
        const saleAvg = seasonalAdjustedDemand(10, "2026-11-05", 7);
        const normalAvg = seasonalAdjustedDemand(10, "2026-06-10", 7);
        assert.ok(saleAvg > normalAvg);
        assert.ok(saleAvg > 10);
        assert.ok(normalAvg <= 10.5); // mid-June: only mild payday overlap at most
    });

    it("previews one entry per day with dates in order", () => {
        const preview = seasonalityPreview("2026-11-09", 4);
        assert.strictEqual(preview.length, 4);
        assert.deepStrictEqual(preview.map(p => p.date), ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12"]);
    });
});

describe("Seasonality x Predictive Engine", () => {
    const history = flatHistory(10, 10, [
        "2026-08-23", "2026-08-24", "2026-08-25", "2026-08-26", "2026-08-27",
        "2026-08-28", "2026-08-29", "2026-08-30", "2026-08-31", "2026-09-01",
    ]);

    it("off by default keeps legacy Phase 12 numbers", () => {
        const f = forecastInventory({ productId: "P", currentStock: 600, salesHistory: history }, { today: "2026-09-02" });
        assert.strictEqual(f.seasonalityApplied, false);
        assert.strictEqual(f.reorderPoint, 70); // ceil(10*7) + safety 0
    });

    it("raises the reorder point before a mega-sale window", () => {
        // Lead time 7 days starting 2026-11-05 covers the 11.11 ramp
        const plain = forecastInventory({ productId: "P", currentStock: 600, salesHistory: history }, { today: "2026-11-05", leadTimeDays: 7 });
        const seasonal = forecastInventory({ productId: "P", currentStock: 600, salesHistory: history }, { today: "2026-11-05", leadTimeDays: 7, useSeasonality: true });
        assert.strictEqual(seasonal.seasonalityApplied, true);
        assert.ok(seasonal.reorderPoint > plain.reorderPoint);
    });
});

describe("Reorder Workflow (Task 13.1)", () => {
    it("creates a PO draft from forecast-shaped items and computes totals", async () => {
        const res = await handleEcommerceReorderWorkflow({
            action: "create_po",
            note: "unit test",
            items: [
                { productId: "A", qty: 100, unitCost: 25 },
                { platform: "shopee", productId: "B", suggestedReorderQty: 10 },
            ],
        });
        const parsed = parse(res);
        assert.strictEqual(parsed.status, "success");
        const po = parsed.purchaseOrder;
        assert.match(po.poId, /^PO-\d{8}-/);
        assert.strictEqual(po.status, "draft");
        assert.strictEqual(po.items.length, 2);
        assert.strictEqual(po.items[1].qty, 10); // suggestedReorderQty fallback
        assert.strictEqual(po.estimatedTotal, 2500);
        assert.strictEqual(po.items[0].lineTotal, 2500);
    });

    it("lists and filters POs, and updates status", async () => {
        const created = parse(await handleEcommerceReorderWorkflow({ action: "create_po", items: [{ productId: "X", qty: 5 }] }));
        const poId = created.purchaseOrder.poId;

        const all = parse(await handleEcommerceReorderWorkflow({ action: "list_pos" }));
        assert.ok(all.count >= 1);

        const drafts = parse(await handleEcommerceReorderWorkflow({ action: "list_pos", status: "draft" }));
        assert.ok(drafts.purchaseOrders.every((p: any) => p.status === "draft"));

        const updated = parse(await handleEcommerceReorderWorkflow({ action: "update_po_status", poId, status: "ordered" }));
        assert.strictEqual(updated.purchaseOrder.status, "ordered");
    });

    it("validates input", async () => {
        assert.strictEqual((await handleEcommerceReorderWorkflow({ action: "create_po", items: [] })).isError, true);
        assert.strictEqual((await handleEcommerceReorderWorkflow({ action: "create_po", items: [{ productId: "A", qty: 0 }] })).isError, true);
        assert.strictEqual((await handleEcommerceReorderWorkflow({ action: "update_po_status", poId: "PO-NOPE", status: "ordered" })).isError, true);
        assert.strictEqual((await handleEcommerceReorderWorkflow({ action: "update_po_status", poId: "PO-1", status: "bogus" })).isError, true);
        assert.strictEqual((await handleEcommerceReorderWorkflow({ action: "nope" })).isError, true);
    });
});

describe("Inventory Watchdog (Task 13.3)", () => {
    const lowStockProduct = {
        productId: "CRIT-1",
        currentStock: 20,
        salesHistory: [
            { date: "2026-08-26", unitsSold: 10 },
            { date: "2026-08-27", unitsSold: 10 },
            { date: "2026-08-28", unitsSold: 10 },
            { date: "2026-08-29", unitsSold: 10 },
            { date: "2026-08-30", unitsSold: 10 },
            { date: "2026-08-31", unitsSold: 10 },
            { date: "2026-09-01", unitsSold: 10 },
        ],
    };
    const healthyProduct = {
        productId: "OK-1",
        currentStock: 5000,
        salesHistory: [{ date: "2026-09-01", unitsSold: 1 }],
    };

    it("auto-creates one PO for all critical items", async () => {
        const result = await runInventoryWatchdog({
            products: [healthyProduct, lowStockProduct],
            options: { today: "2026-09-02", leadTimeDays: 7 },
        });
        assert.strictEqual(result.checkedProducts, 2);
        assert.strictEqual(result.critical.length, 1);
        assert.strictEqual(result.critical[0].productId, "CRIT-1");
        assert.ok(result.purchaseOrder);
        assert.strictEqual(result.purchaseOrder!.items.length, 1);
        assert.strictEqual(result.purchaseOrder!.items[0].productId, "CRIT-1");
        assert.ok(result.purchaseOrder!.items[0].qty > 0);
        assert.strictEqual(result.notifications.length, 0); // notifyOnCritical off
    });

    it("skips PO creation and notifies when configured", async () => {
        const result = await runInventoryWatchdog({
            products: [lowStockProduct],
            options: { today: "2026-09-02" },
            autoCreatePo: false,
            notifyOnCritical: true,
        });
        assert.strictEqual(result.purchaseOrder, null);
        assert.strictEqual(result.notifications.length, 1);
        assert.strictEqual(result.notifications[0].status, "simulated"); // no env token => dry-run
    });

    it("does nothing on a healthy watchlist", async () => {
        const result = await runInventoryWatchdog({
            products: [healthyProduct],
            options: { today: "2026-09-02" },
        });
        assert.strictEqual(result.critical.length, 0);
        assert.strictEqual(result.purchaseOrder, null);
    });
});

describe("Notification tool (Task 13.4)", () => {
    it("dry-runs without credentials and logs history", async () => {
        delete process.env.TELEGRAM_BOT_TOKEN;
        delete process.env.TELEGRAM_CHAT_ID;
        delete process.env.LINE_CHANNEL_ACCESS_TOKEN;

        const sent = parse(await handleEcommerceSendNotification({ action: "send", channel: "telegram", message: "test alert" }));
        assert.strictEqual(sent.status, "success");
        assert.strictEqual(sent.notification.status, "simulated");

        const history = parse(await handleEcommerceSendNotification({ action: "history" }));
        assert.ok(history.notifications.length >= 1);
        assert.strictEqual(history.notifications[0].message, "test alert");
    });

    it("validates input", async () => {
        assert.strictEqual((await handleEcommerceSendNotification({ action: "send", channel: "sms", message: "hi" })).isError, true);
        assert.strictEqual((await handleEcommerceSendNotification({ action: "send", channel: "line", message: "" })).isError, true);
        assert.strictEqual((await handleEcommerceSendNotification({ action: "nope" })).isError, true);
    });
});

describe("Store Agent Loop integration (Task 13.3)", () => {
    it("runs the watchdog on trigger_now after configure_watchdog", async () => {
        const configured = parse(await handleEcommerceAutonomousStoreManager({
            action: "configure_watchdog",
            products: [{
                productId: "WATCH-1",
                currentStock: 10,
                salesHistory: [{ date: "2026-09-01", unitsSold: 10 }],
            }],
            leadTimeDays: 7,
        }));
        assert.strictEqual(configured.status, "success");

        const tick = parse(await handleEcommerceAutonomousStoreManager({ action: "trigger_now" }));
        assert.strictEqual(tick.status, "success");
        assert.ok(tick.result.tasksExecuted.includes("inventory_watchdog"));
        assert.ok(tick.result.watchdog);
        assert.strictEqual(tick.result.watchdog.critical.length, 1);
        assert.ok(tick.result.watchdog.purchaseOrder);

        // disable afterwards so other suites aren't affected
        await handleEcommerceAutonomousStoreManager({ action: "configure_watchdog", products: null });
        const status = parse(await handleEcommerceAutonomousStoreManager({ action: "status" }));
        assert.strictEqual(status.data.watchdogConfigured, false);
    });

    it("rejects invalid watchdog config", async () => {
        assert.strictEqual((await handleEcommerceAutonomousStoreManager({ action: "configure_watchdog", products: "nope" })).isError, true);
    });
});
