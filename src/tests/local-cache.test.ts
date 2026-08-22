import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceLocalSqliteCache } from "../tools/local-cache.js";

describe("Local SQLite Cache Tool", () => {
    it("should set and get a value", async () => {
        const setResult = await handleEcommerceLocalSqliteCache({ action: "set", key: "test_key", value: "test_value" });
        const setParsed = JSON.parse((setResult as any).content[0].text);
        assert.strictEqual(setParsed.status, "success");

        const getResult = await handleEcommerceLocalSqliteCache({ action: "get", key: "test_key" });
        const getParsed = JSON.parse((getResult as any).content[0].text);
        assert.strictEqual(getParsed.value, "test_value");
    });
});
