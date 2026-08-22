import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceProductSearch } from "../tools/ecommerce-search.js";

describe("Ecommerce Search Tool", () => {
  it("should return search results", async () => {
    const result = await handleEcommerceProductSearch({ platform: "shopee", query: "test" });
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "success");
    assert.ok(parsed.data.title.includes("test"));
  });

  it("should return error if missing platform or query", async () => {
    const result = await handleEcommerceProductSearch({ platform: "shopee" });
    assert.strictEqual((result as any).isError, true);
  });
});
