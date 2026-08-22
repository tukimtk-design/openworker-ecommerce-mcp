import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceCachedSelectorMap } from "../tools/ecommerce-selectors.js";

describe("Ecommerce Selectors Tools", () => {
  it("should list selectors", async () => {
    const result = await handleEcommerceCachedSelectorMap({ action: "list" });
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "success");
    assert.ok(parsed.selectors["shopee_price_input"]);
  });

  it("should get a selector", async () => {
    const result = await handleEcommerceCachedSelectorMap({ action: "get", key: "shopee_price_input" });
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "success");
    assert.strictEqual(parsed.selectors[0], "#price-input-shopee");
  });

  it("should set a selector", async () => {
    const result = await handleEcommerceCachedSelectorMap({ action: "set", key: "new_key", selectors: [".new-selector"] });
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "success");

    const getResult = await handleEcommerceCachedSelectorMap({ action: "get", key: "new_key" });
    const getParsed = JSON.parse((getResult as any).content[0].text);
    assert.strictEqual(getParsed.selectors[0], ".new-selector");
  });
});
