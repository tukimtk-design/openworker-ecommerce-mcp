import { describe, it } from "node:test";
import assert from "node:assert";
import { ProxyManager } from "../services/proxy-manager.js";

describe("Proxy Manager Service", () => {
    it("should cycle through proxies", () => {
        const pm = new ProxyManager([
            { server: "http://proxy1:8080" },
            { server: "http://proxy2:8080" }
        ]);

        const first = pm.getNextProxy();
        assert.strictEqual(first?.server, "http://proxy1:8080");

        const second = pm.getNextProxy();
        assert.strictEqual(second?.server, "http://proxy2:8080");

        const third = pm.getNextProxy();
        assert.strictEqual(third?.server, "http://proxy1:8080"); // cycles back
    });

    it("should allow adding and removing proxies", () => {
        const pm = new ProxyManager();
        assert.strictEqual(pm.getNextProxy(), null);

        pm.addProxy({ server: "http://proxy1:8080" });
        assert.strictEqual(pm.getNextProxy()?.server, "http://proxy1:8080");

        pm.removeProxy("http://proxy1:8080");
        assert.strictEqual(pm.getNextProxy(), null);
    });
});
