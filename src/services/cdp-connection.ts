import { chromium, Browser } from "playwright";
import { StoreTabInfo, Platform } from "../types.js";

export class CdpConnection {
  public browser: Browser | null = null;
  private port: number;

  constructor(port: number = 9222) {
    this.port = port;
  }

  async connect(): Promise<void> {
    if (this.browser) return;
    try {
      this.browser = await chromium.connectOverCDP(`http://localhost:${this.port}`);
    } catch (error) {
      throw new Error(
        `ไม่สามารถเชื่อมต่อ Chrome/Edge บนพอร์ต ${this.port} ได้ กรุณาเปิดเบราว์เซอร์ด้วยคำสั่ง: --remote-debugging-port=${this.port}`
      );
    }
  }

  async getActiveStoreTabs(): Promise<StoreTabInfo[]> {
    if (!this.browser) {
      await this.connect();
    }

    const tabs: StoreTabInfo[] = [];
    const contexts = this.browser!.contexts();

    for (const context of contexts) {
      const pages = context.pages();
      for (const page of pages) {
        const url = page.url();
        let platform: Platform | null = null;

        if (url.includes('seller.shopee.co.th')) {
          platform = 'shopee';
        } else if (url.includes('seller-th.tiktok.com')) {
          platform = 'tiktok';
        } else if (url.includes('sellercenter.lazada.co.th')) {
          platform = 'lazada';
        }

        if (platform) {
          const title = await page.title().catch(() => url);
          tabs.push({
            platform,
            title,
            url,
            isLoggedIn: true
          });
        }
      }
    }

    return tabs;
  }

  async disconnect(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
