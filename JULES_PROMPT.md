# Directives for Jules (Google AI Developer Agent)

สวัสดี Jules! คุณได้รับมอบหมายให้เป็นผู้พัฒนาหลัก (Primary Developer) ของโปรเจกต์ **openworker-ecommerce-mcp** 
โดยมีหน้าที่เขียนโค้ด TypeScript, พัฒนา MCP Tools แต่ละตัวตามข้อกำหนด และเขียน Unit Tests สำหรับระบบ

---

## 🎯 เป้าหมายของโปรเจกต์ (Project Goal)

พัฒนา **MCP Server** สำหรับให้ **Openworker** สามารถสั่งงาน Chrome หรือ Microsoft Edge ของผู้ใช้เพื่อบริหารจัดการและอัปเดตข้อมูลสินค้าบน **Shopee, TikTok Shop และ Lazada** ได้อย่างรวดเร็ว แม่นยำ ปลอดภัย และ**ลดการสิ้นเปลือง Token ถึงขีดสุดด้วย Recipe & Compression Engine**

---

## 📋 รายการงานที่ Jules ต้องดำเนินการ (Development Tasks)

โปรดดำเนินการตามลำดับใน `docs/TASKS.md`:

### Phase 1: Core Infra & CDP Attachment (Issue #1)
- พัฒนา `src/services/cdp-connection.ts` และ `src/tools/browser-profile.ts` (`browser_attach_existing`)

### Phase 2: Session Extractor & API Interceptor (Issue #2)
- พัฒนา `src/services/session-extractor.ts` และ `src/services/api-client.ts` (`ecommerce_extract_session`)

### Phase 3: High-Level MCP Tools (Issue #3)
- พัฒนา `src/tools/ecommerce-search.ts`, `src/tools/ecommerce-update.ts`, `src/tools/safety-guard.ts`

### Phase 4: Human-in-the-Loop, Store Metrics & Batch Tools (Issue #4)
- พัฒนา `src/tools/browser-challenge.ts`, `src/tools/store-metrics.ts`, `src/tools/batch-update.ts`, `src/tools/audit-log.ts`

### Phase 5: Smart Workflow Recipe Engine (Issue #5)
- พัฒนา `src/tools/ecommerce-recipe.ts` (`ecommerce_run_recipe`, `ecommerce_list_recipes`, `ecommerce_save_custom_recipe`, `ecommerce_cached_selector_map`)

### Phase 6: Advanced Capabilities & Context Compression Engine (Issue #6 - ✨ New!)
1. พัฒนา `src/services/dom-compressor.ts` & `src/tools/compressor.ts`:
   - `ecommerce_context_compressor`: บีบอัด DOM หน้าเว็บเหลือ Micro-JSON (<100 tokens)
2. พัฒนา `src/services/sqlite-store.ts` & `src/tools/local-cache.ts`:
   - `ecommerce_local_sqlite_cache`: ฐานข้อมูลแคชสินค้าและออเดอร์ในเครื่อง อ่านข้อมูลได้ทันทีโดยไม่ต้องเปิดเว็บ
3. พัฒนา `src/tools/diff-update.ts`:
   - `ecommerce_smart_diff_update`: อัปเดตข้อมูลเฉพาะส่วนต่าง Delta (เช่น deltaStock: -2)
4. พัฒนา `src/services/hybrid-executor.ts`:
   - `ecommerce_hybrid_executor`: Fast API -> CDP Fallback -> Human Alert
5. พัฒนา `src/tools/telemetry.ts`:
   - `ecommerce_token_telemetry`: Dashboard ติดตามการประหยัด Token และประสิทธิภาพ

---

## 🛠️ กฎการเขียนโค้ด (Coding Conventions & Rules)

1. **TypeScript Strict Mode**: เขียนโค้ดในรูปแบบ Strict Mode ห้ามใช้ `any` โดยไม่จำเป็น ให้ใช้ Zod Schemas หรือ explicit interfaces ใน `src/types.ts`
2. **ES Modules Only**: โปรเจกต์ใช้ `"type": "module"` ดังนั้น import ต้องระบุส่วนขยาย เช่น `import { CdpConnection } from "./services/cdp-connection.js";`
3. **Error Handling & Resilience**: 
   - หากเชื่อมต่อ Chrome/Edge บนพอร์ต 9222 ไม่สำเร็จ ให้ส่งคืน Error Message ภาษาไทยชัดเจน พร้อมคำแนะนำการเปิด Chrome ด้วย `--remote-debugging-port=9222`
4. **MCP SDK Protocol**: ใช้อนุสัญญาของ `@modelcontextprotocol/sdk` เวอร์ชันล่าสุดในการประกาศ Tools (`server.setRequestHandler(ListToolsRequestSchema, ...)` และ `CallToolRequestSchema`)

---

## 📬 ขั้นตอนการส่งงาน (Work Delivery Process)

1. สร้าง Branch ใหม่ตามชื่อฟีเจอร์ เช่น `feature/compression-engine` หรือ `feature/local-cache`
2. เมื่อเขียนโค้ดและทดสอบผ่าน `npm run build` สำเร็จแล้ว ให้ทำการ Commit และเปิด Pull Request (PR) มายัง `main`
3. Controller Agent (Cowork) จะทำการ Review, Test และ Merge เข้าสู่ branch หลักเพื่อเตรียม Deploy ต่อไป
