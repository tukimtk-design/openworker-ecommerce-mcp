# 📋 WORK PACKAGE SPECIFICATION: WP19-01
## Title: LnwStoreFastActuator — High-Speed Native Admin CDP Actuator & Single-Gateway Tools
**Target Repository:** `e:\ecommerce-mcp`  
**Author / Controller:** Antigravity (Project Supervisor)  
**Assignee / Implementer:** Google Jules (Developer Agent)  
**Strict Mandate:** ZERO-DEFECT PROTOCOL (`AGENTS.md`)

---

### 1. Objective & Background
จากการทดสอบและลงมือปฏิบัติการบนระบบจริงของ `www.capsulefill.com` พบว่าการสั่งงานผ่าน DOM selector ทั่วไปมี latency สูงและสิ้นเปลือง token ในการส่งต่อข้อมูลอย่างมาก จึงจำเป็นต้องพัฒนา **`LnwStoreFastActuator`** ที่เชื่อมต่อกับ Internal Architecture ของ LnwStore โดยตรง:
1. **Category Management (`[varname]` + `adata`):** เข้าถึงฟิลด์ SEO (`seo-title`, `seo-description`, `seo-keyword`) และ TinyMCE (`tinymce_desc`) โดยตรง แล้วสั่งบันทึกผ่าน `editcat_submit(form)` / `$.lnwajax.run`
2. **Blog Publishing (Vue.js `vm.vars`):** ป้อนข้อมูลเข้าตัวแปรของ Vue (`title`, `content`, `tags`, `seo_title`, `seo_description`, `seo_keyword`, `custom_slug`) ร่วมกับ `tinymce_content` แล้วสั่ง `vm.save_post()`
3. **Script / Schema Injection (`functionality_storage`):** ฝัง JSON-LD Rich Snippet เข้าสู่ระบบ Script 3rd party ของ LnwStore เพื่อให้ Googlebot ดึงข้อมูลได้ทันที

---

### 2. Architecture & File Requirements

Jules ต้องทำการสร้างและแก้ไขไฟล์ตามโครงสร้างต่อไปนี้:

#### 2.1 [NEW] `src/services/seo/lnwstore-fast-actuator.ts`
Service หลักที่ทำงานผ่าน `CdpConnection` โดยต้องมี Interface และ Class ดังนี้:

```typescript
export interface LnwStoreCategoryUpdateParams {
  catId: number;
  catName?: string;
  seoTitle: string;
  seoDesc: string;
  seoKeywords: string[];
  richHtml?: string;
  storeDomain?: string; // default: "a.lnwstore.com/capsulefill"
}

export interface LnwStoreBlogPublishParams {
  title: string;
  contentHtml: string;
  seoTitle: string;
  seoDesc: string;
  seoKeywords: string[];
  slug: string;
  tags: string[];
  status?: "publish" | "draft";
  visibility?: "public" | "private";
  storeDomain?: string;
}

export interface LnwStoreSchemaInjectParams {
  jsonLdScript: string;
  storeDomain?: string;
}

export interface LnwStoreActuatorResult {
  success: boolean;
  message: string;
  targetUrl?: string;
  data?: Record<string, any>;
}

export class LnwStoreFastActuator {
  constructor(private cdpConnection: CdpConnection) {}

  async updateCategory(params: LnwStoreCategoryUpdateParams): Promise<LnwStoreActuatorResult>;
  async publishBlog(params: LnwStoreBlogPublishParams): Promise<LnwStoreActuatorResult>;
  async injectSchema(params: LnwStoreSchemaInjectParams): Promise<LnwStoreActuatorResult>;
}
```

#### 2.2 [NEW] `src/tools/lnwstore-fast-actuator-tool.ts`
Handlers สำหรับเชื่อมต่อเข้า Single-Gateway และตรวจสอบความถูกต้องของ Schema:
- `handleEcommerceLnwstoreUpdateCategory(args: any): Promise<any>`
- `handleEcommerceLnwstorePublishBlog(args: any): Promise<any>`
- `handleEcommerceLnwstoreInjectSchema(args: any): Promise<any>`

#### 2.3 [MODIFY] `src/tools/gateway.ts`
ลงทะเบียน 3 Actions ใหม่ลงใน `ACTION_REGISTRY`:
- `lnwstore_update_category` (category: `actuator`)
- `lnwstore_publish_blog` (category: `actuator`)
- `lnwstore_inject_schema` (category: `actuator`)

#### 2.4 [NEW] `tests/lnwstore-fast-actuator.test.ts`
Unit Test ครอบคลุม 100%:
1. ตรวจสอบการส่งค่าปกติ (Happy Path) ผ่าน Mocked CDP
2. ตรวจสอบ Pre-flight Policy Guard: หากพบคำต้องห้าม (`มือสอง`, `ปิดฝาฟอยล์`, `กระปุก`, `อย.`) ต้อง Reject ทันทีโดยไม่ยิงคำสั่ง CDP
3. ตรวจสอบ Validation Error เมื่อ Parameter ขาดหรือไม่ตรงตาม Type

---

### 3. Strict Compliance & Zero-Defect Mandate

1. **Vertex AI Strict Typing:**
   - ทุก `array` ใน tool schema ต้องระบุ `items` ชนิดข้อมูลกำกับเสมอ
   - ห้ามใช้ Empty Object (`{}`) เด็ดขาด หากมี dynamic payload ให้ระบุ dummy properties ชัดเจน
   - ห้ามใช้ `$schema`, `$ref`, `patternProperties`
2. **Fail-Closed Negative Keywords:**
   - ต้องเรียก `SeoPolicyGuard.checkPolicy` ในทุกฟังก์ชันก่อนเริ่มการทำงาน
3. **Pre-Build Test:**
   - รัน `npm run build` และ `npm test` ต้องผ่าน 100% ไม่มี error หรือ broken types

---

### 4. Definition of Done (DoD)
- [ ] ไฟล์ `src/services/seo/lnwstore-fast-actuator.ts` ถูกพัฒนาและผ่าน Typecheck
- [ ] ไฟล์ `src/tools/lnwstore-fast-actuator-tool.ts` และการลงทะเบียนใน `gateway.ts` ถูกต้องตามมาตรฐาน MCP
- [ ] Unit Test `tests/lnwstore-fast-actuator.test.ts` ผ่าน 100%
- [ ] ผ่านการรัน `npm run build` สำเร็จเรียบร้อย
- [ ] เปิด Pull Request (หรือ Commit ลง branch `phase-12-14-autonomous-profit-mesh`)
