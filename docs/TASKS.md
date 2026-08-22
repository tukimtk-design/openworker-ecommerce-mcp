# Development Tasks & Roadmap for Jules (Hybrid Non-Overlapping Architecture)

รายการงานสำหรับพัฒนา **openworker-ecommerce-mcp** โดยใช้ Prefix **`ecommerce_*`** ทุกเครื่องมือ ป้องกัน AI สับสนกับ **lnwjud**:

---

## 🟢 Phase 1: Core E-Commerce Browser Attachment (Issue #1)
- [ ] **Task 1.1**: พัฒนา `src/types.ts` นิยามสเปกและ Zod Schemas ของ Tools ทั้งหมด
- [ ] **Task 1.2**: พัฒนา `src/services/cdp-connection.ts` สำหรับการเชื่อมต่อ Chrome/Edge ทาง WebSocket/HTTP CDP
- [ ] **Task 1.3**: พัฒนา `src/tools/browser-profile.ts` และลงทะเบียน Tool `ecommerce_attach_store_browser` ใน `src/index.ts`

---

## 🟡 Phase 2: Session Extraction & API Interception (Issue #2)
- [ ] **Task 2.1**: พัฒนา `src/services/session-extractor.ts` ดึง Cookies/Headers จาก Shopee, TikTok Shop, Lazada Tabs (`ecommerce_extract_session`)
- [ ] **Task 2.2**: พัฒนา `src/services/api-client.ts` สร้าง HTTP Helper ยิง API ตรง (`ecommerce_api_request_helper`)

---

## 🔵 Phase 3: E-Commerce Search, Update & Safety Tools (Issue #3)
- [ ] **Task 3.1**: พัฒนา `src/tools/ecommerce-search.ts` สำหรับการค้นหาสินค้าตาม SKU (`ecommerce_product_search`)
- [ ] **Task 3.2**: พัฒนา `src/tools/ecommerce-update.ts` สำหรับอัปเดตราคา/สต็อก (`ecommerce_update_price_stock`)
- [ ] **Task 3.3**: พัฒนา `src/tools/safety-guard.ts` สำหรับตรวจสอบความปลอดภัยของราคา (`ecommerce_safety_guard`)

---

## 🔴 Phase 4: Human-in-the-Loop, Store Metrics & Batch Tools (Issue #4)
- [ ] **Task 4.1**: พัฒนา `src/tools/browser-challenge.ts` สแกน Captcha/OTP (`ecommerce_detect_captcha_challenge`)
- [ ] **Task 4.2**: พัฒนา `src/tools/store-metrics.ts` สรุปออเดอร์ค้างและสต็อกหมด (`ecommerce_get_store_metrics`)
- [ ] **Task 4.3**: พัฒนา `src/tools/batch-update.ts` อัปเดตสินค้าแบบ Batch พร้อม Throttling (`ecommerce_batch_update_price_stock`)
- [ ] **Task 4.4**: พัฒนา `src/tools/audit-log.ts` บันทึกประวัติการเปลี่ยนราคาสินค้า (`ecommerce_audit_log`)

---

## ⚡ Phase 5: Smart Workflow Recipe Engine (Token Saver Level 1) (Issue #5)
- [ ] **Task 5.1**: พัฒนา `src/tools/ecommerce-recipe.ts` สำหรับรันคำสั่งสำเร็จรูป (`ecommerce_run_recipe`) ลด Token >95%
- [ ] **Task 5.2**: พัฒนาระบบแสดงรายการพารามิเตอร์ของ Recipe (`ecommerce_list_recipes`)
- [ ] **Task 5.3**: พัฒนาระบบบันทึก Macro / Custom Recipe จาก AI (`ecommerce_save_custom_recipe`)
- [ ] **Task 5.4**: พัฒนา Dictionary สำหรับจัดการ Selector Cache (`ecommerce_cached_selector_map`)

---

## 💎 Phase 6: Advanced Capabilities & Context Compression Engine (Token Saver Level 2) (Issue #6)
- [ ] **Task 6.1**: พัฒนา `src/tools/compressor.ts` บีบอัด DOM หน้าเว็บเหลือ Micro-JSON <100 tokens (`ecommerce_context_compressor`)
- [ ] **Task 6.2**: พัฒนา `src/tools/local-cache.ts` อ่าน/เขียนแคชสินค้าในเครื่อง (`ecommerce_local_sqlite_cache`)
- [ ] **Task 6.3**: พัฒนา `src/tools/diff-update.ts` อัปเดตเฉพาะส่วนต่าง Delta (`ecommerce_smart_diff_update`)
- [ ] **Task 6.4**: พัฒนา `src/services/hybrid-executor.ts` สลับเส้นทางรันอัตโนมัติ (`ecommerce_hybrid_executor`)
- [ ] **Task 6.5**: พัฒนา `src/tools/telemetry.ts` ติดตามสถิติการประหยัด Token (`ecommerce_token_telemetry`)
