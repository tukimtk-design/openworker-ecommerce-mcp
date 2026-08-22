# Development Tasks & Roadmap for Jules

รายการงานสำหรับพัฒนา **openworker-ecommerce-mcp** ซึ่ง Jules (Google AI Agent) สามารถรับไปทำทีละชุดผ่าน Pull Request (PR) ได้:

---

## 🟢 Phase 1: Core Setup & CDP Infrastructure
- [ ] **Task 1.1**: พัฒนา `src/types.ts` นิยามสเปกและ Zod Schemas ของ Tools ทั้งหมด
- [ ] **Task 1.2**: พัฒนา `src/services/cdp-connection.ts` สำหรับการเชื่อมต่อ Chrome/Edge ทาง WebSocket/HTTP CDP
- [ ] **Task 1.3**: พัฒนา `src/tools/browser-profile.ts` และลงทะเบียน Tool `browser_attach_existing` ใน `src/index.ts`

---

## 🟡 Phase 2: Session Extraction & API Interception
- [ ] **Task 2.1**: พัฒนา `src/services/session-extractor.ts` ดึง Cookies/Headers จาก Shopee, TikTok Shop, Lazada Tabs
- [ ] **Task 2.2**: พัฒนา `src/services/api-client.ts` สร้าง HTTP Helper ส่งคำสั่ง API อัปเดตราคาและสต็อก
- [ ] **Task 2.3**: ทดสอบการยิง API สั่งแก้ไขสต็อกบน Sandbox หรือ Mock Response

---

## 🔵 Phase 3: E-Commerce Search, Update & Safety Tools
- [ ] **Task 3.1**: พัฒนา `src/tools/ecommerce-search.ts` สำหรับการค้นหาสินค้าตาม SKU
- [ ] **Task 3.2**: พัฒนา `src/tools/ecommerce-update.ts` สำหรับอัปเดตราคา/สต็อก
- [ ] **Task 3.3**: พัฒนา `src/tools/safety-guard.ts` สำหรับตรวจสอบความปลอดภัยของราคา

---

## 🔴 Phase 4: Human-in-the-Loop, Store Metrics & Batch Tools
- [ ] **Task 4.1**: พัฒนา `src/tools/browser-challenge.ts` สำหรับสแกน Captcha/OTP และแจ้งเตือนมนุษย์ (`browser_detect_challenge`)
- [ ] **Task 4.2**: พัฒนา `src/tools/store-metrics.ts` สรุปออเดอร์ค้างและสินค้าสต็อกหมด (`ecommerce_get_store_metrics`)
- [ ] **Task 4.3**: พัฒนา `src/tools/batch-update.ts` รองรับการอัปเดตสินค้าครั้งละหลายรายการพร้อม Throttling (`ecommerce_batch_update_price_stock`)
- [ ] **Task 4.4**: พัฒนา `src/tools/audit-log.ts` บันทึกประวัติการเปลี่ยนราคาสินค้าเพื่อตรวจสอบย้อนหลัง (`ecommerce_audit_log`)

---

## ⚡ Phase 5: Smart Workflow Recipe Engine & Token Saver Tools (✨ ใหม่)
- [ ] **Task 5.1**: พัฒนา `src/services/recipe-runner.ts` และ `src/tools/ecommerce-recipe.ts` สำหรับรันคำสั่งสำเร็จรูป (`ecommerce_run_recipe`) ลด Token >95%
- [ ] **Task 5.2**: พัฒนาระบบแสดงรายการพารามิเตอร์ของ Recipe (`ecommerce_list_recipes`)
- [ ] **Task 5.3**: พัฒนาระบบบันทึก Macro / Custom Recipe จาก AI (`ecommerce_save_custom_recipe`)
- [ ] **Task 5.4**: พัฒนา Dictionary สำหรับจัดการ Selector Cache (`ecommerce_cached_selector_map`)

---

## 🟣 Phase 6: Integration, Build & CI/CD
- [ ] **Task 6.1**: รวมทุก Tools ทั้งหมดใน `src/index.ts` และทดสอบ `npm run build`
- [ ] **Task 6.2**: เขียน Unit Tests สำหรับ Recipes และ Tools ใน `src/**/*.test.ts`
- [ ] **Task 6.3**: ตรวจสอบความสมบูรณ์และส่ง Pull Request มายัง Controller
