import { CdpConnection } from "../services/cdp-connection.js";
import { LnwShopCdpActuator, LnwShopSeoSelectors } from "../services/seo/lnwshop-cdp-actuator.js";

export async function handleEcommerceLnwshopCdpActuator(args: any) {
  const productId = args?.productId;
  const targetUrl = args?.targetUrl;
  const selectors = args?.selectors as LnwShopSeoSelectors;
  const metaTitle = args?.metaTitle;
  const metaKeywords = args?.metaKeywords;
  const metaDescription = args?.metaDescription;

  if (!productId || typeof productId !== 'string') {
    return {
      isError: true,
      content: [{ type: "text", text: "กรุณาระบุ productId เป็น string" }],
    };
  }

  if (!targetUrl || typeof targetUrl !== 'string') {
    return {
      isError: true,
      content: [{ type: "text", text: "กรุณาระบุ targetUrl เป็น string" }],
    };
  }

  if (!selectors || typeof selectors !== 'object') {
    return {
      isError: true,
      content: [{ type: "text", text: "กรุณาระบุ selectors เป็น object" }],
    };
  }

  // Type strictness for optional fields
  if (metaTitle !== undefined && typeof metaTitle !== 'string') {
     return {
        isError: true,
        content: [{ type: "text", text: "metaTitle ต้องเป็น string" }],
      };
  }

  if (metaKeywords !== undefined && !Array.isArray(metaKeywords)) {
      return {
        isError: true,
        content: [{ type: "text", text: "metaKeywords ต้องเป็น array ของ string" }],
      };
  }

  if (metaDescription !== undefined && typeof metaDescription !== 'string') {
      return {
        isError: true,
        content: [{ type: "text", text: "metaDescription ต้องเป็น string" }],
      };
  }

  const cdp = new CdpConnection();
  const actuator = new LnwShopCdpActuator(cdp);

  try {
    await actuator.updateSeo(
      productId,
      selectors,
      targetUrl,
      metaTitle,
      metaKeywords,
      metaDescription
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            message: "อัปเดตข้อมูล SEO บน capsulefill.com สำเร็จ (CDP Actuator)",
            data: { productId, targetUrl }
          })
        }
      ]
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: JSON.stringify({ status: "error", message: error.message }) }]
    };
  } finally {
    await cdp.disconnect();
  }
}
