import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceGoogleAdsIntegration } from "../tools/google-ads-integration.js";

describe("Google Ads Integration Tool", () => {
    it("should successfully dispatch campaign payload for CapsuleFill/lnwshop", async () => {
        const result = await handleEcommerceGoogleAdsIntegration({
            platform: "lnwshop",
            action: "dispatch_campaign",
            campaignPayload: {
                campaignId: "test_campaign_123",
                budget: 1000,
                targetAudience: ["shoes", "fashion"]
            }
        });

        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.campaignId, "test_campaign_123");
        assert.ok(parsed.message.includes("lnwshop"));
    });

    it("should successfully track offline conversion", async () => {
        const result = await handleEcommerceGoogleAdsIntegration({
            platform: "lnwshop",
            action: "track_offline_conversion",
            conversionData: {
                transactionId: "txn_999",
                conversionValue: 1500,
                currencyCode: "THB"
            }
        });

        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.transactionId, "txn_999");
        assert.ok(parsed.message.includes("lnwshop"));
    });

    it("should fail gracefully if campaignPayload is missing for dispatch_campaign", async () => {
        const result = await handleEcommerceGoogleAdsIntegration({
            platform: "lnwshop",
            action: "dispatch_campaign"
        });

        assert.strictEqual((result as any).isError, true);
        assert.ok((result as any).content[0].text.includes("campaignPayload"));
    });

    it("should fail gracefully if conversionData is missing for track_offline_conversion", async () => {
        const result = await handleEcommerceGoogleAdsIntegration({
            platform: "lnwshop",
            action: "track_offline_conversion"
        });

        assert.strictEqual((result as any).isError, true);
        assert.ok((result as any).content[0].text.includes("conversionData"));
    });

    it("should fail gracefully for invalid action", async () => {
        const result = await handleEcommerceGoogleAdsIntegration({
            platform: "lnwshop",
            action: "invalid_action"
        });

        assert.strictEqual((result as any).isError, true);
        assert.ok((result as any).content[0].text.includes("Invalid action"));
    });
});
