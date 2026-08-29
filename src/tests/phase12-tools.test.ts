import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceVideoGenerator, handleEcommerceSocialMediaUploader } from "../tools/video-pipeline.js";
import { handleEcommerceDynamicPricingEngine } from "../tools/dynamic-pricing.js";
import { handleEcommerceSupportTriage } from "../tools/support-triage.js";

describe("Phase 12 Tools", () => {

    // Test Video Pipeline
    describe("Video Pipeline", () => {
        it("should generate a video with productId and prompt", async () => {
             const args = { productId: "P123", prompt: "A cinematic ad for product" };
             const result = await handleEcommerceVideoGenerator(args);
             const parsed = JSON.parse((result as any).content[0].text);
             assert.strictEqual(parsed.status, "success");
             assert.ok(parsed.data.videoId);
        });

        it("should upload a video to facebook_reels and youtube_shorts", async () => {
             const args = { videoId: "vid_test", targetPlatforms: ["facebook_reels", "youtube_shorts"] };
             const result = await handleEcommerceSocialMediaUploader(args);
             const parsed = JSON.parse((result as any).content[0].text);
             assert.strictEqual(parsed.status, "success");
             assert.strictEqual(parsed.results.length, 2);
        });
    });

    // Test Dynamic Pricing Engine
    describe("Dynamic Pricing Engine", () => {
        it("should propose a new price based on competitor url", async () => {
            const args = { platform: "shopee", productId: "P123", competitorUrl: "http://competitor.com/P123" };
            const result = await handleEcommerceDynamicPricingEngine(args);
            const parsed = JSON.parse((result as any).content[0].text);
            assert.strictEqual(parsed.status, "success");
            assert.ok(parsed.data.proposedPrice > 0);
            assert.strictEqual(parsed.data.adjusted, true);
        });

        it("should respect minPriceLimit and not lower price beyond it", async () => {
            const args = { platform: "shopee", productId: "P123", competitorUrl: "http://competitor.com/P123", minPriceLimit: 2000 };
            const result = await handleEcommerceDynamicPricingEngine(args);
            const parsed = JSON.parse((result as any).content[0].text);
            assert.strictEqual(parsed.status, "success");
            assert.strictEqual(parsed.data.proposedPrice, 2000); // Because random max price is 1000, 2000 is always higher.
            assert.strictEqual(parsed.data.adjusted, false);
            assert.ok(parsed.data.warning);
        });
    });

    // Test Advanced Customer Support Triage System
    describe("Customer Support Triage", () => {
        it("should categorize refund claims and attach context", async () => {
             const args = { customerMessage: "สินค้าพัง ขอคืนเงิน" };
             const result = await handleEcommerceSupportTriage(args);
             const parsed = JSON.parse((result as any).content[0].text);
             assert.strictEqual(parsed.status, "success");
             assert.strictEqual(parsed.data.sentiment, "negative");
             assert.strictEqual(parsed.data.category, "refund_claim");
             assert.strictEqual(parsed.data.contextAttached, true);
        });

        it("should categorize positive feedback", async () => {
             const args = { customerMessage: "ขอบคุณครับ ชอบมาก" };
             const result = await handleEcommerceSupportTriage(args);
             const parsed = JSON.parse((result as any).content[0].text);
             assert.strictEqual(parsed.status, "success");
             assert.strictEqual(parsed.data.sentiment, "positive");
             assert.strictEqual(parsed.data.category, "feedback");
        });
    });
});
