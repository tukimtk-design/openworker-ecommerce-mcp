# Directives for Jules (Google AI Developer Agent)

สวัสดี Jules! คุณได้รับมอบหมายให้เป็นผู้พัฒนาหลัก (Primary Developer) ของโปรเจกต์ **openworker-ecommerce-mcp** 
โดยมีหน้าที่เขียนโค้ด TypeScript, พัฒนา MCP Tools แต่ละตัวตามข้อกำหนด และเขียน Unit Tests สำหรับระบบ

---

## 🎯 เป้าหมายของโปรเจกต์ (Project Goal)

พัฒนา **MCP Server** สำหรับให้ **Openworker** สามารถสั่งงาน Chrome หรือ Microsoft Edge ของผู้ใช้เพื่อบริหารจัดการและอัปเดตข้อมูลสินค้าบน **Shopee, TikTok Shop และ Lazada** ได้อย่างรวดเร็ว แม่นยำ และปลอดภัย

---

## 📋 รายการงานที่ Jules ต้องดำเนินการ (Development Tasks)

โปรดดำเนินการตามลำดับใน `docs/TASKS.md`:

### Phase 1: Core Infra & CDP Attachment
1. พัฒนา `src/services/cdp-connection.ts`:
   - ใช้ `playwright` หรือ `puppeteer-core` เพื่อเชื่อมต่อกับ `http://localhost:9222` ผ่าน CDP (`connectOverCDP`)
   - สร้างฟังก์ชันค้นหา Active Tab ของ Shopee Seller Centre (`seller.shopee.co.th`), TikTok Shop Seller Center (`seller-th.tiktok.com`), และ Lazada Seller Center (`sellercenter.lazada.co.th`)
2. พัฒนา `src/tools/browser-profile.ts`:
   - พัฒนา MCP Tool `browser_attach_existing` เพื่อตรวจเช็คสถานะการเชื่อมต่อ และส่งคืนรายชื่อ Tab ร้านค้าที่เปิดล็อกอินอยู่

### Phase 2: Session Extractor & API Interceptor
1. พัฒนา `src/services/session-extractor.ts`:
   - ดึง Cookies, CSRF Tokens (`x-csrf-token`), และ Authorization Bearer จาก Tab ร้านค้าที่เปิดอยู่
2. พัฒนา `src/services/api-client.ts`:
   - สร้าง HTTP Client สำหรับส่งคำสั่งไปยัง Internal REST/GraphQL Endpoints ของแต่ละแพลตฟอร์มเพื่อแก้ไขราคาสินค้าและสต็อกโดยตรง

### Phase 3: High-Level MCP Tools
1. พัฒนา `src/tools/ecommerce-search.ts`:
   - MCP Tool `ecommerce_product_search`: ค้นหาสินค้าจาก SKU ID, Item ID หรือชื่อสินค้า
2. พัฒนา `src/tools/ecommerce-update.ts`:
   - MCP Tool `ecommerce_update_price_stock`: ปรับเปลี่ยนราคาสินค้าและจำนวนสต็อกแยกตาม Variant SKU
3. พัฒนา `src/tools/safety-guard.ts`:
   - MCP Tool `ecommerce_safety_guard`: ตรวจสอบความถูกต้องของราคาและสต็อกก่อนส่งคำสั่ง Save (เช่น เตือนเมื่อราคาสินค้าลดลงเกิน 50%)

---

## 🛠️ กฎการเขียนโค้ด (Coding Conventions & Rules)

1. **TypeScript Strict Mode**: เขียนโค้ดในรูปแบบ Strict Mode ห้ามใช้ `any` โดยไม่จำเป็น ให้ใช้ Zod Schemas หรือ explicit interfaces ใน `src/types.ts`
2. **ES Modules Only**: โปรเจกต์ใช้ `"type": "module"` ดังนั้น import ต้องระบุส่วนขยาย เช่น `import { CdpConnection } from "./services/cdp-connection.js";`
3. **Error Handling & Resilience**: 
   - หากเชื่อมต่อ Chrome/Edge บนพอร์ต 9222 ไม่สำเร็จ ให้ส่งคืน Error Message ภาษาไทยชัดเจน พร้อมคำแนะนำการเปิด Chrome ด้วย `--remote-debugging-port=9222`
4. **MCP SDK Protocol**: ใช้อนุสัญญาของ `@modelcontextprotocol/sdk` เวอร์ชันล่าสุดในการประกาศ Tools (`server.setRequestHandler(ListToolsRequestSchema, ...)` และ `CallToolRequestSchema`)

---

## 📬 ขั้นตอนการส่งงาน (Work Delivery Process)

1. สร้าง Branch ใหม่ตามชื่อฟีเจอร์ เช่น `feature/cdp-connection` หรือ `feature/ecommerce-tools`
2. เมื่อเขียนโค้ดและทดสอบผ่าน `npm run build` สำเร็จแล้ว ให้ทำการ Commit และเปิด Pull Request (PR) มายัง `main`
3. Controller Agent (Cowork) จะทำการ Review, Test และ Merge เข้าสู่ branch หลักเพื่อเตรียม Deploy ต่อไป
