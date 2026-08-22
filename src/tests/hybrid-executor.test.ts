import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceHybridExecutor } from "../tools/hybrid-executor-tool.js";

describe("Hybrid Executor Tool", () => {
    it("should execute task", async () => {
        const result = await handleEcommerceHybridExecutor({ taskDetails: { action: "update" } });
        const parsed = JSON.parse((result as any).content[0].text);
        assert.ok(["api", "cdp", "human"].includes(parsed.method));
    });
});
