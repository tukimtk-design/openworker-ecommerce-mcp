# 📊 Phase 14 Implementation Report: Competitor Radar

**สถานะ:** ✅ เสร็จสมบูรณ์ | **วันที่:** กันยายน 2026 | **Test Suite:** 101/101 ผ่าน | **Tools:** 36

---

## 🎯 สิ่งที่พัฒนา

### Task 14.1 — Rate limiting: `src/services/rate-limiter.ts`
- **Token bucket** (`TokenBucketLimiter`): capacity + refill ต่อนาที, มี `tryAcquire`,
  `acquire()` (รอจนได้ token), `msUntilToken()`
- **Jittered delay** — สุ่มหน่วงเวลาเพื่อไม่ให้จังหวะยิงเป็นแบบแปลนตรวจจับได้
- ใช้กับ action `scan`: cap 1–30 scans/นาที (default 6)

### Task 14.2 — Time-series store: `src/services/competitor-store.ts`
- Key convention ต่อยอดข้อมูลเดิมในระบบ: `competitor:{platform}:{skuId}` (latest)
  + `competitor_history:{platform}:{skuId}` (time-series array)
- History **cap 500 จุด** ต่อ SKU + **retention pruning** (`prune_history`, default 90 วัน)
- Meta key `competitor_history_keys` เก็บรายการ key ที่รู้จัก เพราะ SqliteStore ไม่มี key enumeration

### Task 14.3 — Price-war playbook: `src/services/price-war-playbook.ts`
แผนตอบโต้ 3 แบบพร้อมตัวเลข margin จริง:

| แผน | เงื่อนไข | ผลลัพธ์ |
|---|---|---|
| `match_price` | gap ≤ 20% และ margin รอด | ตั้งราคาเท่าคู่แข่ง (clamp ที่ margin floor) |
| `promo_bundle` | แจก voucher/bundle ~ครึ่งหนึ่งของ gap | กระทบ margin ครึ่งเดียวของการตัดราคา |
| `hold` | ทุกแผนทำให้ขายขาดทุน | คงราคา รับความเสี่ยงยอดขาย |

- **Margin floor** = totalCost × (1 + minMargin%) — ห้ามตั้งราคาต่ำกว่านี้ในทุกแผน
- แหล่งต้นทุน: COGS cache key `cogs:{platform}:{productId}:{skuId}`
  (convention เดิมของระบบ: cogs + inboundShipping + packagingCost + minMarginPercent)
  หรือส่ง `unitCost` เข้ามาตรง ๆ

### Tool รวม: `ecommerce_competitor_radar` (36th tool)
`scan` / `record_snapshot` / `get_history` / `price_war_playbook` / `prune_history`

**หมายเหตุความจริงเรื่อง extractor:** action `scan` รองรับ **pluggable extractor** —
built-in เป็น mock ที่ deterministic ตาม convention ของ repo (เช่นเดียวกับ
`ecommerce_product_search` ใน Phase 3) เมื่อถึง Phase 15 (PlatformAdapter) จะสลับ
extractor เป็น CDP/Open-Platform API จริงได้โดยไม่แตะ tool interface — ระบบ rate
limiting, storage และ playbook เป็นของจริงทดสอบครบแล้ว

## 🐛 Bug ที่ test จับได้ระหว่างพัฒนา
- `pruneHistory` destructuring ผิด (`[, , platform, skuId]` บน key 3 ส่วน) ทำให้
  skip ทุก key ไม่ลบอะไรเลย — จับได้จาก test, แก้แล้ว

## ✅ ตัวเลข

| ตัวชี้วัด | Phase 13 | Phase 14 |
|---|---|---|
| Tests | 86 | **101** (+15) |
| Tools | 35 | **36** |

## 🚀 ถัดไป: Phase 15 — Official Open Platform APIs (ดู `ROADMAP.md`)
