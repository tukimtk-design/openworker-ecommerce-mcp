# 📊 Phase 12 Implementation Report: Predictive Inventory & Smart Sourcing

**สถานะ:** ✅ เสร็จสมบูรณ์ | **วันที่:** กันยายน 2026 | **Test Suite:** 67/67 ผ่าน

---

## 🎯 สิ่งที่พัฒนาในรอบนี้

### 1. Hardening & Optimization (แก้ปัญหาพื้นฐานก่อนขยายฟีเจอร์)

ก่อนพัฒนาฟีเจอร์ใหม่ พบว่า test suite มี 6/52 tests พัง (Audit Log, Selectors,
Multiplatform Sync, E2E Lifecycle) จากการสืบสวนพบ **root cause เดียวกัน**:

- `SqliteStore` ใช้ไฟล์ DB ถาวรที่ `%APPDATA%/openworker-ecommerce/ecommerce_cache.db`
  ร่วมกันระหว่างโปรดักชันกับ test suite ทำให้ test ไม่ hermetic อ่านข้อมูลเก่าค้าง (และเขียนขยะทดสอบทับข้อมูลจริงของผู้ใช้)
- ข้อมูลเก่าถูกเขียนในรูปแบบ envelope `{"_timestamp":..., "value":"..."}` ก่อน schema
  refactor แต่โค้ดปัจจุบันคาดหวัง raw JSON จึงเกิด `push is not a function` และ assertion ล้มเหลว

**การแก้ไข:**

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `src/services/sqlite-store.ts` | เพิ่ม env override (`OPENWORKER_DB_PATH` / `OPENWORKER_DATA_DIR`), backward-compat unwrap ข้อมูลรูปแบบเก่าใน `get()`, เพิ่ม `delete()` |
| `scripts/run-tests.mjs` (ใหม่) | Hermetic test runner — สร้าง temp data dir ใหม่ทุกครั้ง, test ไม่แตะ DB จริงอีกต่อไป (`npm test`) |
| `src/tools/ecommerce-selectors.ts` | แก้ default cache ถูก mutate โดย action `set` เมื่อ DB ใช้งานไม่ได้ |
| `src/tests/telemetry.test.ts` | Tighten assertions ให้ deterministic (ตรวจค่าจาก response ของ record ตรง ๆ) |
| `scripts/inspect-db.mjs` (ใหม่) | เครื่องมือ inspect ฐานข้อมูล cache เพื่อ debug (`node scripts/inspect-db.mjs [dbPath]`) |

ผลลัพธ์: 52/52 tests ผ่าน และ test runs สะอาด ทำซ้ำได้ทุกเครื่อง

### 2. ฟีเจอร์ใหม่: `ecommerce_predictive_inventory` (The Predictive ERP)

ตามข้อเสนอแนะ Option A จาก `REPORT_PHASE_12.md` (ROI 9.5/10)

**ไฟล์ใหม่:**
- `src/services/predictive-engine.ts` — engine พยากรณ์แบบ pure function ทดสอบง่าย
- `src/tools/predictive-inventory.ts` — MCP tool handler
- `src/tests/predictive-inventory.test.ts` — 15 test cases

**ความสามารถ:**

- **Action `forecast`** — พยากรณ์สินค้าเดี่ยว:
  - Sales velocity แบบ weighted moving average (วันล่าสุดมีน้ำหนักมากกว่า)
  - Trend รายวันด้วย linear regression (least-squares slope)
  - `stockoutDate` จากการจำลองการเบิกจ่ายแบบ trend-adjusted
  - **Reorder Point** = demand ช่วง lead time + **Safety Stock** (z × σ × √leadTime ตาม service level 0.90/0.95/0.98/0.99)
  - จำนวนสั่งซื้อแนะนำ (Suggested Reorder Qty) ตาม target cover days
  - ระดับความเสี่ยง `critical` / `warning` / `healthy` พร้อมคำแนะนำภาษาไทย
- **Action `bulk_forecast`** — พยากรณ์หลายสินค้าพร้อมกัน เรียงตามความเร่งด่วน
  (critical ก่อน แล้วเรียงตาม days-of-cover น้อยไปมาก) เพื่อให้ Agent ใช้ทำ watchlist รายวันได้ทันที
- รองรับ gap-filling (วันที่ขาดหาย = ขาย 0), duplicate dates, invalid records
  และ parameter `today` สำหรับ deterministic forecasting

### 3. สรุปตัวเลข

| ตัวชี้วัด | ก่อน | หลัง |
|---|---|---|
| Tests | 52 (6 พัง) | **67 ผ่านทั้งหมด** |
| Tools ทั้งหมด | 32 | **33** |
| Hermetic tests | ❌ (ใช้ DB จริง) | ✅ (temp DB ต่อ run) |
| Backward-compat กับ DB เก่า | ❌ | ✅ (auto-unwrap) |

---

## 🚀 ข้อเสนอแนะถัดไป

ดูแผน Phase 13+ ฉบับเต็มที่ `docs/ROADMAP.md`
