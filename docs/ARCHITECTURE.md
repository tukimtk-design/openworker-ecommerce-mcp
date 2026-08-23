# System Architecture & Tool Contracts

## 1. High-Level System Flow

```
+-------------------+      MCP Protocol      +----------------------------------+
|    Openworker     | <--------------------> |  openworker-ecommerce-mcp        |
|  (User AI Client) |                        |  (Node.js / TypeScript Server)  |
+-------------------+                        +----------------------------------+
                                                              |
                                                    CDP (Port 9222)
                                                              |
                                                              v
                                             +----------------------------------+
                                             | User's Chrome / Edge Browser     |
                                             | - Shopee Seller Centre Tab       |
                                             | - TikTok Shop Seller Center Tab  |
                                             | - Lazada Seller Center Tab       |
                                             +----------------------------------+
```

---

## 2. Complete MCP Tools Contract Specification

### Tool 1: `browser_attach_existing`
* **Description**: ตรวจสอบและเชื่อมต่อกับ Chrome/Edge ที่ผู้ใช้เปิดไว้บนพอร์ต 9222 พร้อมคืนค่ารายการ Tab ร้านค้า E-Commerce ที่ล็อกอินอยู่
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "port": { "type": "number", "default": 9222 }
    }
  }
  ```

---

### Tool 2: `ecommerce_extract_session`
* **Description**: ดึง Cookies, CSRF Tokens และ Header สำหรับใช้ในการส่งคำสั่ง API ตรงไปยังแพลตฟอร์ม
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "platform": { "type": "string", "enum": ["shopee", "tiktok", "lazada"] }
    },
    "required": ["platform"]
  }
  ```

---

### Tool 3: `ecommerce_product_search`
* **Description**: ค้นหารายการสินค้าและ Variant SKU จากระบบหลังบ้านร้านค้า
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "platform": { "type": "string", "enum": ["shopee", "tiktok", "lazada"] },
      "query": { "type": "string", "description": "ชื่อสินค้า, SKU ID หรือ Item ID" }
    },
    "required": ["platform", "query"]
  }
  ```

---

### Tool 4: `ecommerce_update_price_stock`
* **Description**: ปรับเปลี่ยนราคาสินค้าและจำนวนสต็อกสำหรับสินค้าหรือ Variant SKU ที่กำหนด
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "platform": { "type": "string", "enum": ["shopee", "tiktok", "lazada"] },
      "productId": { "type": "string" },
      "skuId": { "type": "string" },
      "newPrice": { "type": "number" },
      "newStock": { "type": "number" }
    },
    "required": ["platform", "productId"]
  }
  ```

---

### Tool 5: `ecommerce_safety_guard`
* **Description**: ตรวจสอบความถูกต้องและแจ้งเตือนความเสี่ยงของราคาสินค้า/สต็อกก่อนบันทึกจริง
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "currentPrice": { "type": "number" },
      "proposedPrice": { "type": "number" },
      "maxPriceDropPercent": { "type": "number", "default": 50 }
    },
    "required": ["currentPrice", "proposedPrice"]
  }
  ```

---

### Tool 6: `browser_detect_challenge` (✨ เพิ่มเติม)
* **Description**: สแกนหา Captcha, OTP Modal หรือ Security Challenge บน Tab ที่เปิดอยู่ และส่งสัญญาณแจ้งเตือนเมื่อต้องการให้มนุษย์ช่วยแก้หน้าจอ
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "platform": { "type": "string", "enum": ["shopee", "tiktok", "lazada"] }
    },
    "required": ["platform"]
  }
  ```

---

### Tool 7: `ecommerce_get_store_metrics` (✨ เพิ่มเติม)
* **Description**: สรุปข้อมูลสำคัญของร้านค้า เช่น จำนวนออเดอร์ที่รอจัดส่ง (Pending Orders) และรายการ SKU ที่สต็อกกำลังหมด
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "platform": { "type": "string", "enum": ["shopee", "tiktok", "lazada"] }
    },
    "required": ["platform"]
  }
  ```

---

### Tool 8: `ecommerce_batch_update_price_stock` (✨ เพิ่มเติม)
* **Description**: อัปเดตราคาและสต็อกแบบหลายรายการ (Batch) พร้อมระบบใส่ความหน่วงสุ่ม (Anti-Rate-Limit Delay)
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "platform": { "type": "string", "enum": ["shopee", "tiktok", "lazada"] },
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "productId": { "type": "string" },
            "skuId": { "type": "string" },
            "newPrice": { "type": "number" },
            "newStock": { "type": "number" }
          },
          "required": ["productId"]
        }
      }
    },
    "required": ["platform", "items"]
  }
  ```

---

### Tool 9: `ecommerce_audit_log` (✨ เพิ่มเติม)
* **Description**: บันทึกประวัติการเปลี่ยนแปลงราคาสินค้า/สต็อก ย้อนหลัง เพื่อตรวจสอบและ Rollback
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "action": { "type": "string", "enum": ["record", "get_history"] },
      "productId": { "type": "string" },
      "limit": { "type": "number", "default": 20 }
    },
    "required": ["action"]
  }
  ```


---

### Tool 10: `ecommerce_autonomous_store_manager` (✨ Phase 10)
* **Description**: จัดการ Store Agent Loop ที่ทำงานเบื้องหลัง
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "action": { "type": "string", "enum": ["start", "stop", "status", "trigger_now"] },
      "intervalMs": { "type": "number" }
    },
    "required": ["action"]
  }
  ```

---

### Tool 11: `ecommerce_clone_product` (✨ Phase 10)
* **Description**: โคลนสินค้าจาก URL ต้นฉบับไปลงในแพลตฟอร์มเป้าหมาย
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "sourceUrl": { "type": "string" },
      "targetPlatforms": { "type": "array", "items": { "type": "string" } },
      "translationTemplate": { "type": "string" }
    },
    "required": ["sourceUrl", "targetPlatforms"]
  }
  ```

---

### Tool 12: `ecommerce_auto_reply_chat` (✨ Phase 10)
* **Description**: ดึงแชทที่ยังไม่ได้อ่านและตอบกลับอัตโนมัติ
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "platform": { "type": "string" },
      "action": { "type": "string", "enum": ["fetch_unread", "reply"] },
      "messageId": { "type": "string" },
      "replyText": { "type": "string" }
    },
    "required": ["platform", "action"]
  }
  ```

---

### Tool 13: `ecommerce_get_pending_orders` (✨ Phase 10)
* **Description**: ดึงรายการออเดอร์ที่รอจัดส่ง
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "platform": { "type": "string" }
    },
    "required": ["platform"]
  }
  ```

---

### Tool 14: `ecommerce_fulfill_order` (✨ Phase 10)
* **Description**: อัปเดตสถานะจัดเตรียมการจัดส่งของออเดอร์
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "platform": { "type": "string" },
      "orderId": { "type": "string" },
      "trackingProvider": { "type": "string" }
    },
    "required": ["platform", "orderId"]
  }
  ```

---

### Tool 15: `ecommerce_manage_promotions` (✨ Phase 10)
* **Description**: จัดการโปรโมชัน (เช่น Flash Sale) หรือแคมเปญแจก Voucher
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "platform": { "type": "string" },
      "action": { "type": "string", "enum": ["list", "create", "update"] },
      "promoDetails": { "type": "object" }
    },
    "required": ["platform", "action"]
  }
  ```

---

### Tool 16: `ecommerce_sync_product_images` (✨ Phase 10)
* **Description**: ซิงค์รูปภาพแกลลอรี่ของสินค้าระหว่างแพลตฟอร์ม
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "sourcePlatform": { "type": "string" },
      "targetPlatforms": { "type": "array", "items": { "type": "string" } },
      "productId": { "type": "string" }
    },
    "required": ["sourcePlatform", "targetPlatforms", "productId"]
  }
  ```


---

### Tool 17: `ecommerce_m365_copilot_bridge` (✨ Phase 11)
* **Description**: เชื่อมต่อและทำงานร่วมกับหน้าต่างแชท Microsoft 365 Copilot
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "action": { "type": "string", "enum": ["attach_m365_tab", "send_prompt", "read_latest_response", "get_chat_history"] },
      "prompt": { "type": "string" }
    },
    "required": ["action"]
  }
  ```
