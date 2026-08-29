import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceOwLnwshopSafeSeoUpdater } from "../tools/lnwshop-seo-updater.js";

describe("Ow Lnwshop Safe SEO Updater Tool", () => {
  it("should successfully update with valid SEO data", async () => {
    const args = {
      platform: "lnwshop",
      productId: "LNW-123",
      metaTitle: "Safe Product Title",
      metaKeywords: ["keyword1", "keyword2"],
      metaDescription: "This is a safe description."
    };
    const result = await handleEcommerceOwLnwshopSafeSeoUpdater(args);
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "success");
    assert.strictEqual(parsed.data.productId, "LNW-123");
  });

  it("should fail-closed if platform is not lnwshop", async () => {
    const args = {
      platform: "shopee",
      productId: "LNW-123",
      metaTitle: "Title"
    };
    const result = await handleEcommerceOwLnwshopSafeSeoUpdater(args);
    assert.strictEqual((result as any).isError, true);
    assert.ok((result as any).content[0].text.includes("แพลตฟอร์มไม่รองรับ"));
  });

  it("should fail-closed if metaTitle has HTML tags", async () => {
    const args = {
      platform: "lnwshop",
      productId: "LNW-123",
      metaTitle: "Title <script>alert(1)</script>"
    };
    const result = await handleEcommerceOwLnwshopSafeSeoUpdater(args);
    assert.strictEqual((result as any).isError, true);
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "error");
    assert.ok(parsed.message.includes("ห้ามมี HTML tags"));
  });

  it("should fail-closed if metaTitle is too long", async () => {
    const args = {
      platform: "lnwshop",
      productId: "LNW-123",
      metaTitle: "T".repeat(71)
    };
    const result = await handleEcommerceOwLnwshopSafeSeoUpdater(args);
    assert.strictEqual((result as any).isError, true);
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "error");
    assert.ok(parsed.message.includes("ยาวเกินไป"));
  });

  it("should fail-closed if metaKeywords has HTML tags", async () => {
    const args = {
      platform: "lnwshop",
      productId: "LNW-123",
      metaKeywords: ["safe", "<span>unsafe</span>"]
    };
    const result = await handleEcommerceOwLnwshopSafeSeoUpdater(args);
    assert.strictEqual((result as any).isError, true);
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "error");
    assert.ok(parsed.message.includes("ห้ามมี HTML tags"));
  });

  it("should fail-closed if metaKeywords array has too many items", async () => {
    const args = {
      platform: "lnwshop",
      productId: "LNW-123",
      metaKeywords: Array.from({ length: 16 }, (_, i) => `kw${i}`)
    };
    const result = await handleEcommerceOwLnwshopSafeSeoUpdater(args);
    assert.strictEqual((result as any).isError, true);
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "error");
    assert.ok(parsed.message.includes("มากเกินไป"));
  });
});
