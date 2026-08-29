import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceBiDashboardExport } from "../tools/bi-export.js";
import { handleEcommerceCrossBorderCloner } from "../tools/cross-border.js";
import { handleEcommerceHardwareHealthCheck } from "../tools/hardware-health.js";

describe("Phase 13 Tools", () => {

    // Test BI Dashboard Export
    describe("BI Dashboard Export Tool", () => {
        it("should export BI data in JSON format by default", async () => {
             const result = await handleEcommerceBiDashboardExport({});
             const parsed = JSON.parse((result as any).content[0].text);
             assert.strictEqual(parsed.status, "success");
             assert.strictEqual(parsed.format, "json");
             assert.ok(parsed.data.includes("shopee"));
        });

        it("should export BI data in CSV format", async () => {
             const result = await handleEcommerceBiDashboardExport({ format: "csv" });
             const parsed = JSON.parse((result as any).content[0].text);
             assert.strictEqual(parsed.status, "success");
             assert.strictEqual(parsed.format, "csv");
             assert.ok(parsed.data.includes("platform,sales,returnRate,pendingOrders"));
        });
    });

    // Test Cross-Border Cloner
    describe("Cross-Border Cloner Tool", () => {
        it("should convert THB to MYR correctly", async () => {
            const args = { sourceProductId: "P123", targetRegion: "MY", basePrice: 1000 };
            const result = await handleEcommerceCrossBorderCloner(args);
            const parsed = JSON.parse((result as any).content[0].text);
            assert.strictEqual(parsed.status, "success");
            assert.strictEqual(parsed.data.currency, "MYR");
            assert.strictEqual(parsed.data.convertedPrice, 130);
        });

        it("should block request without required arguments", async () => {
            const result = await handleEcommerceCrossBorderCloner({});
            assert.strictEqual((result as any).isError, true);
        });
    });

    // Test Hardware Health Check
    describe("Hardware Health Check Tool", () => {
        it("should return health status and memory info", async () => {
             const result = await handleEcommerceHardwareHealthCheck({ profileId: "test_profile" });
             const parsed = JSON.parse((result as any).content[0].text);
             assert.strictEqual(parsed.status, "success");
             assert.ok(parsed.data.healthStatus);
             assert.ok(parsed.data.totalMemoryMB > 0);
             assert.ok(parsed.data.daysUntilCookieExpiry !== undefined);
        });
    });
});
