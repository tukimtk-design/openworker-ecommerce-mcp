# System Architecture & Tool Contracts

## 1. High-Level System Flow

```
+-------------------+      MCP Protocol      +----------------------------------+
|    Openworker     | <--------------------> |  openworker-ecommerce-mcp        |
|  (User AI Client) |                        |  (Node.js / TypeScript Server)  |
+-------------------+                        +----------------------------------+
                                                              |
                                             +----------------+----------------+
                                             |                                 |
                                    CDP (Port 9222) / API             Local SQLite Cache
                                             |                                 |
                                             v                                 v
                              +------------------------------+     +-----------------------+
                              | User's Chrome / Edge Browser |     | Local Product Catalog |
                              | - Shopee / TikTok / Lazada   |     | & Order Sync Database |
                              +------------------------------+     +-----------------------+
```

---

## 2. Complete MCP Tools Contract Specification

### Core Tools (Phase 1 - 4)
* **`browser_attach_existing`**: เชื่อมต่อ Chrome/Edge Port 9222
* **`ecommerce_extract_session`**: ดึง Auth Cookies/Tokens
* **`ecommerce_product_search`**: ค้นหาสินค้าตาม SKU
* **`ecommerce_update_price_stock`**: ปรับเปลี่ยนราคาและสต็อก
* **`ecommerce_safety_guard`**: ตรวจสอบส่วนต่างราคากันผิดพลาด
* **`browser_detect_challenge`**: ตรวจจับ Captcha/OTP และแจ้งเตือนมนุษย์
* **`ecommerce_get_store_metrics`**: สรุปออเดอร์ค้างและสต็อกหมด
* **`ecommerce_batch_update_price_stock`**: อัปเดตสินค้าแบบ Batch
* **`ecommerce_audit_log`**: ประวัติการปรับเปลี่ยนย้อนหลัง

---

### Phase 5: Smart Recipe Engine (Token Saver Level 1)
* **`ecommerce_run_recipe`**: รันคำสั่งสำเร็จรูปโดยรับเพียง Parameter สั้นๆ (ลด Token >95%)
* **`ecommerce_list_recipes`**: แสดงรายการ Recipes และ Parameter Schemas
* **`ecommerce_save_custom_recipe`**: บันทึก Custom Macro จาก AI
* **`ecommerce_cached_selector_map`**: แคช Selector ป้องกันปัญหา UI ปรับเปลี่ยน

---

## 💎 Phase 6: Advanced Capabilities & Context Compression Engine (Token Saver Level 2 - ✨ ใหม่)

### Tool 14: `ecommerce_context_compressor` (ลด Token อ่านหน้าเว็บ 98%)
* **Description**: บีบอัดโครงสร้างหน้าเว็บ HTML/DOM หรือ Response ขนาดใหญ่ ให้เหลือเฉพาะข้อมูลสินค้า ราคา สต็อก และปุ่มกดที่จำเป็นในรูปแบบ Micro-JSON ขนาดเล็ก (< 100 tokens)
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "platform": { "type": "string", "enum": ["shopee", "tiktok", "lazada"] },
      "rawHtml": { "type": "string", "description": "Raw HTML หรือ DOM string (ถ้ามี)" }
    }
  }
  ```

---

### Tool 15: `ecommerce_local_sqlite_cache` (ศูนย์ข้อมูลสินค้าและออเดอร์ในเครื่อง)
* **Description**: จัดเก็บและเรียกดูข้อมูลสินค้า สต็อก และออเดอร์ย้อนหลังจากฐานข้อมูล SQLite ภายในเครื่อง ช่วยให้ AI ตอบคำถามและอ่านสถานะร้านค้าได้ทันทีโดยไม่ต้องรันเบราว์เซอร์ไปแกะหน้าเว็บใหม่ทุกครั้ง
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "action": { "type": "string", "enum": ["query_products", "query_low_stock", "sync_from_web"] },
      "platform": { "type": "string", "enum": ["shopee", "tiktok", "lazada", "all"], "default": "all" },
      "filter": { "type": "string" }
    },
    "required": ["action"]
  }
  ```

---

### Tool 16: `ecommerce_smart_diff_update` (Delta State Update)
* **Description**: รับคำสั่งอัปเดตเฉพาะค่าส่วนต่าง (Delta) เช่น เพิ่ม/ลดสต็อก หรือปรับราคาขึ้น/ลง โดย AI ส่งเฉพาะค่าต่าง ไม่ต้องส่ง Payload เต็มรูปแบบ
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "platform": { "type": "string", "enum": ["shopee", "tiktok", "lazada"] },
      "skuId": { "type": "string" },
      "deltaStock": { "type": "number", "description": "+10 หรือ -5" },
      "deltaPrice": { "type": "number", "description": "+20 หรือ -10" }
    },
    "required": ["platform", "skuId"]
  }
  ```

---

### Tool 17: `ecommerce_hybrid_executor` (Automatic Fallback Executor)
* **Description**: ระบบสลับการทำงานอัตโนมัติ (Fast API -> CDP Automation -> Human Alert) ดำเนินการแก้ไขข้อมูลผ่านเส้นทางที่เร็วและใช้ Token น้อยที่สุดให้อัตโนมัติ
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "platform": { "type": "string", "enum": ["shopee", "tiktok", "lazada"] },
      "taskType": { "type": "string", "enum": ["update_price", "update_stock", "search"] },
      "payload": { "type": "object" }
    },
    "required": ["platform", "taskType", "payload"]
  }
  ```

---

### Tool 18: `ecommerce_token_telemetry` (Dashboard สรุปการประหยัด Token)
* **Description**: รายงานสถิติปริมาณ Token ที่ประหยัดได้ เวลาที่ใช้ในการประมวลผล และอัตราความสำเร็จของระบบ
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "timeframe": { "type": "string", "enum": ["today", "this_week", "all_time"], "default": "today" }
    }
  }
  ```
