import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceReviewSentiment } from "../tools/review-sentiment.js";

describe("Phase 12: Review Sentiment Tool", () => {
    it("should classify positive sentiment", async () => {
        const result = await handleEcommerceReviewSentiment({
            platform: "shopee",
            productId: "P1",
            reviews: ["ดีมากครับ", "ของดี", "จัดส่งเร็ว", "แพ็คเกจสวย"]
        });

        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.analysis.overallSentiment, "positive");
    });

    it("should classify negative sentiment", async () => {
        const result = await handleEcommerceReviewSentiment({
            platform: "shopee",
            productId: "P1",
            reviews: ["แย่มาก", "ของพังใช้งานไม่ได้", "ส่งช้ามาก"]
        });

        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.analysis.overallSentiment, "negative");
    });

    it("should handle mixed sentiment and fallback to neutral if tied", async () => {
        const result = await handleEcommerceReviewSentiment({
            platform: "shopee",
            productId: "P1",
            reviews: ["ดีนะ", "พังเร็ว", "เฉยๆ"]
        });

        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.analysis.overallSentiment, "neutral");
    });
});
