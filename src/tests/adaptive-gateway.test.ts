import assert from "node:assert";
import { describe, it } from "node:test";
import { handleEcommerceOps, ACTION_REGISTRY } from "../tools/gateway.js";

describe("Adaptive Single-Gateway Tool (ecommerce_ops)", () => {
  it("should list all available actions when calling list_actions", async () => {
    const res = await handleEcommerceOps({ action: "list_actions" });
    assert.strictEqual(res.isError, undefined);
    assert.strictEqual(res.content.length, 1);

    const data = JSON.parse(res.content[0].text);
    assert.ok(Array.isArray(data.actions));
    assert.ok(data.actions.length >= 40);

    const serpAction = data.actions.find((a: any) => a.action === "serp_rank_tracker");
    assert.ok(serpAction);
    assert.strictEqual(serpAction.category, "seo");
  });

  it("should dispatch serp_rank_tracker action correctly", async () => {
    const res = await handleEcommerceOps({
      action: "serp_rank_tracker",
      params: {
        items: [
          { keyword: "ยาสมุนไพร", url: "https://capsulefill.com/herbs", position: 12 },
          { keyword: "มือสอง", url: "https://capsulefill.com/secondhand", position: 15 } // Negative keyword
        ]
      }
    });

    assert.strictEqual(res.isError, undefined);
    const data = JSON.parse(res.content[0].text);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.length, 2);
    assert.strictEqual(data.data[0].keyword, "ยาสมุนไพร");
  });

  it("should return error for missing or unknown action", async () => {
    const resMissing = await handleEcommerceOps({});
    assert.strictEqual(resMissing.isError, true);

    const resUnknown = await handleEcommerceOps({ action: "non_existent_action" });
    assert.strictEqual(resUnknown.isError, true);
  });
});
