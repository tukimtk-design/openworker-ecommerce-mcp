import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceAffiliateOutreach } from "../tools/affiliate-outreach.js";
import { handleEcommerceAdsManager } from "../tools/ads-manager.js";
import { handleEcommerceReturnDisputeHandler } from "../tools/return-dispute.js";

describe("Phase 14 Tools", () => {

    // Test Affiliate Outreach
    describe("Affiliate Outreach Tool", () => {
        it("should find and prepare messages for affiliates", async () => {
             const result = await handleEcommerceAffiliateOutreach({ platform: "tiktok", targetAudience: "beauty", budget: 10000 });
             const parsed = JSON.parse((result as any).content[0].text);
             assert.strictEqual(parsed.status, "success");
             assert.strictEqual(parsed.data.foundAffiliates.length, 2);
        });

        it("should reject if required parameters are missing", async () => {
             const result = await handleEcommerceAffiliateOutreach({ platform: "tiktok" });
             assert.strictEqual((result as any).isError, true);
        });
    });

    // Test Ads Campaign Manager
    describe("Ads Campaign Manager Tool", () => {
        it("should create a new campaign", async () => {
            const result = await handleEcommerceAdsManager({ platform: "shopee", action: "create" });
            const parsed = JSON.parse((result as any).content[0].text);
            assert.strictEqual(parsed.status, "success");
            assert.ok(parsed.data.campaignId);
            assert.strictEqual(parsed.data.status, "active");
        });

        it("should report campaign stats", async () => {
            const result = await handleEcommerceAdsManager({ platform: "shopee", action: "report" });
            const parsed = JSON.parse((result as any).content[0].text);
            assert.strictEqual(parsed.status, "success");
            assert.ok(parsed.data.clicks > 0);
        });

        it("should fail pausing if campaignId is missing", async () => {
            const result = await handleEcommerceAdsManager({ platform: "shopee", action: "pause" });
            assert.strictEqual((result as any).isError, true);
        });
    });

    // Test Return & Dispute Handler
    describe("Return & Dispute Handler Tool", () => {
        it("should auto-refund when no evidence is provided", async () => {
             const result = await handleEcommerceReturnDisputeHandler({ returnId: "RET123" });
             const parsed = JSON.parse((result as any).content[0].text);
             assert.strictEqual(parsed.status, "success");
             assert.strictEqual(parsed.data.actionTaken, "auto_refunded");
        });

        it("should dispute when evidence is provided", async () => {
             const result = await handleEcommerceReturnDisputeHandler({ returnId: "RET123", evidenceUrl: "http://evidence.com/video.mp4" });
             const parsed = JSON.parse((result as any).content[0].text);
             assert.strictEqual(parsed.status, "success");
             assert.strictEqual(parsed.data.actionTaken, "disputed");
        });
    });
});
