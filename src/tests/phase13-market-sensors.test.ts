import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceMarketSensors } from "../tools/market-sensors.js";

describe("Phase 13: Market Sensor Mesh", () => {
  it("should capture competitor snapshots and emit zero-waste delta diffs", async () => {
    const sku = "COMP-SKU-999";

    // 1. Initial snapshot
    const res1 = await handleEcommerceMarketSensors({
      action: "diff_competitor",
      platform: "shopee",
      skuId: sku,
      price: 250,
      stock: 100,
      soldCount: 50,
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    });
    const parsed1 = JSON.parse((res1 as any).content[0].text);
    assert.strictEqual(parsed1.status, "success");
    assert.strictEqual(parsed1.hasChanged, false); // first observation

    // 2. Updated snapshot with price drop and sold count increase
    const res2 = await handleEcommerceMarketSensors({
      action: "diff_competitor",
      platform: "shopee",
      skuId: sku,
      price: 239, // dropped 11 THB
      stock: 80,  // dropped 20 units
      soldCount: 70, // increased 20 units
      timestamp: Date.now(),
    });
    const parsed2 = JSON.parse((res2 as any).content[0].text);
    assert.strictEqual(parsed2.status, "success");
    assert.strictEqual(parsed2.hasChanged, true);
    assert.strictEqual(parsed2.deltaDiffs.length, 3);

    const priceDiff = parsed2.deltaDiffs.find((d: any) => d.field === "price");
    assert.strictEqual(priceDiff.oldValue, 250);
    assert.strictEqual(priceDiff.newValue, 239);
    assert.strictEqual(priceDiff.delta, -11);

    // 3. Estimate sales velocity
    const velocityRes = await handleEcommerceMarketSensors({
      action: "velocity_estimate",
      platform: "shopee",
      skuId: sku,
    });
    const velocityParsed = JSON.parse((velocityRes as any).content[0].text);
    assert.strictEqual(velocityParsed.status, "success");
    assert.strictEqual(velocityParsed.velocity.totalDeltaSold, 20);
    assert.ok(velocityParsed.velocity.unitsSoldPerDay > 0);

    // 4. Trend radar lookup
    const radarRes = await handleEcommerceMarketSensors({
      action: "trend_radar",
      platform: "shopee",
      category: "beauty",
    });
    const radarParsed = JSON.parse((radarRes as any).content[0].text);
    assert.strictEqual(radarParsed.status, "success");
    assert.ok(radarParsed.trends.length > 0);
  });
});
