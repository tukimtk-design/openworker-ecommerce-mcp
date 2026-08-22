# System Architecture & Non-Overlapping Hybrid Tool Contracts

## 1. Hybrid Architecture & Tool Namespace Isolation

เพื่อป้องกันไม่ให้ AI สับสนในการเลือกใช้ Tools ระหว่าง **lnwjud** (System & Browser Baseline) และ **openworker-ecommerce-mcp** (E-Commerce Domain Specialty):

1. **lnwjud (System Capabilities Provider)**: รับผิดชอบงานระบบพื้นฐาน เช่น `file_*`, `git_*`, `shell_*`, `process_*`, `browser_*` (Playwright Generic), `dom_cdp`
2. **openworker-ecommerce-mcp (Domain Specialty Provider)**: ทุก Tool ในโปรเจกต์นี้จะถูกกำหนด Prefix บังคับเป็น **`ecommerce_*`** เพื่อเจาะจงเฉพาะงาน Shopee, TikTok Shop และ Lazada เท่านั้น ห้ามใช้ชื่อซ้ำกับ `browser_*` ของ lnwjud

```
+-----------------------------------------------------------------------------------+
|                                   Openworker                                      |
|                       (AI Agent Orchestrator & UI Layer)                          |
+-----------------------------------------------------------------------------------+
                                         |
               +-------------------------+-------------------------+
               | (MCP Protocol)                                    | (MCP Protocol)
               v                                                   v
+------------------------------------+             +------------------------------------+
|          lnwjud Runtime            |             |     openworker-ecommerce-mcp       |
|    - file_*, git_*, shell_*        |             |    - ecommerce_attach_store_browser|
|    - process_*, browser_*          |             |    - ecommerce_extract_session     |
|    - dom_cdp, accessibility        |             |    - ecommerce_detect_captcha      |
|    - window, vision                |             |    - ecommerce_run_recipe          |
|    (System Baseline Capabilities)  |             |    - ecommerce_context_compressor   |
+------------------------------------+             +------------------------------------+
```

---

## 2. Complete Non-Overlapping Tool Contract Specification (19 Tools)

### Phase 1: Core E-Commerce Browser Attachment
* **`ecommerce_attach_store_browser`**: เชื่อมต่อ Chrome/Edge Port 9222 และระบุเฉพาะ Tab ร้านค้า Shopee, TikTok Shop, Lazada (ไม่ซ้ำกับ `browser_*` ทั่วไป)

### Phase 2: Session Extraction & API Interception
* **`ecommerce_extract_session`**: ดึง Auth Cookies, CSRF Tokens และ Bearer Tokens สำหรับยิง API ตรง
* **`ecommerce_api_request_helper`**: Helper ส่งคำสั่งไปยัง Internal Seller Center API โดยตรง

### Phase 3: High-Level Search, Update & Safety Guard
* **`ecommerce_product_search`**: ค้นหาสินค้าและ SKU ในระบบหลังบ้านร้านค้า
* **`ecommerce_update_price_stock`**: ปรับเปลี่ยนราคาและจำนวนสต็อก
* **`ecommerce_safety_guard`**: ตรวจสอบขอบเขตส่วนต่างราคากันข้อผิดพลาด

### Phase 4: Captcha, Metrics, Batch & Audit Logs
* **`ecommerce_detect_captcha_challenge`**: สแกนหา Slide Captcha/OTP และแจ้งเตือนมนุษย์เมื่อต้องการการยืนยันตัวตน
* **`ecommerce_get_store_metrics`**: สรุปจำนวนออเดอร์ค้างจัดส่งและ SKU สต็อกหมด
* **`ecommerce_batch_update_price_stock`**: อัปเดตราคาและสต็อกแบบหลายรายการพร้อมระบบชะลอความเร็ว
* **`ecommerce_audit_log`**: บันทึกและเรียกดูประวัติการเปลี่ยนแปลงราคาสินค้าย้อนหลัง

### Phase 5: Smart Workflow Recipe Engine (Token Saver Level 1)
* **`ecommerce_run_recipe`**: รันคำสั่งสำเร็จรูปโดยรับเพียง Parameter สั้นๆ (ลด Token >95%)
* **`ecommerce_list_recipes`**: แสดงรายการ Recipes และ Parameter Schemas
* **`ecommerce_save_custom_recipe`**: บันทึก Custom Macro จาก AI
* **`ecommerce_cached_selector_map`**: แคช Selector ป้องกันปัญหา UI ปรับเปลี่ยน

### Phase 6: Advanced Capabilities & Context Compression Engine (Token Saver Level 2)
* **`ecommerce_context_compressor`**: บีบอัด DOM/HTML ขนาดใหญ่เหลือเฉพาะ Micro-JSON (<100 tokens, ลด Token 98%+)
* **`ecommerce_local_sqlite_cache`**: อ่าน/เขียนข้อมูลสินค้าและออเดอร์จากฐานข้อมูลในเครื่อง
* **`ecommerce_smart_diff_update`**: สั่งอัปเดตเฉพาะส่วนต่าง Delta (เช่น deltaStock: -2)
* **`ecommerce_hybrid_executor`**: ระบบรันสลับเส้นทางให้อัตโนมัติ (Fast API -> CDP -> Human Alert)
* **`ecommerce_token_telemetry`**: Dashboard ติดตามสถิติการประหยัด Token และประสิทธิภาพ
