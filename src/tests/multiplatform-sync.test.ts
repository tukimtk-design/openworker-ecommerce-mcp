import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceSyncMultiplatformStock } from "../tools/multiplatform-sync.js";

describe("Multiplatform Sync Tool", () => {
    it("should sync multiplatform stock correctly", async () => {
        const targets = [
            {
                 platform: "lazada",
                 productId: "L1",
                 currentPrice: 100,
                 currentStock: 50,
                 availableVariants: [
                     { platform: "lazada", productId: "L1", skuId: "S1", name: "Red M" }
                 ]
            }
        ];

        const result = await handleEcommerceSyncMultiplatformStock({
            sourcePlatform: "shopee",
            sourceProductName: "Red M",
            newStock: 20,
            newPrice: 100, // No price drop
            targets
        });

        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "completed");
        assert.strictEqual(parsed.results[0].status, "success");
    });

    it("should block sync if safety guard triggers", async () => {
        const targets = [
            {
                 platform: "tiktok",
                 productId: "T1",
                 currentPrice: 100,
                 currentStock: 50,
                 availableVariants: [
                     { platform: "tiktok", productId: "T1", skuId: "S1", name: "Red M" }
                 ]
            }
        ];

        const result = await handleEcommerceSyncMultiplatformStock({
            sourcePlatform: "shopee",
            sourceProductName: "Red M",
            newStock: 20,
            newPrice: 10, // Massive price drop > 30%
            targets
        });

        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "completed");
        assert.strictEqual(parsed.results[0].status, "failed");
        assert.ok(parsed.results[0].message.includes("Safety guard"));
    });
});
