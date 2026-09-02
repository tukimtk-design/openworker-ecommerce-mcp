# 📊 Phase 13 Implementation Report: Reorder Automation & Seasonality

**สถานะ:** ✅ เสร็จสมบูรณ์ | **วันที่:** กันยายน 2026 | **Test Suite:** 86/86 ผ่าน | **Tools:** 35

---

## 🎯 สิ่งที่พัฒนา

### Task 13.2 — Seasonality & Holiday Calendar
**ไฟล์:** `src/services/seasonality.ts` (pure functions)

ตัวคูณความต้องการซื้อ (demand multiplier) รายวัน ครอบคลุม:
- **Double-Day Mega Sale** 9.9 / 10.10 / 11.11 / 12.12 (×1.8) พร้อม **Pre-Sale ramp** 2 วันก่อน (×1.25)
- **สงกรานต์** 10–16 เม.ย. (×1.35), **ปีใหม่ไทย** 28 ธ.ค.–3 ม.ค. (×1.45)
- **ตรุษจีน (โดยประมาณ)** ปลาย ม.ค.–ต้น ก.พ. (×1.2), **วาเลนไทน์** 10–14 ก.พ. (×1.2)
- **Payday window** วันที่ 25–3 ของทุกเดือน (×1.15)
- ตัวคูณประกอบกันได้แต่ **cap ที่ ×2.5** ป้องกันตัวเลขนอกลำนอน

เชื่อมเข้า `predictive-engine` ผ่าน flag `useSeasonality` (default **false** — ตัวเลข Phase 12 เดิมไม่เปลี่ยน):
- การจำลองวันสต็อกหมดคูณ demand ตามปฏิทินของแต่ละวันจริง
- Reorder Point ใช้ lead-time demand แบบ seasonality-adjusted

> ระหว่างพัฒนา test จับ bug สำคัญได้: `seasonalAdjustedDemand` คืนค่าเฉลี่ยต่อวัน
> แต่ถูกใช้เป็นยอดรวมทั้ง lead time ทำให้ reorder point กลับหัว — แก้แล้ว (×leadTimeDays)

### Task 13.1 — Purchase Order Store & `ecommerce_reorder_workflow`
**ไฟล์:** `src/services/po-store.ts`, `src/tools/reorder-workflow.ts`

- `create_po` — สร้าง PO draft จาก forecast entries (ใช้ `suggestedReorderQty` ได้เลย) หรือรายการ manual คำนวณ line total/estimated total อัตโนมัติ เก็บใน SQLite (key `purchase_orders`)
- `list_pos` — ดูทั้งหมดหรือกรองตามสถานะ
- `update_po_status` — lifecycle: `draft → ordered → received / cancelled`

### Task 13.3 — Inventory Watchdog + Agent Loop Integration
**ไฟล์:** `src/services/inventory-watchdog.ts`, อัปเดต `store-agent-loop.ts`, `store-agent-tool.ts`

- `runInventoryWatchdog(config)` — forecast ทั้ง watchlist → รวมรายการ **critical เป็น PO draft ใบเดียว** → แจ้งเตือน (ถ้าเปิด)
- `ecommerce_autonomous_store_manager` เพิ่ม action `configure_watchdog` (ส่ง `products: null` เพื่อปิด) — watchdog วิ่งทุก tick ของ agent loop อัตโนมัติ, `trigger_now` คืนผล watchdog ใน result
- watchdog fail ไม่ดับ loop (try/catch แยก task)

### Task 13.4 — Notification Channel: `ecommerce_send_notification`
**ไฟล์:** `src/tools/notify.ts`

- ส่งผ่าน **LINE Messaging API** (`LINE_CHANNEL_ACCESS_TOKEN` + `LINE_TARGET_ID`) หรือ **Telegram Bot** (`TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`)
- **ไม่มี token = dry-run** (`simulated`) ไม่ยิง network — ปลอดภัยใน sandbox/test
- `history` — log 200 รายการล่าสุดใน SQLite, timeout 10 วินาทีต่อ call

## ✅ การยืนยัน

| ตัวชี้วัด | Phase 12 | Phase 13 |
|---|---|---|
| Tests | 67 | **86** (+19 ใหม่ ทั้งหมดผ่าน) |
| Tools | 33 | **35** |
| Agent loop | stub tick | **watchdog จริง + auto-PO** |

- Smoke test server จริงผ่าน: `tools/list` = 35, สร้าง PO จริงได้ (`PO-20260902-H822`, total 4,200), notify dry-run ถูกต้อง
- Acceptance ของเฟส (PO draft ≥ 95% ของ scenario): test ครอบคลุม auto-PO, filter, lifecycle, validation, disable

## 🚀 ถัดไป: Phase 14 — Competitor Radar (ดู `ROADMAP.md`)
