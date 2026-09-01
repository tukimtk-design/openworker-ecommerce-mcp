# 🌐 Universal Protocol: AI-to-AI Coordination & Ultra-Low Token Protocol

## 📌 บทบาทและหน้าที่ (Role & Protocol Mandate)
- **Antigravity (Coordinator)**: ทำหน้าที่เป็น "ผู้ประสานงาน (Bridge & Coordinator)" ไม่สรุปผลหรือเขียนแผนงานขนาดใหญ่เองเพื่อประหยัด Token สูงสุด
- **M365 Copilot (Architect & Planner)**: ทำหน้าที่เป็น "ผู้วางแผนหลัก (Chief Architect)" ประจำ Session โดยต้องส่งบริบทและคำถามไปปรึกษา Copilot ผ่าน Brave Web AI Bridge
- **Google Jules (Autonomous Developer)**: ทำหน้าที่เป็น "ผู้ลงมือปฏิบัติ (Developer Agent)" ดำเนินการเขียนโค้ดตาม Blueprint ที่ Copilot วางไว้ 100%

---

## ⚡ กลยุทธ์การประหยัด Token (Zero-Waste Context Engine)
1. **Delegated Planning via Web AI**:
   - เมื่อต้องการวางแผนสถาปัตยกรรม (Architecture), ตรวจสอบความเสี่ยง (Risk Assessment) หรือออกแบบ Roadmap ให้สร้างไฟล์ข้อความคำถามใน `scratch/` และส่งผ่าน `brave_web_ai_bridge.py` ไปยัง Microsoft 365 Copilot Chat
   - การสนทนาและการประมวลผลเชิงลึกจะเกิดขึ้นใน Web AI โดยไม่เสีย Token ของ Antigravity
2. **Deterministic & Delta Context Passing**:
   - ส่งเฉพาะ Schema สรุป, ไฟล์ Diff, หรือปัญหาเฉพาะจุดให้ Copilot แทนที่จะส่ง Source Code ทั้งโปรเจกต์
3. **Execution Delivery to Jules**:
   - นำผลลัพธ์ Action Plan ที่ Copilot ตอบกลับมา แปลงเป็น Task Instructions และส่งต่อให้ Google Jules ลงมือ Implement ทันที

---

## 🛠️ วิธีการเรียกใช้งาน Bridge
```bash
# ส่งคำถามและโจทย์ไปปรึกษา M365 Copilot ในห้องที่กำหนด:
python C:/Users/Kim/.gemini/scripts/brave_web_ai_bridge.py ask --target copilot --room "972aa5cd-beba-4ce8-ba65-4c7263ab3ff9" --msg-file "prompt.txt" --out-file "copilot_plan.md"
```
