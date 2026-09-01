import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceTokenTelemetry } from "../tools/telemetry.js";

describe("Token Telemetry Tool", () => {
    it("should record and get telemetry", async () => {
        const recordResult = await handleEcommerceTokenTelemetry({ action: "record", inputTokens: 10, outputTokens: 20 });
        const recorded = JSON.parse((recordResult as any).content[0].text);
        assert.strictEqual(recorded.status, "recorded");
        assert.strictEqual(recorded.usage.inputTokens, 10);
        assert.strictEqual(recorded.usage.outputTokens, 20);

        const result = await handleEcommerceTokenTelemetry({ action: "get" });
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.usage.inputTokens, 10);
        assert.strictEqual(parsed.usage.outputTokens, 20);
    });
});
