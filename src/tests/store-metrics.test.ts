import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceGetStoreMetrics } from "../tools/store-metrics.js";

describe("Store Metrics Tool", () => {
  it("should return metrics for a platform", async () => {
    const result = await handleEcommerceGetStoreMetrics({ platform: "shopee" });
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "success");
    assert.strictEqual(parsed.metrics.platform, "shopee");
    assert.ok(typeof parsed.metrics.pendingOrdersCount === "number");
  });

  it("should return error if no platform provided", async () => {
    const result = await handleEcommerceGetStoreMetrics({});
    assert.strictEqual((result as any).isError, true);
  });
});
