import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceContextCompressor } from "../tools/compressor.js";

describe("Context Compressor Tool", () => {
    it("should compress dom string", async () => {
        const result = await handleEcommerceContextCompressor({ domString: "<html><body><div>Test</div></body></html>" });
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.ok(parsed.data.compressedSize < 200);
    });
});
