import fs from 'fs';
import { chromium, Browser } from "playwright";
import { StoreTabInfo, Platform } from "../types.js";
import { spawn } from "child_process";
import os from "os";

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
      if (os.platform() === 'win32') {
         console.log("CDP connection failed on Windows. Attempting to auto-launch browser...");
         await this.autoLaunchWindows();
         // Wait a moment for the browser to start
         await new Promise(resolve => setTimeout(resolve, 3000));
         try {
             this.browser = await chromium.connectOverCDP(`http://localhost:${this.port}`);
             return;
         } catch (e) {
             throw new Error(
                `ไม่สามารถเชื่อมต่อหรือเปิด Chrome/Edge บนพอร์ต ${this.port} ได้โดยอัตโนมัติ กรุณาเปิดด้วยตนเอง`
             );
         }
      }

      throw new Error(
        `ไม่สามารถเชื่อมต่อ Chrome/Edge บนพอร์ต ${this.port} ได้ กรุณาเปิดเบราว์เซอร์ด้วยคำสั่ง: --remote-debugging-port=${this.port}`
      );
    }
  }

  private async autoLaunchWindows() {
     const appData = process.env.APPDATA || `${os.homedir()}/AppData/Roaming`;
     const profileDir = `${appData}\\openworker-ecommerce\\chrome-profile`;

     const chromePaths = [
         `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`,
         `C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe`,
         `C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe`
     ];

     let exe = chromePaths[0];
     for (const p of chromePaths) {
         if (fs.existsSync(p)) {
             exe = p;
             break;
         }
     }
     const args = [`--remote-debugging-port=${this.port}`, `--user-data-dir=${profileDir}`];

     console.log(`Spawning ${exe} with args ${args.join(' ')}`);
     const child = spawn(exe, args, { detached: true, stdio: 'ignore' });
     child.unref();
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
