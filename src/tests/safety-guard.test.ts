import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceSafetyGuard } from "../tools/safety-guard.js";

describe("Safety Guard Tool", () => {
  it("should return isSafe: true if price drop is within limit", async () => {
    const result = await handleEcommerceSafetyGuard({ currentPrice: 100, proposedPrice: 90, maxPriceDropPercent: 20 });
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.isSafe, true);
    assert.strictEqual(parsed.dropPercent, 10);
  });

  it("should return isSafe: false if price drop exceeds limit", async () => {
    const result = await handleEcommerceSafetyGuard({ currentPrice: 100, proposedPrice: 40, maxPriceDropPercent: 50 });
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.isSafe, false);
    assert.strictEqual(parsed.dropPercent, 60);
    assert.ok(parsed.warning.includes("เตือน"));
  });
});
