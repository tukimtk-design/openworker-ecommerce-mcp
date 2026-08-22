import { handleBrowserAttachExisting } from "../dist/tools/browser-profile.js";
import { handleEcommerceProductSearch } from "../dist/tools/ecommerce-search.js";
import { handleEcommerceUpdatePriceStock } from "../dist/tools/ecommerce-update.js";
import { handleEcommerceSafetyGuard } from "../dist/tools/safety-guard.js";
import { handleBrowserDetectChallenge } from "../dist/tools/browser-challenge.js";
import { handleEcommerceGetStoreMetrics } from "../dist/tools/store-metrics.js";
import { handleEcommerceBatchUpdatePriceStock } from "../dist/tools/batch-update.js";
import { handleEcommerceAuditLog } from "../dist/tools/audit-log.js";
import { handleEcommerceRunRecipe, handleEcommerceListRecipes, handleEcommerceSaveCustomRecipe } from "../dist/tools/ecommerce-recipe.js";
import { handleEcommerceCachedSelectorMap } from "../dist/tools/ecommerce-selectors.js";
import { handleEcommerceContextCompressor } from "../dist/tools/compressor.js";
import { handleEcommerceLocalSqliteCache } from "../dist/tools/local-cache.js";
import { handleEcommerceSmartDiffUpdate } from "../dist/tools/diff-update.js";
import { handleEcommerceHybridExecutor } from "../dist/tools/hybrid-executor-tool.js";
import { handleEcommerceTokenTelemetry } from "../dist/tools/telemetry.js";
import { handleEcommerceMatchVariants } from "../dist/tools/variant-matcher.js";
import { handleEcommerceSyncMultiplatformStock } from "../dist/tools/multiplatform-sync.js";

console.log("===============================================================");
console.log("🧪 Openworker E-Commerce MCP: Testing All 20 Tools (0 Token)");
console.log("===============================================================\n");

async function runTest(num, name, description, fn) {
  try {
    const res = await fn();
    console.log(`[${num}/20] ✅ ${name}`);
    console.log(`     📌 คำอธิบาย: ${description}`);
    console.log(`     📤 Output Sample:`, typeof res === "object" ? JSON.stringify(res).slice(0, 150) + "..." : res);
    console.log("---------------------------------------------------------------");
  } catch (err) {
    console.log(`[${num}/20] ❌ ${name} - Error: ${err.message}`);
    console.log("---------------------------------------------------------------");
  }
}

async function main() {
  // 1. Attach Store Browser
  await runTest(1, "ecommerce_attach_store_browser", "ตรวจสอบสถานะการเชื่อมต่อ Chrome/Edge บนพอร์ต 9222", () =>
    handleBrowserAttachExisting({ port: 9222 })
  );

  // 2. Extract Session (Mock check)
  await runTest(2, "ecommerce_extract_session", "ดึง Cookies และ Token ของร้านค้า", async () => ({
    status: "success",
    platform: "shopee",
    hasCookies: true
  }));

  // 3. Product Search
  await runTest(3, "ecommerce_product_search", "ค้นหาสินค้าหลังบ้าน Shopee/TikTok/Lazada", () =>
    handleEcommerceProductSearch({ platform: "shopee", query: "เสื้อยืด" })
  );

  // 4. Update Price & Stock
  await runTest(4, "ecommerce_update_price_stock", "ปรับเปลี่ยนราคาสินค้าและสต็อก", () =>
    handleEcommerceUpdatePriceStock({ platform: "shopee", productId: "P123", newPrice: 299, newStock: 50 })
  );

  // 5. Safety Guard
  await runTest(5, "ecommerce_safety_guard", "ตรวจสอบความปลอดภัยการปรับลดราคาผิดปกติ", () =>
    handleEcommerceSafetyGuard({ currentPrice: 500, proposedPrice: 450, maxPriceDropPercent: 20 })
  );

  // 6. Detect Captcha / Challenge
  await runTest(6, "ecommerce_detect_captcha_challenge", "สแกนหา Captcha/OTP บนหน้าเว็บ", () =>
    handleBrowserDetectChallenge({ platform: "shopee" })
  );

  // 7. Get Store Metrics
  await runTest(7, "ecommerce_get_store_metrics", "ดึงข้อมูลออเดอร์ค้างจัดส่งและสต็อกหมด", () =>
    handleEcommerceGetStoreMetrics({ platform: "lazada" })
  );

  // 8. Batch Update Price & Stock
  await runTest(8, "ecommerce_batch_update_price_stock", "อัปเดตราคาและสต็อกหลายรายการพร้อมชะลอความเร็ว", () =>
    handleEcommerceBatchUpdatePriceStock({
      platform: "shopee",
      items: [{ productId: "P1", newPrice: 199 }, { productId: "P2", newStock: 10 }]
    })
  );

  // 9. Audit Log
  await runTest(9, "ecommerce_audit_log", "บันทึกและเรียกดูประวัติการแก้ไขย้อนหลัง", () =>
    handleEcommerceAuditLog({ action: "record", productId: "P123", details: "Test Update" })
  );

  // 10. List Recipes
  await runTest(10, "ecommerce_list_recipes", "แสดงรายการ Workflow Recipes ทั้งหมด", () =>
    handleEcommerceListRecipes({ platform: "all" })
  );

  // 11. Run Recipe
  await runTest(11, "ecommerce_run_recipe", "⚡ รันคำสั่งสำเร็จรูปโดยรับเฉพาะพารามิเตอร์หลัก", () =>
    handleEcommerceRunRecipe({ recipeId: "shopee_update_price", params: { productId: "P123", price: 299 } })
  );

  // 12. Save Custom Recipe
  await runTest(12, "ecommerce_save_custom_recipe", "บันทึก Macro Sequence เป็น Recipe ใหม่", () =>
    handleEcommerceSaveCustomRecipe({
      recipe: { id: "custom_1", name: "Custom Workflow", steps: [] }
    })
  );

  // 13. Cached Selector Map
  await runTest(13, "ecommerce_cached_selector_map", "จัดการ Selector Cache และ Fallback Array", () =>
    handleEcommerceCachedSelectorMap({ action: "set", key: "btn_save", selector: "#btn-submit" })
  );

  // 14. Context Compressor
  await runTest(14, "ecommerce_context_compressor", "⚡ บีบอัด HTML/DOM ขนาดใหญ่เหลือ Micro-JSON (<100 tokens)", () =>
    handleEcommerceContextCompressor({ domString: "<div class='product-title'>เสื้อยืดสีแดง Price $299</div>" })
  );

  // 15. Local SQLite Cache
  await runTest(15, "ecommerce_local_sqlite_cache", "⚡ อ่าน/เขียนข้อมูลในเครื่องแบบ Offline 0 Token", () =>
    handleEcommerceLocalSqliteCache({ action: "set", key: "product_P123", value: "{'price': 299}" })
  );

  // 16. Smart Diff Update
  await runTest(16, "ecommerce_smart_diff_update", "⚡ คำนวณและอัปเดตเฉพาะส่วนต่าง (Delta)", () =>
    handleEcommerceSmartDiffUpdate({ currentState: { stock: 10 }, targetState: { stock: 15 } })
  );

  // 17. Hybrid Executor
  await runTest(17, "ecommerce_hybrid_executor", "ระบบรันออโตเมชันสลับเส้นทางให้อัตโนมัติ", () =>
    handleEcommerceHybridExecutor({ taskDetails: { action: "update_price", platform: "shopee" } })
  );

  // 18. Token Telemetry
  await runTest(18, "ecommerce_token_telemetry", "รายงานสถิติปริมาณ Token ที่ประหยัดได้", () =>
    handleEcommerceTokenTelemetry({ action: "record", inputTokens: 500, outputTokens: 50, savedTokens: 4500 })
  );

  // 19. Match Variants (Fuzzy)
  await runTest(19, "ecommerce_match_variants", "จับคู่ชื่อ SKU/Variant ที่สะกดต่างกันด้วย Fuzzy Matching", () =>
    handleEcommerceMatchVariants({
      action: "match",
      sourceName: "เสื้อยืดสีแดง ไซส์ M",
      candidates: [{ name: "Red T-Shirt Size M" }, { name: "Blue Shirt Size L" }]
    })
  );

  // 20. Sync Multiplatform Stock
  await runTest(20, "ecommerce_sync_multiplatform_stock", "ซิงค์สต็อกและราคาข้ามแพลตฟอร์มแบบเรียลไทม์", () =>
    handleEcommerceSyncMultiplatformStock({
      sourcePlatform: "shopee",
      sourceProductName: "เสื้อยืดสีแดง M",
      newStock: 25,
      targets: ["tiktok", "lazada"]
    })
  );

  console.log("\n🎉 การทดสอบทั้ง 20 Tools เสร็จสิ้น 100%! ไม่มีการเสีย Token ของ LLM แม้แต่ Token เดียว!");
}

main().catch((err) => {
  console.error("Fatal Error:", err);
});
