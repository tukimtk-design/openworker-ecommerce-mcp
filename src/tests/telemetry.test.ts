import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceTokenTelemetry } from "../tools/telemetry.js";

describe("Token Telemetry Tool", () => {
    it("should record and get telemetry", async () => {
        await handleEcommerceTokenTelemetry({ action: "record", inputTokens: 10, outputTokens: 20 });
        const result = await handleEcommerceTokenTelemetry({ action: "get" });
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.ok(parsed.usage.inputTokens >= 10);
        assert.ok(parsed.usage.outputTokens >= 20);
    });
});
