import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceAuditLog } from "../tools/audit-log.js";

describe("Audit Log Tool", () => {
  it("should record a new entry", async () => {
    const result = await handleEcommerceAuditLog({ action: "record", platform: "shopee", productId: "P123", newPrice: 150 });
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "recorded");
  });

  it("should retrieve history", async () => {
      const result = await handleEcommerceAuditLog({ action: "get_history", productId: "P123" });
      const parsed = JSON.parse((result as any).content[0].text);
      assert.strictEqual(parsed.status, "success");
      assert.ok(Array.isArray(parsed.logs));
  });
});