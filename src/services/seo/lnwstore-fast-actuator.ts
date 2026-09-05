import { CdpConnection } from "../cdp-connection.js";
import { SeoPolicyGuard } from "./seo-policy-guard.js";

export interface LnwStoreCategoryUpdateParams {
  catId: number;
  catName?: string;
  seoTitle: string;
  seoDesc: string;
  seoKeywords: string[];
  richHtml?: string;
  storeDomain?: string; // default: "a.lnwstore.com/capsulefill"
}

export interface LnwStoreBlogPublishParams {
  title: string;
  contentHtml: string;
  seoTitle: string;
  seoDesc: string;
  seoKeywords: string[];
  slug: string;
  tags: string[];
  status?: "publish" | "draft";
  visibility?: "public" | "private";
  storeDomain?: string;
}

export interface LnwStoreSchemaInjectParams {
  jsonLdScript: string;
  storeDomain?: string;
}

export interface LnwStoreActuatorResult {
  success: boolean;
  message: string;
  targetUrl?: string;
  data?: Record<string, any>;
}

export class LnwStoreFastActuator {
  constructor(private cdpConnection?: CdpConnection) {}

  private validatePolicy(...texts: (string | string[] | undefined)[]): void {
    for (const item of texts) {
      if (!item) continue;
      if (Array.isArray(item)) {
        for (const str of item) {
          const check = SeoPolicyGuard.checkPolicy({ text: str });
          if (!check.isSafe) {
            const terms = check.rejectedKeywords ? check.rejectedKeywords.join(", ") : "prohibited term";
            throw new Error(`SeoPolicyGuard Failure: Prohibited term '${terms}' detected in '${str}'`);
          }
        }
      } else {
        const check = SeoPolicyGuard.checkPolicy({ text: item });
        if (!check.isSafe) {
          const terms = check.rejectedKeywords ? check.rejectedKeywords.join(", ") : "prohibited term";
          throw new Error(`SeoPolicyGuard Failure: Prohibited term '${terms}' detected in '${item}'`);
        }
      }
    }
  }

  private async getPage(storeDomain: string) {
    if (!this.cdpConnection) return null;
    await this.cdpConnection.connect();
    if (!this.cdpConnection.browser) return null;
    const contexts = this.cdpConnection.browser.contexts();
    const context = contexts[0] || (await this.cdpConnection.browser.newContext());
    const pages = context.pages();
    for (const p of pages) {
      if (p.url().includes(storeDomain)) return p;
    }
    return await context.newPage();
  }

  async updateCategory(params: LnwStoreCategoryUpdateParams): Promise<LnwStoreActuatorResult> {
    this.validatePolicy(params.catName, params.seoTitle, params.seoDesc, params.seoKeywords, params.richHtml);

    const storeDomain = params.storeDomain || "a.lnwstore.com/capsulefill";
    const targetUrl = `https://${storeDomain}/category/edit/${params.catId}`;

    if (process.env.NODE_ENV === "test" || !this.cdpConnection) {
      return {
        success: true,
        message: `[Mock] Category ${params.catId} SEO updated successfully on ${storeDomain}`,
        targetUrl,
        data: { catId: params.catId, seoTitle: params.seoTitle, keywords: params.seoKeywords }
      };
    }

    try {
      const page = await this.getPage(storeDomain);
      if (!page) {
        throw new Error(`No active browser tab found for ${storeDomain}`);
      }

      await page.goto(targetUrl, { waitUntil: "domcontentloaded" });

      await page.evaluate((data: any) => {
        const titleEl = document.querySelector('[varname="seo-title"]') as HTMLInputElement;
        const descEl = document.querySelector('[varname="seo-description"]') as HTMLTextAreaElement;
        const kwEl = document.querySelector('[varname="seo-keyword"]') as HTMLInputElement;

        if (titleEl) titleEl.value = data.seoTitle;
        if (descEl) descEl.value = data.seoDesc;
        if (kwEl) kwEl.value = data.seoKeywords.join(", ");

        if (data.richHtml && (window as any).tinymce && (window as any).tinymce.get('tinymce_desc')) {
          (window as any).tinymce.get('tinymce_desc').setContent(data.richHtml);
        }

        const form = document.querySelector('form[name="cat_form"]') as HTMLFormElement || document.querySelector('form') as HTMLFormElement;
        if (form && typeof (window as any).editcat_submit === 'function') {
          (window as any).editcat_submit(form);
        } else if ((window as any).$ && (window as any).$.lnwajax) {
          (window as any).$.lnwajax.run();
        }
      }, {
        seoTitle: params.seoTitle,
        seoDesc: params.seoDesc,
        seoKeywords: params.seoKeywords,
        richHtml: params.richHtml
      });

      return {
        success: true,
        message: `Category ${params.catId} SEO updated successfully`,
        targetUrl,
        data: { catId: params.catId }
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Category update failed: ${err.message}`,
        targetUrl
      };
    }
  }

  async publishBlog(params: LnwStoreBlogPublishParams): Promise<LnwStoreActuatorResult> {
    this.validatePolicy(params.title, params.contentHtml, params.seoTitle, params.seoDesc, params.seoKeywords, params.slug, params.tags);

    const storeDomain = params.storeDomain || "a.lnwstore.com/capsulefill";
    const targetUrl = `https://${storeDomain}/blog/edit/new`;

    if (process.env.NODE_ENV === "test" || !this.cdpConnection) {
      return {
        success: true,
        message: `[Mock] Blog post '${params.title}' published successfully on ${storeDomain}`,
        targetUrl: `https://${storeDomain}/article/${params.slug}`,
        data: { title: params.title, slug: params.slug, tags: params.tags }
      };
    }

    try {
      const page = await this.getPage(storeDomain);
      if (!page) {
        throw new Error(`No active browser tab found for ${storeDomain}`);
      }

      await page.goto(targetUrl, { waitUntil: "domcontentloaded" });

      await page.evaluate((data: any) => {
        const vm = (window as any).vm;
        if (vm && vm.vars) {
          vm.vars.title = data.title;
          vm.vars.content = data.contentHtml;
          vm.vars.tags = data.tags;
          vm.vars.seo_title = data.seoTitle;
          vm.vars.seo_description = data.seoDesc;
          vm.vars.seo_keyword = data.seoKeywords.join(", ");
          vm.vars.custom_slug = data.slug;
        }

        if (data.contentHtml && (window as any).tinymce && (window as any).tinymce.get('tinymce_content')) {
          (window as any).tinymce.get('tinymce_content').setContent(data.contentHtml);
        }

        if (vm && typeof vm.save_post === 'function') {
          vm.save_post();
        }
      }, {
        title: params.title,
        contentHtml: params.contentHtml,
        seoTitle: params.seoTitle,
        seoDesc: params.seoDesc,
        seoKeywords: params.seoKeywords,
        slug: params.slug,
        tags: params.tags
      });

      return {
        success: true,
        message: `Blog post '${params.title}' published successfully`,
        targetUrl: `https://${storeDomain}/article/${params.slug}`,
        data: { title: params.title, slug: params.slug }
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Blog publication failed: ${err.message}`,
        targetUrl
      };
    }
  }

  async injectSchema(params: LnwStoreSchemaInjectParams): Promise<LnwStoreActuatorResult> {
    this.validatePolicy(params.jsonLdScript);

    const storeDomain = params.storeDomain || "a.lnwstore.com/capsulefill";
    const targetUrl = `https://${storeDomain}/script/other/`;

    if (process.env.NODE_ENV === "test" || !this.cdpConnection) {
      return {
        success: true,
        message: `[Mock] Schema JSON-LD injected successfully on ${storeDomain}`,
        targetUrl,
        data: { scriptLength: params.jsonLdScript.length }
      };
    }

    try {
      const page = await this.getPage(storeDomain);
      if (!page) {
        throw new Error(`No active browser tab found for ${storeDomain}`);
      }

      await page.goto(targetUrl, { waitUntil: "domcontentloaded" });

      await page.evaluate((script: any) => {
        if (typeof (window as any)._lck === 'function') {
          (window as any)._lck('config', 'functionality_storage', script);
        }
      }, params.jsonLdScript);

      return {
        success: true,
        message: `Schema JSON-LD injected successfully`,
        targetUrl,
        data: { scriptLength: params.jsonLdScript.length }
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Schema injection failed: ${err.message}`,
        targetUrl
      };
    }
  }
}
