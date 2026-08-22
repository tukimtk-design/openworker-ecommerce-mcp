import { CdpConnection } from "../services/cdp-connection.js";
import { StoreTabInfo } from "../types.js";

export async function handleBrowserAttachExisting(args: any) {
  const port = args?.port || 9222;
  const cdp = new CdpConnection(port);

  try {
    await cdp.connect();
    const tabs: StoreTabInfo[] = await cdp.getActiveStoreTabs();

    // We don't close the browser connection here if we want to keep it open
    // but typically `connectOverCDP` doesn't kill the actual browser when disconnected.
    // However, since it's just querying, we can disconnect to clean up the CDP session,
    // or keep it open. For this tool, let's disconnect after fetching.
    await cdp.disconnect();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "connected",
            message: "เชื่อมต่อเบราว์เซอร์สำเร็จและพบหน้าต่างร้านค้าตามรายการด้านล่าง",
            tabs
          }),
        },
      ],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "error",
            message: error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ"
          }),
        },
      ],
    };
  }
}
