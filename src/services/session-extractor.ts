import { CdpConnection } from "./cdp-connection.js";
import { Platform } from "../types.js";

export interface SessionData {
  platform: Platform;
  cookies: any[];
  userAgent: string;
  csrfToken?: string;
  authorization?: string;
}

export class SessionExtractor {
  private cdp: CdpConnection;

  constructor(cdp: CdpConnection) {
    this.cdp = cdp;
  }

  async extractSession(platform: Platform): Promise<SessionData | null> {
    const tabs = await this.cdp.getActiveStoreTabs();
    const targetTab = tabs.find(t => t.platform === platform);

    if (!targetTab) {
      throw new Error(`ไม่พบหน้าต่างที่เปิดใช้งานสำหรับแพลตฟอร์ม ${platform}`);
    }

    await this.cdp.connect();
    const browser = this.cdp.browser;

    if (!browser) {
       throw new Error("Browser not connected");
    }

    const contexts = browser.contexts();
    let targetPage = null;

    for (const context of contexts) {
      const pages = context.pages();
      for (const page of pages) {
        if (page.url() === targetTab.url) {
          targetPage = page;
          break;
        }
      }
      if (targetPage) break;
    }

    if (!targetPage) {
        throw new Error("Could not find the specific page to extract session.");
    }

    const context = targetPage.context();
    const cookies = await context.cookies([targetPage.url()]);

    // Evaluate in page to get userAgent and potential tokens in localStorage/sessionStorage
    const userAgent = await targetPage.evaluate(() => window.navigator.userAgent);

    let csrfToken = undefined;
    let authorization = undefined;

    if (platform === 'shopee') {
       csrfToken = cookies.find(c => c.name === 'SPC_F')?.value || cookies.find(c => c.name === 'csrftoken')?.value;
       authorization = await targetPage.evaluate(() => window.localStorage.getItem('SPC_T_ID')) || undefined;
    } else if (platform === 'tiktok') {
       csrfToken = cookies.find(c => c.name === 'csrf_session_id')?.value;
    } else if (platform === 'lazada') {
       csrfToken = cookies.find(c => c.name === 'x5sec')?.value;
    } else if (platform === 'lnwshop') {
       csrfToken = cookies.find(c => c.name === 'PHPSESSID' || c.name === 'ci_session')?.value;
       authorization = await targetPage.evaluate(() => window.localStorage.getItem('lnw_token')) || undefined;
    }

    return {
      platform,
      cookies,
      userAgent,
      csrfToken,
      authorization
    };
  }
}
