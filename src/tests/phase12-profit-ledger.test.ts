import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceProfitLedger } from "../tools/profit-ledger.js";
import { handleEcommerceAutonomyControl } from "../tools/autonomy-control.js";

describe("Phase 12: Profit Ledger & Autonomy Control", () => {
  it("should configure COGS and compute net margin correctly", async () => {
    // 1. Set COGS
    const setRes = await handleEcommerceProfitLedger({
      action: "set_cogs",
      platform: "shopee",
      productId: "TEST-PROD-001",
      skuId: "SKU-RED-M",
      cogs: 100,
      inboundShipping: 10,
      packagingCost: 5,
      minMarginPercent: 20,
    });
    const setParsed = JSON.parse((setRes as any).content[0].text);
    assert.strictEqual(setParsed.status, "success");

    // 2. Compute Net Margin for profitable price
    const profitableRes = await handleEcommerceProfitLedger({
      action: "compute_net_margin",
      platform: "shopee",
      productId: "TEST-PROD-001",
      skuId: "SKU-RED-M",
      proposedPrice: 200,
      platformFeeRate: 0.08,
      shippingBurden: 0,
      adSpendPerUnit: 10,
    });
    const profitParsed = JSON.parse((profitableRes as any).content[0].text);
    assert.strictEqual(profitParsed.status, "success");
    assert.strictEqual(profitParsed.totalCogs, 115); // 100 + 10 + 5
    assert.strictEqual(profitParsed.recommendation, "APPROVED");
    assert.strictEqual(profitParsed.isSafe, true);

    // 3. Compute Net Margin for price that violates margin floor
    const unprofitableRes = await handleEcommerceProfitLedger({
      action: "compute_net_margin",
      platform: "shopee",
      productId: "TEST-PROD-001",
      skuId: "SKU-RED-M",
      proposedPrice: 125,
      platformFeeRate: 0.08,
      shippingBurden: 0,
      adSpendPerUnit: 10,
    });
    const unprofitParsed = JSON.parse((unprofitableRes as any).content[0].text);
    assert.strictEqual(unprofitParsed.status, "success");
    assert.strictEqual(unprofitParsed.recommendation, "REJECTED_BELOW_MARGIN_FLOOR");
    assert.strictEqual(unprofitParsed.isSafe, false);
  });

  it("should manage autonomy mandate, kill switch, and dry run state", async () => {
    // 1. Set mandate
    const mandateRes = await handleEcommerceAutonomyControl({
      action: "set_mandate",
      maxPriceChangePercent: 12,
      dailyAdBudgetCap: 600,
      maxSkusPerBatch: 15,
      isDryRun: true,
    });
    const mandateParsed = JSON.parse((mandateRes as any).content[0].text);
    assert.strictEqual(mandateParsed.status, "success");
    assert.strictEqual(mandateParsed.mandate.maxPriceChangePercent, 12);
    assert.strictEqual(mandateParsed.mandate.isDryRun, true);

    // 2. Trigger kill-switch
    const killRes = await handleEcommerceAutonomyControl({
      action: "kill_switch",
      activate: true,
    });
    const killParsed = JSON.parse((killRes as any).content[0].text);
    assert.strictEqual(killParsed.status, "success");
    assert.strictEqual(killParsed.isKillSwitchActive, true);

    // 3. Deactivate kill-switch and disable dry-run
    const resumeRes = await handleEcommerceAutonomyControl({
      action: "kill_switch",
      activate: false,
    });
    const resumeParsed = JSON.parse((resumeRes as any).content[0].text);
    assert.strictEqual(resumeParsed.isKillSwitchActive, false);
  });
});
