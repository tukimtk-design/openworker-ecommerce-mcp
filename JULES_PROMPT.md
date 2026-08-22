# Directives for Jules (Google AI Developer Agent)

สวัสดี Jules! คุณได้รับมอบหมายให้เป็นผู้พัฒนาหลัก (Primary Developer) ของโปรเจกต์ **openworker-ecommerce-mcp** 

⚠️ **กฎเหล็กที่สำคัญที่สุด (Strict Hybrid Rule):**
เพื่อไม่ให้ AI สับสนในการเลือกใช้ Tools ระหว่าง **lnwjud** (ที่เป็น System Provider) และ **openworker-ecommerce-mcp**:
- **ทุก Tool ในโปรเจกต์นี้ต้องขึ้นต้นด้วย Prefix `ecommerce_*` เท่านั้น**
- ห้ามใช้ชื่อเครื่องมือที่ขึ้นต้นด้วย `browser_*`, `file_*`, `git_*`, `shell_*` หรือ `process_*` เป็นอันขาด

---

## 🎯 เป้าหมายของโปรเจกต์ (Project Goal)

พัฒนา **MCP Server** สำหรับให้ **Openworker** สามารถสั่งงาน Chrome หรือ Microsoft Edge ของผู้ใช้เพื่อบริหารจัดการและอัปเดตข้อมูลสินค้าบน **Shopee, TikTok Shop และ Lazada** ได้อย่างรวดเร็ว แม่นยำ ปลอดภัย และ**ลดการสิ้นเปลือง Token ถึงขีดสุด**

---

## 📋 รายการงานที่ Jules ต้องดำเนินการ (Development Tasks)

โปรดดำเนินการตามลำดับใน `docs/TASKS.md`:

### Phase 1: Core Infra & CDP Attachment (Issue #1)
- พัฒนา `src/services/cdp-connection.ts` และ `src/tools/browser-profile.ts` (`ecommerce_attach_store_browser`)

### Phase 2: Session Extractor & API Interceptor (Issue #2)
- พัฒนา `src/services/session-extractor.ts` และ `src/services/api-client.ts` (`ecommerce_extract_session`, `ecommerce_api_request_helper`)

### Phase 3: High-Level MCP Tools (Issue #3)
- พัฒนา `src/tools/ecommerce-search.ts`, `src/tools/ecommerce-update.ts`, `src/tools/safety-guard.ts` (`ecommerce_product_search`, `ecommerce_update_price_stock`, `ecommerce_safety_guard`)

### Phase 4: Human-in-the-Loop, Store Metrics & Batch Tools (Issue #4)
- พัฒนา `src/tools/browser-challenge.ts`, `src/tools/store-metrics.ts`, `src/tools/batch-update.ts`, `src/tools/audit-log.ts` (`ecommerce_detect_captcha_challenge`, `ecommerce_get_store_metrics`, `ecommerce_batch_update_price_stock`, `ecommerce_audit_log`)

### Phase 5: Smart Workflow Recipe Engine (Issue #5)
- พัฒนา `src/tools/ecommerce-recipe.ts` (`ecommerce_run_recipe`, `ecommerce_list_recipes`, `ecommerce_save_custom_recipe`, `ecommerce_cached_selector_map`)

### Phase 6: Advanced Capabilities & Context Compression Engine (Issue #6)
- พัฒนา `ecommerce_context_compressor`, `ecommerce_local_sqlite_cache`, `ecommerce_smart_diff_update`, `ecommerce_hybrid_executor`, `ecommerce_token_telemetry`

---

## 🛠️ กฎการเขียนโค้ด (Coding Conventions & Rules)

1. **Strict Namespace**: ทุก Tool ต้องใช้ Prefix `ecommerce_*` เท่านั้น
2. **TypeScript Strict Mode**: เขียนโค้ดในรูปแบบ Strict Mode ห้ามใช้ `any` โดยไม่จำเป็น ให้ใช้ Zod Schemas ใน `src/types.ts`
3. **ES Modules Only**: โปรเจกต์ใช้ `"type": "module"` ดังนั้น import ต้องระบุส่วนขยาย เช่น `import { CdpConnection } from "./services/cdp-connection.js";`
4. **Error Handling & Resilience**: 
   - หากเชื่อมต่อ Chrome/Edge บนพอร์ต 9222 ไม่สำเร็จ ให้ส่งคืน Error Message ภาษาไทยชัดเจน พร้อมคำแนะนำการเปิด Chrome ด้วย `--remote-debugging-port=9222`
5. **MCP SDK Protocol**: ใช้อนุสัญญาของ `@modelcontextprotocol/sdk` เวอร์ชันล่าสุดในการประกาศ Tools
