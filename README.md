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

## 🚀 Phase 13 Features (AI Video & Affiliate Suite)

### AI Short-Form Video Automation
Automatically generate high-converting video scripts (hooks, pain points, solutions), assemble media assets into CapCut drafts or MP4s, and automatically attach affiliate product baskets ("ปักตะกร้า") when publishing to TikTok Shop, Shopee Video, Facebook Reels, and YouTube Shorts.

---

# 📱 Samsung Galaxy Note 5 (noblelte) Optimization Manual

This repository also contains specialized deployment tools for maximizing the performance of the **Samsung Galaxy Note 5 (SM-N920C)** running **LineageOS 20.0 (Android 13)** with KernelSU.

## Disclaimer
These tools are explicitly built for the `noblelte` device. Modifying system parameters or flashing ROMs carries inherent risks. Use at your own risk.

## Available Features (Phases 1-10)
Our optimization suite operates over 10 defined phases. These phases tackle runtime compilation, kernel parameters, zRAM configuration, and more.

### Using the Master Dashboard
For the simplest experience, launch the Master Optimizer dashboard via PowerShell:
\`\`\`powershell
.\scripts\master-optimizer.ps1
\`\`\`

From the interactive menu, you can:
1. **Benchmark**: Capture a baseline profile before modifying system parameters.
2. **Apply System Tweaks (Phase 1)**: Force background DEXOPT compilation and ADB configuration.
3. **Deploy KSU Module (Phases 2-8)**: Push our custom KernelSU boot scripts to optimize memory, scheduler, CPU frequencies, and UI rendering natively on device boot.
4. **One-Click Full Optimization**: Runs benchmarking, system tweaks, and KSU deployment automatically.
5. **Rollback**: Remove the KSU module and revert settings.
6. **ROM Upgrade Helper (Phase 9)**: Flash ROMs effortlessly.

### Phase 9: Target ROM Upgrade Helper
If you are upgrading your LineageOS 20.0 build or MindTheGapps package:
1. Place the ROM zip in the `Rom/` folder.
2. Place the MindTheGapps zip in the `Tweak/` folder.
3. Connect your device with USB Debugging enabled.
4. Run `.\scripts\upgrade-rom-helper.ps1` (or access via the Master Optimizer option 6).
5. The script will verify battery (>=50%), push files, and automatically generate a TWRP `openrecoveryscript` so that booting into recovery instantly flashes the updates and wipes caches.

---

## 🚀 Phase 14 Features (Monetization & Revenue Engine)

### Affiliate Matrix Engine
Automates high-volume batch video creation, multi-platform publishing, and basket tagging scheduling across TikTok, Shopee, and Facebook Reels.

### AI Chat Closing Agent
A highly intelligent tool responding to incoming chat requests while specifically scanning abandoned cart items and auto-generating direct checkout URLs equipped with personalized discounts.

### Dynamic Pricing Arbitrage
Real-time competitor analysis tool balancing optimal Buy-Box prices while strictly securing profit margins dynamically.

### Revenue Telemetry
An aggregated visualization endpoint to measure AI-driven GMV impact and affiliate return on investment simultaneously across all stores.
