import { Platform } from "../types.js";

export async function handleEcommerceOwLnwshopSafeSeoUpdater(args: any) {
  const platform = args?.platform as Platform;
  const productId = args?.productId;
  const metaTitle = args?.metaTitle;
  const metaKeywords = args?.metaKeywords;
  const metaDescription = args?.metaDescription;

  if (platform !== "lnwshop") {
    return {
      isError: true,
      content: [{ type: "text", text: "แพลตฟอร์มไม่รองรับ (รองรับเฉพาะ lnwshop เท่านั้น)" }],
    };
  }

  if (!productId) {
    return {
      isError: true,
      content: [{ type: "text", text: "กรุณาระบุ productId" }],
    };
  }

  // Fail-closed mechanisms
  try {
    // 1. Validate metaTitle
    if (metaTitle !== undefined) {
      if (typeof metaTitle !== "string") throw new Error("metaTitle ต้องเป็นข้อความ");
      if (metaTitle.length > 70) {
        throw new Error("metaTitle ยาวเกินไป (ไม่ควรเกิน 70 ตัวอักษรเพื่อหลีกเลี่ยงการแสดงผลผิดพลาด)");
      }
      if (/<[a-z][\s\S]*>/i.test(metaTitle)) {
        throw new Error("metaTitle ห้ามมี HTML tags");
      }
    }

    // 2. Validate metaKeywords
    if (metaKeywords !== undefined) {
      if (!Array.isArray(metaKeywords)) throw new Error("metaKeywords ต้องเป็น array ของข้อความ");
      if (metaKeywords.length > 15) {
        throw new Error("metaKeywords มากเกินไป (ไม่ควรเกิน 15 คำ)");
      }
      for (const kw of metaKeywords) {
        if (typeof kw !== "string") throw new Error("keyword ภายในต้องเป็นข้อความ");
        if (/<[a-z][\s\S]*>/i.test(kw)) {
           throw new Error("metaKeywords ห้ามมี HTML tags");
        }
      }
    }

    // 3. Validate metaDescription
    if (metaDescription !== undefined) {
      if (typeof metaDescription !== "string") throw new Error("metaDescription ต้องเป็นข้อความ");
      if (metaDescription.length > 320) {
        throw new Error("metaDescription ยาวเกินไป (ไม่ควรเกิน 320 ตัวอักษร)");
      }
      if (/<[a-z][\s\S]*>/i.test(metaDescription)) {
        throw new Error("metaDescription ห้ามมี HTML tags");
      }
    }

    // Mock API call simulation
    // In a real scenario, this would call apiClient.updateSeo(...)

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            message: "อัปเดตข้อมูล SEO สำเร็จโดยไม่กระทบโครงสร้างหน้าเว็บ",
            data: {
              productId,
              metaTitle,
              metaKeywords,
              metaDescription
            }
          })
        }
      ]
    };
  } catch (error: any) {
    // Fail-closed execution block
    return {
      isError: true,
      content: [{ type: "text", text: JSON.stringify({ status: "error", message: error.message }) }]
    };
  }
}
