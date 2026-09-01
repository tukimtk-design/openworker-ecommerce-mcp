import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceRepricerDaemon } from "../tools/repricer-tool.js";
import { handleEcommerceCognitionRouter } from "../tools/cognition-tool.js";
import { handleEcommerceReviewMiner } from "../tools/review-miner-tool.js";
import { handleEcommerceProfitLedger } from "../tools/profit-ledger.js";

describe("Phase 14: Autonomous Repricer & Tiered Cognition", () => {
  it("should evaluate and reprice with UNDERCUT_COMPETITOR and enforce net margin floor", async () => {
    const sku = "AUTO-REPRICE-SKU-1";

    // 1. Setup COGS and 15% min margin floor
    await handleEcommerceProfitLedger({
      action: "set_cogs",
      platform: "shopee",
      productId: sku,
      skuId: "default",
      cogs: 100,
      minMarginPercent: 15,
    });

    // 2. Competitor price is 200 -> Proposed price 199 (Undercut 1 THB) -> Net margin is healthy -> APPROVED
    const res1 = await handleEcommerceRepricerDaemon({
      action: "evaluate_and_reprice",
      platform: "shopee",
      skuId: sku,
      currentPrice: 210,
      competitorPrice: 200,
      strategy: "UNDERCUT_COMPETITOR",
      undercutAmount: 1,
    });
    const parsed1 = JSON.parse((res1 as any).content[0].text);
    assert.strictEqual(parsed1.status, "success");
    assert.strictEqual(parsed1.decision.actionTaken, "PRICE_UPDATED");
    assert.strictEqual(parsed1.decision.proposedPrice, 199);
    assert.strictEqual(parsed1.decision.isBlocked, false);

    // 3. Competitor price crashes to 105 -> Proposed price 104 -> Below margin floor -> BLOCKED
    const res2 = await handleEcommerceRepricerDaemon({
      action: "evaluate_and_reprice",
      platform: "shopee",
      skuId: sku,
      currentPrice: 199,
      competitorPrice: 105,
      strategy: "UNDERCUT_COMPETITOR",
      undercutAmount: 1,
    });
    const parsed2 = JSON.parse((res2 as any).content[0].text);
    assert.strictEqual(parsed2.status, "success");
    assert.strictEqual(parsed2.decision.actionTaken, "BLOCKED_MARGIN_FLOOR");
    assert.strictEqual(parsed2.decision.isBlocked, true);
  });

  it("should classify incoming requests using Tiered Cognition Router", async () => {
    // T0
    const resT0 = await handleEcommerceCognitionRouter({
      intent: "reprice_sku_against_competitor",
    });
    const parsedT0 = JSON.parse((resT0 as any).content[0].text);
    assert.strictEqual(parsedT0.classification.recommendedTier, "T0_DETERMINISTIC");
    assert.strictEqual(parsedT0.classification.estimatedTokens, 0);

    // T1
    const resT1 = await handleEcommerceCognitionRouter({
      intent: "lookup_cached_faq_response",
    });
    const parsedT1 = JSON.parse((resT1 as any).content[0].text);
    assert.strictEqual(parsedT1.classification.recommendedTier, "T1_LOCAL_CACHE");
    assert.strictEqual(parsedT1.classification.estimatedTokens, 0);

    // T2
    const resT2 = await handleEcommerceCognitionRouter({
      intent: "draft_customer_chat_reply",
    });
    const parsedT2 = JSON.parse((resT2 as any).content[0].text);
    assert.strictEqual(parsedT2.classification.recommendedTier, "T2_LOCAL_SLM");

    // T3
    const resT3 = await handleEcommerceCognitionRouter({
      intent: "resolve_unprecedented_legal_dispute",
    });
    const parsedT3 = JSON.parse((resT3 as any).content[0].text);
    assert.strictEqual(parsedT3.classification.recommendedTier, "T3_FRONTIER_LLM");
  });

  it("should mine competitor reviews and extract actionable USP counter-points", async () => {
    const mockReviews = [
      { rating: 1, comment: "เนื้อผ้าบางมาก ดึงนิดเดียวขาดเลย ไม่สมราคา" },
      { rating: 2, comment: "สั่งไป 7 วันแล้วของเพิ่งถึง ส่งช้าเกินไป" },
      { rating: 5, comment: "ดีมากค่ะ ชอบมาก" },
    ];

    const res = await handleEcommerceReviewMiner({
      reviews: mockReviews,
    });
    const parsed = JSON.parse((res as any).content[0].text);
    assert.strictEqual(parsed.status, "success");
    assert.strictEqual(parsed.analysis.negativeCount, 2);
    assert.ok(parsed.analysis.painPoints.length >= 2);
    assert.ok(parsed.analysis.recommendedUspBullets.length >= 2);
  });
});
