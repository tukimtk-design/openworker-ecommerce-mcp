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

## 🔵 Phase 3: E-Commerce Tools Implementation
- [ ] **Task 3.1**: พัฒนา `src/tools/ecommerce-search.ts` สำหรับการค้นหาสินค้าตาม SKU
- [ ] **Task 3.2**: พัฒนา `src/tools/ecommerce-update.ts` สำหรับอัปเดตราคา/สต็อก
- [ ] **Task 3.3**: พัฒนา `src/tools/safety-guard.ts` สำหรับตรวจสอบความปลอดภัยของราคา

---

## 🟣 Phase 4: Integration, Build & CI/CD
- [ ] **Task 4.1**: รวมทุก Tools ไว้ใน `src/index.ts` และทดสอบ `npm run build`
- [ ] **Task 4.2**: เขียน Unit Tests ใน `src/**/*.test.ts`
- [ ] **Task 4.3**: ตรวจสอบความสมบูรณ์และส่ง Pull Request มายัง Controller
