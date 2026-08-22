import { Platform } from "../types.js";
import { SessionData } from "./session-extractor.js";

export class ApiClient {
  private sessionData: SessionData | null = null;
  private platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  setSessionData(sessionData: SessionData) {
    this.sessionData = sessionData;
  }

  // This is a mocked or basic wrapper for updating price and stock.
  // In a real application, you would make actual HTTP requests to the
  // respective seller center APIs using the extracted cookies and tokens.
  async updatePriceAndStock(productId: string, skuId?: string, newPrice?: number, newStock?: number) {
    if (!this.sessionData) {
      throw new Error(`ไม่มีข้อมูล Session สำหรับแพลตฟอร์ม ${this.platform}`);
    }

    // Prepare headers based on extracted session
    const headers: Record<string, string> = {
      'User-Agent': this.sessionData.userAgent,
      'Cookie': this.sessionData.cookies.map(c => `${c.name}=${c.value}`).join('; '),
      'Content-Type': 'application/json'
    };

    if (this.sessionData.csrfToken) {
       if (this.platform === 'shopee') {
           headers['x-csrftoken'] = this.sessionData.csrfToken;
       } else if (this.platform === 'tiktok') {
           headers['x-secstate'] = this.sessionData.csrfToken; // Just an example
       }
    }

    if (this.sessionData.authorization) {
        headers['Authorization'] = `Bearer ${this.sessionData.authorization}`;
    }

    // In a real implementation, you'd fetch the specific API endpoint.
    // For Issue #2, we mock the success response to demonstrate the structure.
    console.error(`[ApiClient] Mocking update for ${this.platform}, Product: ${productId}, SKU: ${skuId}`);

    return {
       success: true,
       message: 'อัปเดตราคา/สต็อกสำเร็จ (Mock)',
       platform: this.platform,
       productId,
       skuId,
       newPrice,
       newStock
    };
  }
}
