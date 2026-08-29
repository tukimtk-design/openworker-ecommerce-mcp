import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceDynamicPricing } from "../tools/dynamic-pricing.js";

describe("Phase 12: Dynamic Pricing Tool", () => {
    it("should undercut competitor if above floor price", async () => {
        const result = await handleEcommerceDynamicPricing({
            platform: "shopee",
            productId: "P1",
            currentPrice: 100,
            competitorPrice: 95,
            floorPrice: 90
        });

        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.suggestedPrice, 94);
    });

    it("should default to floor price if competitor is too low", async () => {
        const result = await handleEcommerceDynamicPricing({
            platform: "shopee",
            productId: "P1",
            currentPrice: 100,
            competitorPrice: 85,
            floorPrice: 90
        });

        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.suggestedPrice, 90);
    });

    it("should keep current price if already lower than competitor and above floor", async () => {
        const result = await handleEcommerceDynamicPricing({
            platform: "shopee",
            productId: "P1",
            currentPrice: 92,
            competitorPrice: 95,
            floorPrice: 90
        });

        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.suggestedPrice, 92);
    });

    it("should fail gracefully if parameters are missing", async () => {
        const result = await handleEcommerceDynamicPricing({
            platform: "shopee",
            productId: "P1"
        });

        assert.strictEqual((result as any).isError, true);
    });
});
