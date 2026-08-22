import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceSmartDiffUpdate } from "../tools/diff-update.js";

describe("Smart Diff Update Tool", () => {
    it("should compute deltas", async () => {
        const result = await handleEcommerceSmartDiffUpdate({
            currentState: { price: 100, stock: 50 },
            targetState: { price: 100, stock: 40 }
        });
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.deltas.stock, 40);
        assert.strictEqual(parsed.deltas.price, undefined);
    });
});
