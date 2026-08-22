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

## 🔴 Phase 4: Human-in-the-Loop, Store Metrics & Batch Tools (✨ เพิ่มเติม)
- [ ] **Task 4.1**: พัฒนา `src/tools/browser-challenge.ts` สำหรับสแกน Captcha/OTP และแจ้งเตือนมนุษย์ (`browser_detect_challenge`)
- [ ] **Task 4.2**: พัฒนา `src/tools/store-metrics.ts` สรุปออเดอร์ค้างและสินค้าสต็อกหมด (`ecommerce_get_store_metrics`)
- [ ] **Task 4.3**: พัฒนา `src/tools/batch-update.ts` รองรับการอัปเดตสินค้าครั้งละหลายรายการพร้อม Throttling (`ecommerce_batch_update_price_stock`)
- [ ] **Task 4.4**: พัฒนา `src/tools/audit-log.ts` บันทึกประวัติการเปลี่ยนราคาสินค้าเพื่อตรวจสอบย้อนหลัง (`ecommerce_audit_log`)

---

## 🟣 Phase 5: Integration, Build & CI/CD
- [ ] **Task 5.1**: รวมทุก Tools ไว้ใน `src/index.ts` และทดสอบ `npm run build`
- [ ] **Task 5.2**: เขียน Unit Tests ใน `src/**/*.test.ts`
- [ ] **Task 5.3**: ตรวจสอบความสมบูรณ์และส่ง Pull Request มายัง Controller

---

## 🟢 Phase 7: Production Hardening & Seamless Windows Integration
- [x] **Task 7.1**: Openworker Auto-Installer & Config Generator
- [x] **Task 7.2**: Mock E-Commerce Seller Portal Server (Playwright Mocking)
- [x] **Task 7.3**: Persistent Data Storage Path & SQLite Auto-Migration
- [x] **Task 7.4**: DOM Selector Auto-Healing Fallback

---

## 🟢 Phase 8: Multi-Platform Stock Sync & Variant Matching
- [x] **Task 8.1**: Real-Time Multi-Platform Stock Sync Tool (`ecommerce_sync_multiplatform_stock`)
- [x] **Task 8.2**: Fuzzy Variant Matching Tool (`ecommerce_match_variants`)
- [x] **Task 8.3**: Integration & Unit Tests
