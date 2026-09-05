import { describe, it } from "node:test";
import assert from "node:assert";
import { LnwStoreFastActuator } from "../services/seo/lnwstore-fast-actuator.js";

describe("WP19-01: LnwStoreFastActuator - High-Speed Direct-DOM Actuator", () => {
  it("Should successfully update category SEO in test/mock mode", async () => {
    const actuator = new LnwStoreFastActuator();
    const result = await actuator.updateCategory({
      catId: 1,
      catName: "เครื่องบรรจุแคปซูลยา",
      seoTitle: "เครื่องบรรจุแคปซูลยา Food Grade",
      seoDesc: "คู่มือและเครื่องบรรจุแคปซูลยาสำหรับผู้ผลิตสมุนไพร",
      seoKeywords: ["เครื่องบรรจุแคปซูล", "เครื่องกรอกแคปซูล"]
    });

    assert.strictEqual(result.success, true);
    assert.ok(result.message.includes("updated successfully"));
  });

  it("Should fail-closed and throw error if prohibited keyword 'มือสอง' is passed to category update", async () => {
    const actuator = new LnwStoreFastActuator();
    await assert.rejects(
      async () => {
        await actuator.updateCategory({
          catId: 1,
          seoTitle: "เครื่องบรรจุแคปซูล มือสอง",
          seoDesc: "รายละเอียดสินค้า",
          seoKeywords: ["เครื่องบรรจุ"]
        });
      },
      (err: any) => {
        return err.message.includes("SeoPolicyGuard Failure") && err.message.includes("มือสอง");
      }
    );
  });

  it("Should fail-closed and throw error if prohibited keyword 'อย.' is passed to blog publish", async () => {
    const actuator = new LnwStoreFastActuator();
    await assert.rejects(
      async () => {
        await actuator.publishBlog({
          title: "คู่มือผ่านการขึ้นทะเบียน อย.",
          contentHtml: "<p>เนื้อหา</p>",
          seoTitle: "คู่มือเครื่องบรรจุ",
          seoDesc: "รายละเอียด",
          seoKeywords: ["เครื่องบรรจุ"],
          slug: "guide-test",
          tags: ["สมุนไพร"]
        });
      },
      (err: any) => {
        return err.message.includes("SeoPolicyGuard Failure") && err.message.includes("อย.");
      }
    );
  });

  it("Should successfully simulate blog publication in test/mock mode", async () => {
    const actuator = new LnwStoreFastActuator();
    const result = await actuator.publishBlog({
      title: "เครื่องบรรจุแคปซูล 100 กับ 200 ช่อง เลือกแบบไหนให้เหมาะกับปริมาณงาน",
      contentHtml: "<h2>การเลือกขนาดรอบงาน</h2><p>เปรียบเทียบเครื่องบรรจุแคปซูลแบบใช้แรงคน...</p>",
      seoTitle: "เครื่องบรรจุแคปซูล 100 หรือ 200 ช่อง เลือกแบบไหนดี",
      seoDesc: "เปรียบเทียบเครื่องบรรจุแคปซูลแบบใช้แรงคน 100 และ 200 ช่อง ทั้งปริมาณงาน พื้นที่ และความเหมาะสม",
      seoKeywords: ["เครื่องบรรจุแคปซูล 100 ช่อง", "เครื่องบรรจุแคปซูล 200 ช่อง"],
      slug: "capsule-filling-machine-100-vs-200",
      tags: ["เครื่องบรรจุแคปซูล", "สมุนไพร"]
    });

    assert.strictEqual(result.success, true);
    assert.ok(result.targetUrl?.includes("capsule-filling-machine-100-vs-200"));
  });

  it("Should successfully simulate JSON-LD schema injection in test/mock mode", async () => {
    const actuator = new LnwStoreFastActuator();
    const result = await actuator.injectSchema({
      jsonLdScript: '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Store","name":"CapsuleFill"}</script>'
    });

    assert.strictEqual(result.success, true);
    assert.ok(result.message.includes("Schema JSON-LD injected"));
  });
});
