import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceVideoGeneration } from "../tools/video-generation.js";

describe("Video Generation Tool", () => {
    it("should handle render action", async () => {
        const result = await handleEcommerceVideoGeneration({ action: "render" });
        assert.strictEqual((result as any).isError, undefined);
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.ok(parsed.renderJobId);
    });

    it("should handle chain_prompt action with prompt", async () => {
        const result = await handleEcommerceVideoGeneration({ action: "chain_prompt", prompt: "Test prompt" });
        assert.strictEqual((result as any).isError, undefined);
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.prompt, "Test prompt");
        assert.ok(parsed.generatedScript);
    });

    it("should return error for chain_prompt action without prompt", async () => {
        const result = await handleEcommerceVideoGeneration({ action: "chain_prompt" });
        assert.strictEqual((result as any).isError, true);
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "error");
        assert.ok(parsed.message.includes("Missing required field"));
    });

    it("should handle assemble_timeline action with videoUrls", async () => {
        const result = await handleEcommerceVideoGeneration({ action: "assemble_timeline", videoUrls: ["url1", "url2"] });
        assert.strictEqual((result as any).isError, undefined);
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.sourceCount, 2);
        assert.ok(parsed.assembledUrl);
    });

    it("should return error for assemble_timeline action without videoUrls", async () => {
        const result = await handleEcommerceVideoGeneration({ action: "assemble_timeline" });
        assert.strictEqual((result as any).isError, true);
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "error");
        assert.ok(parsed.message.includes("Missing required field"));
    });

    it("should return error for unknown action", async () => {
        const result = await handleEcommerceVideoGeneration({ action: "unknown_action" });
        assert.strictEqual((result as any).isError, true);
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "error");
        assert.ok(parsed.message.includes("Unknown action"));
    });
});
