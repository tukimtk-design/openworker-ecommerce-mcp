# 🗺️ Roadmap: Phase 13+ (Post Predictive Era)

**วันที่จัดทำ:** กันยายน 2026 | **พื้นฐาน:** Phase 12 (Predictive Inventory) เสร็จสมบูรณ์ — ดู `REPORT_PHASE_12_IMPLEMENTATION.md`

ลำดับความสำคัญเรียงตาม ROI ต่อความเสี่ยง: สิ่งที่ต่อยอดข้อมูลที่ระบบมีอยู่แล้วมาก่อน,
สิ่งที่พึ่งพาภายนอก (API ทางการ, บริการ 3rd party) มาทีหลัง

> **Definition of Done ทุกเฟส** (ตาม Zero-Defect Protocol):
> schema strict 100% ผ่าน Vertex AI/Claude parsing, unit test ครบทุก action,
> เขียนเอกสาร REPORT_ ประจำเฟส, ผ่าน `npm test` แบบ hermetic ทั้งหมด

---

## 🟢 Phase 13: Reorder Automation & Seasonality (ต่อยอด Phase 12 โดยตรง)

**เป้าหมาย:** เปลี่ยน "คำแนะนำ" จาก predictive engine ให้กลายเป็น "การกระทำ" อัตโนมัติจบวงจร

- [ ] **Task 13.1** — `ecommerce_reorder_workflow`: รับผลลัพธ์ `bulk_forecast` ฝั่ง critical
      → สร้าง Draft Purchase Order (ร้านค้า, SKU, จำนวน, supplier link) และบันทึกลง SQLite
- [ ] **Task 13.2** — Seasonality & Holiday Calendar (ไทย + จีน + วันแห่งการให้รางวัล
      9.9/10.10/11.11/12.12): multiplier ต่อช่วงวัน เพื่อปรับ projected demand ให้แม่นขึ้น
- [ ] **Task 13.3** — เชื่อม predictive engine เข้า `ecommerce_autonomous_store_manager`:
      agent loop เช็ก watchlist ทุกวัน → แจ้งเตือน/สร้าง PO draft เองเมื่อเข้าเขต critical
- [ ] **Task 13.4** — Notification channels: LINE Messaging API และ/หรือ Telegram Bot
      สำหรับ alert "สินค้าใกล้หมด" และ "คู่แข่งตัดราคา" (แม่แบบใช้ร่วมกันทุกเฟสถัดไป)
- [ ] **Task 13.5** — Tests + REPORT_PHASE_13

**Acceptance:** agent loop รัน 24 ชม. ใน mock environment แล้วสร้าง PO draft ถูกต้อง ≥ 95% ของ scenario ทดสอบ

---

## 🔵 Phase 14: Competitor Radar (Option B จาก REPORT_PHASE_12)

**เป้าหมาย:** Dynamic pricing ที่อิงข้อมูลคู่แข่งจริง พร้อมเกราะป้องกันการโดนแบน

- [ ] **Task 14.1** — `ecommerce_competitor_scan`: scrape ราคา/สต็อก/ยอดขายสินค้าคู่แข่ง
      ผ่าน CDP ด้วย rate limiting แบบ token bucket + random jitter (ผ่าน ProxyManager ที่มีอยู่)
- [ ] **Task 14.2** — ตาราง `competitor_snapshots` ใน SQLite + retention policy
      (ต่อยอด key `competitor_history:*` ที่มีอยู่แล้วให้เป็น time-series จริง)
- [ ] **Task 14.3** — Price-war playbook: เมื่อคู่แข่งลดราคา → เสนอแผนตอบโต้ 3 แบบ
      (ตามลด / แพ็กเซจโปรโมชัน / ไม่ทำอะไร) พร้อมผลกระทบ margin จาก COGS data
- [ ] **Task 14.4** — Tests + REPORT_PHASE_14

**ความเสี่ยง:** การ scrape หนักอาจโดนแพลตฟอร์มบล็อก → ต้อง cap การ scan และทำ whitelist รายการที่เฝ้าดู

---

## 🟣 Phase 15: Official Open Platform APIs Migration (ลดความเปราะบาง)

**เป้าหมาย:** ย้าย operation หลัก (สต็อก/ราคา/ออเดอร์) จากการ scrape/CDP ไปใช้ API ทางการ
ทีละส่วน — ความเสถียรระยะยาวสูงกว่าการไล่ selector ที่เปลี่ยนบ่อย

- [ ] **Task 15.1** — Shopee Open Platform (Partner API): register app, OAuth store-level token
- [ ] **Task 15.2** — Lazada Open Platform: app key/secret + token refresh flow
- [ ] **Task 15.3** — TikTok Shop Open API: shop authorization
- [ ] **Task 15.4** — Abstraction layer `PlatformAdapter`: ทุก tool เรียกผ่าน interface เดียว
      (auto-fallback: ถ้าไม่มี API credential → ใช้ CDP/scraper path เดิม)
- [ ] **Task 15.5** — Tests (mock API responses) + REPORT_PHASE_15

**หมายเหตุ:** เฟสนี้ต้องมีบัญชี developer/seller จริงของเจ้าของโปรเจกต์เพื่อขอ credential

---

## 🟠 Phase 16: Unified Customer CRM (Option C จาก REPORT_PHASE_12)

**เป้าหมาย:** Upsell/Cross-sell จากแชท — จำกัดขอบเขตที่ "ทำได้จริง" ภายใต้ data masking

- [ ] **Task 16.1** — Customer profile keyed ด้วย platform+username (ไม่พยายาม cross-platform
      identity resolution ที่ platform ปิดข้อมูล) + purchase history จากออเดอร์
- [ ] **Task 16.2** — เชื่อม `ecommerce_auto_reply_chat`: ก่อนตอบแชท ดึง profile ส่งเข้า context
      (ผ่าน Context Compressor ที่มีอยู่) พร้อม product แนะนำตามประวัติ
- [ ] **Task 16.3** — Privacy guard: เก็บเฉพาะข้อมูลที่จำเป็น, opt-out flag, ลบข้อมูลตามคำขอ
- [ ] **Task 16.4** — Tests + REPORT_PHASE_16

---

## ⚙️ Phase 17: Operations, Observability & Release Management

- [ ] **Task 17.1** — `ecommerce_health_check`: สถานะ DB, browser connection, token usage, error rate ล่าสุด
- [ ] **Task 17.2** — Dashboard แบบ read-only (HTML เดียวจาก Docker) แสดง watchlist สต็อก + telemetry
- [ ] **Task 17.3** — Backup/restore อัตโนมัติของ SQLite + retention
- [ ] **Task 17.4** — CI gate: coverage threshold + `npm test` hermetic ต้องผ่านก่อน merge
- [ ] **Task 17.5** — Release `v2.0.0-predictive` (major bump เพราะ schema/env var ใหม่)

---

## 📌 ทางเลือกระยะยาว (Backlog — ยังไม่กำหนดเฟส)

- Multi-store / multi-account ด้วย ProxyManager + session isolation ที่มีอยู่
- LnwShop Phase 2: ออเดอร์ + สต็อก (ปัจจุบันมีแค่ SEO updater)
- M365 Copilot Bridge: ขยายจาก delegate reasoning → delegate actions
- Localization: อินเทอร์เฟซ recommendation หลายภาษา (ไทย/อังกฤษ/จีน)
