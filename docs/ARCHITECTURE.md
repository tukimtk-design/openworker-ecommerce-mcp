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

## 2. MCP Tools Contract Specification

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
* **Response**: รายชื่อ Tabs, แพลตฟอร์มที่พบ (Shopee/TikTok/Lazada) และสถานะ Login

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
