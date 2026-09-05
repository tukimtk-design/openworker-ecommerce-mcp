import { SeoPolicyGuard } from "./seo-policy-guard.js";

export interface ScheduledArticle {
  id: string;
  title: string;
  content: string;
  targetKeyword: string;
  publishDate?: string;
}

export interface SchedulingResult {
  scheduledArticles: ScheduledArticle[];
  linkGraph: Record<string, string[]>;
  report: string;
}

export class TopicClusterScheduler {
  /**
   * Schedule articles and create an internal link graph.
   * Enforces SEO negative keywords using SeoPolicyGuard.
   */
  public scheduleCluster(articles: ScheduledArticle[]): SchedulingResult {
    const scheduledArticles: ScheduledArticle[] = [];
    const linkGraph: Record<string, string[]> = {};

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

    // Schedule and generate link graph (Ring structure for simplicity)
    const now = new Date();
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const nextArticle = articles[(i + 1) % articles.length];

      // Schedule for 1 day apart
      const publishDate = new Date(now);
      publishDate.setDate(publishDate.getDate() + i);

      scheduledArticles.push({
        ...article,
        publishDate: publishDate.toISOString()
      });

      // Internal link to the next article
      linkGraph[article.id] = [nextArticle.id];
    }

    return {
      scheduledArticles,
      linkGraph,
      report: `Successfully scheduled ${articles.length} articles and generated internal link graph.`
    };
  }
}
