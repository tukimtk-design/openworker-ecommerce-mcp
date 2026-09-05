import { CdpConnection } from "../cdp-connection.js";
import { SeoPolicyGuard } from "./seo-policy-guard.js";

export interface Article {
  id: string;
  title: string;
  content: string;
  targetKeyword: string;
  targetUrl?: string; // The URL of the published article (if known in advance or for self-reference)
}

export interface PublishSelectors {
  titleSelector: string;
  contentSelector: string;
  submitButtonSelector: string;
}

export interface WeaveResult {
  weavedArticles: Article[];
  linkMatrix: Record<string, string[]>;
  report: string;
}

export class ArticleClusterWeaver {
  constructor(private cdpConnection?: CdpConnection) {}

  /**
   * Weave cross-links between articles in the cluster and category URLs.
   */
  public weaveCluster(articles: Article[], categoryUrls: string[]): WeaveResult {
    const weavedArticles: Article[] = [];
    const linkMatrix: Record<string, string[]> = {};

    // Validate articles using SeoPolicyGuard
    for (const article of articles) {
      const titleCheck = SeoPolicyGuard.checkPolicy({ text: article.title });
      if (!titleCheck.isSafe) {
        throw new Error(`Policy violation in title for article ${article.id}: ${titleCheck.reason}`);
      }

      const contentCheck = SeoPolicyGuard.checkPolicy({ text: article.content });
      if (!contentCheck.isSafe) {
        throw new Error(`Policy violation in content for article ${article.id}: ${contentCheck.reason}`);
      }

      const keywordCheck = SeoPolicyGuard.checkPolicy({ text: article.targetKeyword });
      if (!keywordCheck.isSafe) {
        throw new Error(`Policy violation in keyword for article ${article.id}: ${keywordCheck.reason}`);
      }
    }

    // Perform weaving
    for (const article of articles) {
      let modifiedContent = article.content;
      const outgoingLinks: string[] = [];

      // Link to other articles in the cluster
      for (const other of articles) {
        if (article.id !== other.id && other.targetUrl) {
          const anchorTag = `<a href="${other.targetUrl}">${other.targetKeyword}</a>`;

          // Replace only the first occurrence to avoid over-optimizing
          if (modifiedContent.includes(other.targetKeyword) && !modifiedContent.includes(anchorTag)) {
             modifiedContent = modifiedContent.replace(other.targetKeyword, anchorTag);
             outgoingLinks.push(other.targetUrl);
          } else {
             // If keyword not naturally found, optionally append to the end as related link
             modifiedContent += `\n<p>Related: ${anchorTag}</p>`;
             outgoingLinks.push(other.targetUrl);
          }
        }
      }

      // Link to category URLs
      for (const catUrl of categoryUrls) {
          const catAnchor = `<a href="${catUrl}">Category</a>`;
          modifiedContent += `\n<p>See more in ${catAnchor}</p>`;
          outgoingLinks.push(catUrl);
      }

      weavedArticles.push({
        ...article,
        content: modifiedContent
      });
      linkMatrix[article.id] = outgoingLinks;
    }

    return {
      weavedArticles,
      linkMatrix,
      report: `Weaved ${articles.length} articles with ${categoryUrls.length} category links.`
    };
  }

  /**
   * Publish articles using the CDP Actuator with throttling and backoff.
   */
  public async publishCluster(articles: Article[], publishUrl: string, selectors: PublishSelectors): Promise<void> {
    if (!this.cdpConnection) {
      throw new Error("CdpConnection is required for publishing.");
    }

    await this.cdpConnection.connect();
    const contexts = this.cdpConnection.browser!.contexts();
    const context = contexts[0] || (await this.cdpConnection.browser!.newContext());
    const page = await context.newPage();

    try {
      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];

        // Simple backoff retry mechanism for publishing an article
        let maxRetries = 3;
        let retryDelay = 2000;
        let success = false;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await page.goto(publishUrl);
                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

                // Fill form fields based on selectors
                if (selectors.titleSelector) {
                    const titleLocator = page.locator(selectors.titleSelector).first();
                    await titleLocator.fill(article.title);
                }

                if (selectors.contentSelector) {
                    const contentLocator = page.locator(selectors.contentSelector).first();
                    await contentLocator.fill(article.content);
                }

                if (selectors.submitButtonSelector) {
                    const submitBtn = page.locator(selectors.submitButtonSelector).first();
                    await submitBtn.click();
                }

                await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
                success = true;
                break; // Break the retry loop on success
            } catch (err: any) {
                if (attempt === maxRetries) {
                    throw new Error(`Failed to publish article ${article.id} after ${maxRetries} attempts. Last error: ${err.message}`);
                }
                // Backoff wait
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retryDelay *= 2; // Exponential backoff
            }
        }

        if (!success) {
             throw new Error(`Failed to publish article ${article.id}`);
        }

        // Throttling logic (wait 2 seconds between posts to prevent rate-limiting)
        if (i < articles.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } finally {
      await page.close();
    }
  }
}
