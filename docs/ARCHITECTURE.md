# System Architecture & Tool Contracts

## 1. High-Level System Flow

```
+-------------------+      MCP Protocol      +----------------------------------+
|    Openworker     | <--------------------> |  openworker-ecommerce-mcp        |
|  (User AI Client) |                        |  (Node.js / TypeScript Server)  |
+-------------------+                        +----------------------------------+
                                                              |
                                                    CDP (Port 9222) / API
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

### Tool 6: `browser_detect_challenge`
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

### Tool 7: `ecommerce_get_store_metrics`
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

### Tool 8: `ecommerce_batch_update_price_stock`
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

### Tool 9: `ecommerce_audit_log`
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

## ⚡ Phase 5: Smart Recipe & Token Saver Tools (✨ เพิ่มเติมใหม่)

### Tool 10: `ecommerce_run_recipe` (ลด Token >95%)
* **Description**: รันชุดคำสั่งสำเร็จรูป (Pre-compiled Recipe) โดยรับเพียง Parameter สำคัญ ไม่ต้องให้ AI สร้าง Script ใหม่ทุกครั้ง
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "recipeId": { 
        "type": "string", 
        "enum": [
          "shopee_quick_update_price",
          "shopee_quick_update_stock",
          "tiktok_quick_update_price",
          "tiktok_quick_update_stock",
          "lazada_quick_update_price",
          "lazada_quick_update_stock",
          "batch_inventory_sync"
        ] 
      },
      "params": {
        "type": "object",
        "description": "พารามิเตอร์สำหรับ Recipe เช่น { skuId: 'SKU-001', price: 199 }"
      }
    },
    "required": ["recipeId", "params"]
  }
  ```

---

### Tool 11: `ecommerce_list_recipes`
* **Description**: คืนค่ารายการ Workflow Recipes ทั้งหมดที่มี พร้อมคำอธิบายและพารามิเตอร์ที่ต้องการ เพื่อให้ AI เลือกใช้ได้ทันทีโดยไม่ต้องคาดเดา
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "platform": { "type": "string", "enum": ["shopee", "tiktok", "lazada", "all"], "default": "all" }
    }
  }
  ```

---

### Tool 12: `ecommerce_save_custom_recipe`
* **Description**: บันทึกลำดับการทำงาน (Macro Sequence) ที่ AI เคยทำสำเร็จไว้เป็น Recipe ใหม่ เพื่อดึงกลับมาใช้ซ้ำในอนาคตโดยไม่ต้องเจนสคริปต์ใหม่
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "recipeId": { "type": "string" },
      "description": { "type": "string" },
      "platform": { "type": "string", "enum": ["shopee", "tiktok", "lazada"] },
      "steps": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "action": { "type": "string" },
            "target": { "type": "string" },
            "value": { "type": "string" }
          },
          "required": ["action"]
        }
      }
    },
    "required": ["recipeId", "platform", "steps"]
  }
  ```

---

### Tool 13: `ecommerce_cached_selector_map`
* **Description**: จัดการและอัปเดต Dictionary ของ CSS/XPath Selectors และ API Signatures ของแต่แพลตฟอร์ม เมื่อเว็บมีการปรับเปลี่ยน UI เพื่อไม่ให้กระทบ Recipe ที่บันทึกไว้
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "platform": { "type": "string", "enum": ["shopee", "tiktok", "lazada"] },
      "action": { "type": "string", "enum": ["get_map", "update_selector"] },
      "selectorKey": { "type": "string" },
      "newSelector": { "type": "string" }
    },
    "required": ["platform", "action"]
  }
  ```
