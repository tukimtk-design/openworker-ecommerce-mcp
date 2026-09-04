import { CdpConnection } from "../services/cdp-connection.js";
import { OutboundAutoPoster, OutboundPostOptions, OutboundPosterSelectors } from "../services/seo/outbound-auto-poster.js";

export async function handleEcommerceOutboundAutoPoster(args: any) {
  const targetUrl = args?.targetUrl;
  const platform = args?.platform;
  const title = args?.title;
  const content = args?.content;
  const anchorLinks = args?.anchorLinks;
  const tags = args?.tags;
  const selectors = args?.selectors as OutboundPosterSelectors;
  const dryRun = args?.dryRun;

  // Type strictness and required fields
  if (!targetUrl || typeof targetUrl !== 'string') {
    return {
      isError: true,
      content: [{ type: "text", text: "กรุณาระบุ targetUrl เป็น string" }],
    };
  }

  if (!title || typeof title !== 'string') {
    return {
      isError: true,
      content: [{ type: "text", text: "กรุณาระบุ title เป็น string" }],
    };
  }

  if (!content || typeof content !== 'string') {
    return {
      isError: true,
      content: [{ type: "text", text: "กรุณาระบุ content เป็น string" }],
    };
  }

  if (!selectors || typeof selectors !== 'object') {
    return {
      isError: true,
      content: [{ type: "text", text: "กรุณาระบุ selectors เป็น object" }],
    };
  }
  
  if (!selectors.titleInput || !selectors.contentInput || !selectors.submitButton) {
      return {
          isError: true,
          content: [{ type: "text", text: "selectors ต้องมี titleInput, contentInput และ submitButton" }],
      };
  }

  if (platform !== undefined && typeof platform !== 'string') {
     return {
        isError: true,
        content: [{ type: "text", text: "platform ต้องเป็น string" }],
      };
  }

  if (anchorLinks !== undefined && !Array.isArray(anchorLinks)) {
      return {
        isError: true,
        content: [{ type: "text", text: "anchorLinks ต้องเป็น array ของ string" }],
      };
  }
  
  if (tags !== undefined && !Array.isArray(tags)) {
      return {
        isError: true,
        content: [{ type: "text", text: "tags ต้องเป็น array ของ string" }],
      };
  }

  const cdp = new CdpConnection();
  const poster = new OutboundAutoPoster(cdp);

  try {
    const options: OutboundPostOptions = {
        targetUrl,
        platform,
        title,
        content,
        anchorLinks,
        tags,
        selectors,
        dryRun
    };

    await poster.postToWebboard(options);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            message: dryRun ? "จำลองการโพสต์ข้อมูลสำเร็จ (Dry Run)" : "โพสต์ข้อมูลลง Webboard/Classified สำเร็จ",
            data: { targetUrl, platform, dryRun }
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
