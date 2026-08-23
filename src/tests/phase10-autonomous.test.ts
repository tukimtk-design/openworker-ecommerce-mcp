import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceAutonomousStoreManager } from "../tools/store-agent-tool.js";
import { handleEcommerceCloneProduct } from "../tools/product-cloner.js";
import { handleEcommerceAutoReplyChat } from "../tools/chat-automation.js";
import { handleEcommerceGetPendingOrders, handleEcommerceFulfillOrder } from "../tools/order-fulfillment.js";
import { handleEcommerceManagePromotions } from "../tools/promotion-manager.js";
import { handleEcommerceSyncProductImages } from "../tools/asset-sync.js";

describe("Phase 10: Autonomous Tools", () => {
    it("should manage the autonomous store agent loop", async () => {
        let result = await handleEcommerceAutonomousStoreManager({ action: "start", intervalMs: 1000 });
        let parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");

        result = await handleEcommerceAutonomousStoreManager({ action: "status" });
        parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.data.isRunning, true);

        result = await handleEcommerceAutonomousStoreManager({ action: "trigger_now" });
        parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.ok(parsed.result.tasksExecuted.includes("chat_replied"));

        result = await handleEcommerceAutonomousStoreManager({ action: "stop" });
        parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
    });

    it("should clone products across platforms", async () => {
        const result = await handleEcommerceCloneProduct({
            sourceUrl: "http://example.com/product",
            targetPlatforms: ["shopee", "lazada"],
            translationTemplate: "NEW: {title}"
        });
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.clones.length, 2);
        assert.ok(parsed.clones[0].clonedTitle.includes("NEW:"));
    });

    it("should manage chat automation", async () => {
        let result = await handleEcommerceAutoReplyChat({ platform: "shopee", action: "fetch_unread" });
        let parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.ok(parsed.messages.length > 0);

        result = await handleEcommerceAutoReplyChat({ platform: "shopee", action: "reply", messageId: "M1", replyText: "Hello" });
        parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
    });

    it("should manage order fulfillment", async () => {
        let result = await handleEcommerceGetPendingOrders({ platform: "lazada" });
        let parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.ok(parsed.pendingOrders.length > 0);

        result = await handleEcommerceFulfillOrder({ platform: "lazada", orderId: "ORD-123" });
        parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
    });

    it("should manage promotions", async () => {
        let result = await handleEcommerceManagePromotions({ platform: "tiktok", action: "list" });
        let parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.ok(parsed.promotions.length > 0);

        result = await handleEcommerceManagePromotions({ platform: "tiktok", action: "create", promoDetails: { name: "Sale" } });
        parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
    });

    it("should sync product images", async () => {
        const result = await handleEcommerceSyncProductImages({
            sourcePlatform: "shopee",
            targetPlatforms: ["lazada"],
            productId: "P1"
        });
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.results.length, 1);
    });
});
