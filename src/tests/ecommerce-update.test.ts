import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceUpdatePriceStock } from "../tools/ecommerce-update.js";

describe("Ecommerce Update Tool", () => {
  it("should return success for update", async () => {
    const result = await handleEcommerceUpdatePriceStock({ platform: "shopee", productId: "P123", newPrice: 200 });
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "success");
    assert.strictEqual(parsed.data.productId, "P123");
    assert.strictEqual(parsed.data.newPrice, 200);
  });

  it("should return error if missing platform or productId", async () => {
    const result = await handleEcommerceUpdatePriceStock({ platform: "shopee" });
    assert.strictEqual((result as any).isError, true);
  });
});
