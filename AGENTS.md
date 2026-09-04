# 🛑 ZERO-DEFECT PROTOCOL: MCP SCHEMA & ENTERPRISE COMPATIBILITY

กฎระเบียบข้อบังคับสูงสุดสำหรับ AI Developer (Jules) และ AI Controller (Project Manager)
ห้ามละเมิดข้อกำหนดเหล่านี้โดยเด็ดขาดในทุกรอบการพัฒนาและการส่งมอบงาน:

---

### 📌 หน้าที่และความรับผิดชอบของ Jules (Developer Agent)
1. **STRICT TYPING MANDATE (ห้ามสร้าง Loose Schema):**
   - ทุกพารามิเตอร์ที่เป็น `type: "array"` ต้องระบุ `items` กำกับชนิดข้อมูลภายในอย่างชัดเจนเสมอ ห้ามใช้ `z.array()` หรือ `type: "array"` เปล่าเด็ดขาด
   - ทุกพารามิเตอร์ที่เป็น `type: "object"` ต้องระบุ `properties` และ `required` ชัดเจน หากเป็น Dynamic Object ต้องใส่ Dummy Properties เพื่อผ่านการตรวจสอบของ Vertex AI เสมอ
   - ห้ามใช้ Unsupported Keywords เช่น `$schema`, `$ref`, `patternProperties`, หรือ nested `anyOf` ซับซ้อน

2. **PRE-BUILD VALIDATION:**
   - ก่อนรายงานจบงาน ต้องผ่านการรัน `npm run build` (TypeScript Typecheck) และ Unit Test 100% ทุกครั้ง

---

### 📌 หน้าที่และความรับผิดชอบของ Controller Agent (Reviewer / Supervisor)
1. **SCHEMA AUDIT GATEWAY:**
   - ห้าม Approve งานหรืออนุญาตให้ Merge โค้ดใดๆ หากยังไม่ได้ตรวจสอบไฟล์ Tool Definitions (`src/index.ts` หรือ `tools.ts`) ว่ามีฟิลด์ `array` หรือ `object` ที่ตกหล่นหรือไม่
   - หากตรวจพบว่า Jules ส่งมอบ Schema ที่ไม่มี `items` หรือไม่มี `properties` ให้ตีกลับงานทันทีและสั่งแก้ก่อนประกาศจบเฟส

2. **SESSION & RUNTIME INTEGRITY:**
   - ควบคุมไม่ให้จำนวน MCP Tools ที่ลงทะเบียนส่ง Schema เกินความจำเป็น และรักษาความเข้ากันได้กับ Google Vertex AI และ Anthropic Claude API เป็นอันดับ 1 เสมอ

3. **COPILOT SESSION BINDING:**
   - สำหรับการปรึกษาด้านสถาปัตยกรรมและกลยุทธ์ Content กับ Microsoft 365 Copilot ต้องเชื่อมโยงตรงกับห้องหลัก **`Ecomm MCP 02`** (Conversation ID: `ca622d79-24f3-4850-80ab-f269ef431069`) เสมอ ห้ามเปิดห้องใหม่หรือส่งคำสั่งโดยไม่ระบุ Room ID นี้เด็ดขาด

