# Openworker E-Commerce MCP Server

MCP (Model Context Protocol) Server ออกแบบสำหรับใช้งานร่วมกับ **Openworker** เพื่อควบคุม Chrome หรือ Microsoft Edge ในการบริหารจัดการสินค้าบนแพลตฟอร์ม E-Commerce หลัก ได้แก่ **Shopee, TikTok Shop และ Lazada**

---

## 🚀 จุดประสงค์โครงการ (Project Overview)

ระบบนี้พัฒนาขึ้นเพื่อแก้ปัญหาการควบคุมเบราว์เซอร์อัตโนมัติของบอททั่วไปบนหน้า Seller Center:
1. **ล็อกอินผ่าน Session จริง**: เชื่อมต่อ Chrome/Edge ที่ผู้ใช้ล็อกอินค้างไว้อยู่แล้วผ่าน Remote Debugging Port (`9222`) ไม่ต้องล็อกอินใหม่หรือเจอ OTP/2FA ซ้ำซ้อน
2. **การอัปเดตรวดเร็วผ่าน Internal API Interception**: ดึง Session Cookies/Tokens จากเบราว์เซอร์แล้วส่งคำสั่งอัปเดตผ่าน API โดยตรง รวดเร็ว แม่นยำ ไม่ต้องพึ่งพาการคลิกบน UI เพียงอย่างเดียว
3. **Safety Guard & Captcha Pause**: ตรวจสอบขอบเขตราคาและสต็อกก่อน Save และหยุดรอเมื่อเจอ Captcha ให้ผู้ใช้ช่วยปลดล็อกได้ทันที

---

## 👥 บทบาทและการทำงาน (Team & Development Roles)

* **Jules (Google AI Agent)**: พัฒนาโค้ด TypeScript, พัฒนา Tools แต่ละหมวดหมู่ (Browser Attach, Session Interceptor, API Client, Safety Guard) และทำ Unit Tests
* **Controller Agent (Cowork / GitHub Controller)**: ควบคุมโครงสร้างโปรเจกต์, Review Code/PR, ออกแบบ Task Issues, จัดทำ Tag Release และ Deploy เข้าสู่ Openworker

---

## 🛠️ โครงสร้างโปรเจกต์ (Project Structure)

```
openworker-ecommerce-mcp/
├── src/
│   ├── index.ts                # Entry point หลักของ MCP Server
│   ├── types.ts                # Type Definitions & Schemas
│   ├── services/
│   │   ├── cdp-connection.ts   # ตัวจัดการเชื่อมต่อ Chrome/Edge CDP (Port 9222)
│   │   ├── session-extractor.ts# ตัวดึง Auth Cookies / Bearer Tokens จาก Tab
│   │   └── api-client.ts       # Internal API Wrapper สำหรับ Shopee/TikTok/Lazada
│   └── tools/
│       ├── browser-profile.ts  # Tool: browser_attach_existing
│       ├── ecommerce-search.ts # Tool: ecommerce_product_search
│       ├── ecommerce-update.ts # Tool: ecommerce_update_price_stock
│       └── safety-guard.ts     # Tool: ecommerce_safety_guard
├── docs/
│   ├── ARCHITECTURE.md         # สถาปัตยกรรมและรายละเอียด Tool Contracts
│   └── TASKS.md                # รายการงานสำหรับการพัฒนาราย Phase
├── JULES_PROMPT.md             # ข้อแนะนำการสั่งงาน Jules (Google AI Agent)
├── package.json
└── tsconfig.json
```

---

## 💻 การเปิดใช้งาน Chrome / Edge สำหรับการเชื่อมต่อ

ก่อนเริ่มใช้งาน ให้เปิด Chrome หรือ Microsoft Edge ด้วยคำสั่ง Remote Debugging:

**Windows (Chrome):**
```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\ChromeAutomationProfile"
```

**Windows (Edge):**
```cmd
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222 --user-data-dir="C:\EdgeAutomationProfile"
```

---

## ⚙️ การติดตั้งและใช้งาน (Installation & Build)

```bash
# ติดตั้ง dependencies
npm install

# Build TypeScript
npm run build

# ทดสอบรัน MCP Server
npm start
```

---

## 📄 ใบอนุญาต (License)

MIT License - พัฒนาโดย [tukimtk-design](https://github.com/tukimtk-design)

---

## 🚀 Phase 7 Features

### Auto-Launch on Windows
If the CDP connection fails on Windows, the system will attempt to automatically launch Chrome/Edge with the correct remote debugging port to provide a seamless 1-click experience.

### Playwright E2E Mocks
You can run the mocked E2E flows via:
```bash
npm test
```

### Openworker Auto-Installer
Run the PowerShell script to build the project and generate the MCP config:
```powershell
.\scripts\install-openworker-mcp.ps1
```

---

## 🚀 Phase 8 Features

### Multi-Platform Stock Sync
Automatically synchronize stock and prices across Shopee, TikTok Shop, and Lazada. The system orchestrates safety bounds and logs operations.

### Fuzzy Variant Matching
The system uses string similarity (Levenshtein Distance) to match product variants that are named differently across platforms, leveraging SQLite to cache successful matches for immediate future retrievals.

---

## 🚀 Phase 9 Features (Enterprise)

### Docker & Headless Run
Deploy 24/7 on the cloud using the official Playwright Docker image with Xvfb:
```bash
docker-compose up -d
```

### Visual DOM Self-Correction
Captures viewport screenshots and bounding boxes to allow AI to self-correct during unexpected DOM overlays.

### Proxy Rotation
Supports rotating proxies for multi-account isolation.

---

## 🚀 Phase 10 Features (The Autonomous Era)

### Autonomous AI Store Manager
Run the background agent loop to automatically reply to chats, check competitor prices, and rebalance stock across all platforms periodically without manual intervention.

### Omni-Channel Product Cloner
Instantly scrape products from source URLs, apply rebranding or translation templates via LLMs, and publish them to multiple target platforms simultaneously.

### E-Commerce Expansion Suite
We expanded our toolkit to a total of 27 tools, now covering:
- Auto Chat Replies
- Pending Order Extraction & Fulfillment
- Promotion & Flash Sale Management
- Cross-platform Asset & Image Sync

---

## 🚀 Phase 11 Features (LnwShop & M365 Copilot)

### LnwShop Integration
Added native support for LnwShop, capsulefill.com, and lnw.co domains. Stock and price updates can now be synced cross-platform including LnwShop endpoints.

### Microsoft 365 Copilot Bridge
Introduced `ecommerce_m365_copilot_bridge` to natively interact with the `m365.cloud.microsoft/chat` interface, allowing autonomous agents to offload complex reasoning or formatting tasks securely.

---

## 🚀 Phase 12 Features (The Predictive Era)

### Predictive Inventory & Smart Sourcing
New tool `ecommerce_predictive_inventory` — forecast stock depletion from sales history:
- **Action `forecast`**: weighted sales velocity, daily trend (linear regression), predicted stockout date, Reorder Point (lead-time demand + safety stock at service level 0.90–0.99), suggested reorder quantity, and risk level (`critical`/`warning`/`healthy`) with Thai-language recommendations.
- **Action `bulk_forecast`**: forecast many products at once, sorted by urgency — ready for a daily agent watchlist.

```json
{ "action": "forecast", "productId": "P123", "currentStock": 50, "leadTimeDays": 7,
  "salesHistory": [{ "date": "2026-09-01", "unitsSold": 12 }] }
```

### Test & Storage Hardening
- Tests are now **hermetic**: `npm test` runs against a throwaway SQLite DB (`scripts/run-tests.mjs`) and never touches your real `%APPDATA%` store.
- `SqliteStore` supports `OPENWORKER_DB_PATH` / `OPENWORKER_DATA_DIR` env overrides and transparently reads legacy pre-refactor data.
- Debug tool: `node scripts/inspect-db.mjs` to inspect the cache DB.
- Roadmap for the next phases: see [docs/ROADMAP.md](docs/ROADMAP.md).

---

## 🚀 Phase 13 Features (Reorder Automation & Seasonality)

### Seasonality-Aware Forecasting
Pass `"useSeasonality": true` to `ecommerce_predictive_inventory` to factor in Thai/CN holidays, Double-Day mega sales (9.9/10.10/11.11/12.12 with pre-sale ramp) and payday windows into stockout dates and reorder points.

### Reorder Workflow (PO Drafts)
New tool `ecommerce_reorder_workflow` — turn critical forecasts into Purchase Order drafts stored in SQLite, list/filter them, and advance their lifecycle (`draft → ordered → received / cancelled`).

### Inventory Watchdog in the Agent Loop
`ecommerce_autonomous_store_manager` now supports `configure_watchdog`: give it a product watchlist and every agent tick will forecast stock, auto-draft one consolidated PO for all critical items, and optionally notify you.

### Outbound Alerts
New tool `ecommerce_send_notification` — LINE Messaging API or Telegram Bot alerts. Without tokens it dry-runs (`simulated`), so automation is safe in sandboxes. Set `LINE_CHANNEL_ACCESS_TOKEN`/`LINE_TARGET_ID` or `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` to go live.

Phase 13 details: [docs/REPORT_PHASE_13.md](docs/REPORT_PHASE_13.md)

---

## 🚀 Phase 14 Features (Competitor Radar)

### Rate-Limited Competitor Scanning
New tool `ecommerce_competitor_radar` — action `scan` respects a token-bucket rate cap (1–30/min, default 6) with randomized jitter, storing every result as a timestamped snapshot. The extractor is pluggable (built-in mock; swap in a real CDP/API extractor in Phase 15).

### Competitor Time-Series + Retention
Snapshots are stored as a time series (`competitor_history:{platform}:{skuId}`) capped at 500 points per SKU, with a `prune_history` action (default 90-day retention).

### Price-War Playbook
Action `price_war_playbook` compares your price against the competitor's latest and returns three margin-aware response plans — match the price, offer a voucher/bundle at ~half the gap, or hold — never recommending anything below your margin floor (from the COGS cache key `cogs:{platform}:{productId}:{skuId}` or a direct `unitCost`).

Phase 14 details: [docs/REPORT_PHASE_14.md](docs/REPORT_PHASE_14.md)
