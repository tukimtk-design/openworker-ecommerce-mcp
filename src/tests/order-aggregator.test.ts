import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceOrderAggregator } from "../tools/order-aggregator.js";

describe("Phase 12: Order Aggregator Tool", () => {
    it("should aggregate pending orders", async () => {
        const result = await handleEcommerceOrderAggregator({
            platforms: ["shopee", "lazada"],
            action: "aggregate_pending"
        });

        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.totalOrders, 4); // 2 mocks per platform
    });

    it("should allocate stock centrally", async () => {
        const result = await handleEcommerceOrderAggregator({
            platforms: ["shopee", "lazada"],
            action: "allocate_stock",
            globalStockMap: { "SKU1": 10 }
        });

        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.deepStrictEqual(parsed.allocatedPlatforms, ["shopee", "lazada"]);
    });

    it("should fail gracefully for invalid action", async () => {
        const result = await handleEcommerceOrderAggregator({
            platforms: ["shopee"],
            action: "invalid"
        });

        assert.strictEqual((result as any).isError, true);
    });
});
