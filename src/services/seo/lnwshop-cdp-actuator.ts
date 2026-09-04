import { CdpConnection } from "../cdp-connection.js";
import { SeoPolicyGuard } from "./seo-policy-guard.js";

export interface LnwShopSeoSelectors {
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  saveButton: string;
}

export class LnwShopCdpActuator {
  constructor(private cdpConnection: CdpConnection) {}

  async updateSeo(
    productId: string,
    selectors: LnwShopSeoSelectors,
    targetUrl: string,
    metaTitle?: string,
    metaKeywords?: string[],
    metaDescription?: string
  ): Promise<void> {
    // Fail-Closed Validation
    if (metaTitle) {
      const result = SeoPolicyGuard.checkPolicy({ text: metaTitle });
      if (!result.isSafe) {
        throw new Error(`นโยบาย SEO ล้มเหลว (Meta Title): ${result.reason}`);
      }
    }

    if (metaKeywords && metaKeywords.length > 0) {
      const result = SeoPolicyGuard.checkPolicy({ text: metaKeywords.join(" ") });
      if (!result.isSafe) {
        throw new Error(`นโยบาย SEO ล้มเหลว (Meta Keywords): ${result.reason}`);
      }
    }

    if (metaDescription) {
      const result = SeoPolicyGuard.checkPolicy({ text: metaDescription });
      if (!result.isSafe) {
        throw new Error(`นโยบาย SEO ล้มเหลว (Meta Description): ${result.reason}`);
      }
    }

    // CDP Interaction
    await this.cdpConnection.connect();
    const contexts = this.cdpConnection.browser!.contexts();
    const context = contexts[0] || (await this.cdpConnection.browser!.newContext());
    const page = await context.newPage();

    try {
      await page.goto(targetUrl);

      if (metaTitle) {
        const titleLocator = page.locator(selectors.metaTitle).first();
        await titleLocator.fill(metaTitle);
      }

      if (metaKeywords && metaKeywords.length > 0) {
        const keywordsLocator = page.locator(selectors.metaKeywords).first();
        await keywordsLocator.fill(metaKeywords.join(","));
      }

      if (metaDescription) {
        const descLocator = page.locator(selectors.metaDescription).first();
        await descLocator.fill(metaDescription);
      }

      const saveBtn = page.locator(selectors.saveButton).first();
      await saveBtn.click();
      
      // Wait for a short duration or network idle
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      
    } finally {
      await page.close();
    }
  }
}
