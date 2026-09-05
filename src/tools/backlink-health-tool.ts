import { BacklinkHealthMonitor } from "../services/seo/backlink-health-monitor.js";

export async function handleEcommerceAuditBacklinks(args: any) {
  try {
    const urls = args?.urls;
    const expectedTargetUrl = args?.expectedTargetUrl || "https://www.capsulefill.com";
    const expectedAnchorTexts = args?.expectedAnchorTexts || [];

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return {
        isError: true,
        content: [{ type: "text", text: "กรุณาระบุ 'urls' เป็น array ของ URL ที่ต้องการตรวจสอบ" }]
      };
    }

    if (!Array.isArray(expectedAnchorTexts)) {
      return {
        isError: true,
        content: [{ type: "text", text: "พารามิเตอร์ 'expectedAnchorTexts' ต้องเป็น array" }]
      };
    }

    const report = await BacklinkHealthMonitor.auditBacklinks({
      urls,
      expectedTargetUrl,
      expectedAnchorTexts
    });

    if (!report.success) {
      return {
        isError: true,
        content: [{ type: "text", text: JSON.stringify({ status: "error", message: report.error }) }]
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            message: "ตรวจสอบสถานะ Backlink เสร็จสิ้น",
            report
          }, null, 2)
        }
      ]
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: JSON.stringify({ status: "error", message: error.message }) }]
    };
  }
}
