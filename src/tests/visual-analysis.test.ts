import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceVisualDomAnalysis } from "../tools/visual-analysis.js";

describe("Visual Analysis Tool", () => {
    it("should return simulated layout data", async () => {
        const result = await handleEcommerceVisualDomAnalysis({ simulate: true });
        const parsed = JSON.parse((result as any).content[0].text);

        assert.strictEqual(parsed.status, "success");
        assert.ok(parsed.layout.length > 0);
        assert.strictEqual(parsed.layout[0].tag, "button");
    });
});
