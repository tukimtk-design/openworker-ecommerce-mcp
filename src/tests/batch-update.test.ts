import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceBatchUpdatePriceStock } from "../tools/batch-update.js";

describe("Batch Update Tool", () => {
  it("should process multiple items", async () => {
    const items = [
        { productId: "P1", newPrice: 100 },
        { productId: "P2", newStock: 50 }
    ];
    const result = await handleEcommerceBatchUpdatePriceStock({ platform: "shopee", items });
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "success");
    assert.strictEqual(parsed.processedCount, 2);
    assert.strictEqual(parsed.results.length, 2);
  });

  it("should return error if missing platform or items", async () => {
    const result = await handleEcommerceBatchUpdatePriceStock({ platform: "shopee" });
    assert.strictEqual((result as any).isError, true);
  });
});
