import { CdpConnection } from "../cdp-connection.js";
import { SeoPolicyGuard } from "./seo-policy-guard.js";

export interface OutboundPosterSelectors {
  titleInput: string;
  contentInput: string;
  tagsInput?: string;
  anchorLinksInput?: string;
  submitButton: string;
}

export interface OutboundPostOptions {
  targetUrl: string;
  platform?: string; // Optional identifier like 'CMFreePost', 'Ezymar', 'ISIT'
  title: string;
  content: string;
  anchorLinks?: string[];
  tags?: string[];
  selectors: OutboundPosterSelectors;
  dryRun?: boolean;
}

export class OutboundAutoPoster {
  constructor(private cdpConnection: CdpConnection) {}

  async postToWebboard(options: OutboundPostOptions): Promise<void> {
    const { targetUrl, title, content, anchorLinks, tags, selectors, dryRun } = options;

    // Strict Fail-Closed Validation via SeoPolicyGuard
    const validateField = (text: string | undefined, fieldName: string) => {
      if (text) {
        const result = SeoPolicyGuard.checkPolicy({ text });
        if (!result.isSafe) {
          throw new Error(`นโยบาย SEO ล้มเหลว (${fieldName}): ${result.reason}`);
        }
      }
    };

    validateField(title, 'Title');
    validateField(content, 'Content');
    if (tags && tags.length > 0) {
      validateField(tags.join(' '), 'Tags');
    }
    if (anchorLinks && anchorLinks.length > 0) {
      validateField(anchorLinks.join(' '), 'AnchorLinks');
    }

    // CDP Interaction
    await this.cdpConnection.connect();
    const contexts = this.cdpConnection.browser!.contexts();
    const context = contexts[0] || (await this.cdpConnection.browser!.newContext());
    const page = await context.newPage();

    try {
      await page.goto(targetUrl);

      // Fill Title
      if (selectors.titleInput) {
        const titleLocator = page.locator(selectors.titleInput).first();
        await titleLocator.fill(title);
      }

      // Fill Content
      if (selectors.contentInput) {
        const contentLocator = page.locator(selectors.contentInput).first();
        await contentLocator.fill(content);
      }

      // Fill Tags
      if (tags && tags.length > 0 && selectors.tagsInput) {
        const tagsLocator = page.locator(selectors.tagsInput).first();
        await tagsLocator.fill(tags.join(', '));
      }

      // Fill Anchor Links
      if (anchorLinks && anchorLinks.length > 0 && selectors.anchorLinksInput) {
        const anchorLocator = page.locator(selectors.anchorLinksInput).first();
        await anchorLocator.fill(anchorLinks.join('\n'));
      }

      if (dryRun) {
        console.error(`[DryRun] ข้ามการกดปุ่ม Submit ที่ ${targetUrl}`);
        return;
      }

      // Submit
      if (selectors.submitButton) {
        const submitBtn = page.locator(selectors.submitButton).first();
        await submitBtn.click();
        
        // Wait for potential redirect or success message
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      }
      
    } finally {
      await page.close();
    }
  }
}
