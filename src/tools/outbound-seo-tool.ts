import { OutboundSeoPublisher } from "../services/seo/outbound-seo-publisher.js";

export async function handleEcommerceOutboundSeoPublisher(args: any) {
  try {
    const topic = args?.topic || "เครื่องบรรจุแคปซูลยา";
    const targetKeyword = args?.targetKeyword;
    const targetUrl = args?.targetUrl || "https://www.capsulefill.com";
    const platform = args?.platform || "CMFreePost";

    if (!targetKeyword || typeof targetKeyword !== "string") {
      return {
        isError: true,
        content: [{ type: "text", text: "Missing or invalid 'targetKeyword' parameter." }]
      };
    }

    const article = OutboundSeoPublisher.generateArticle(topic, targetKeyword, targetUrl, platform);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            message: `สร้างแพ็กเกจบทความและลิงก์สำหรับ ${platform} สำเร็จ (ผ่านการตรวจสอบคำต้องห้าม 100%)`,
            article
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
