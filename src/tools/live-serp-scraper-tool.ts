import { LiveSerpScraper, LiveSerpScraperRequest } from "../services/seo/live-serp-scraper.js";

/**
 * Handle live SERP scraper tool request
 * @param args Tool arguments
 * @returns Tool result
 */
export async function handleEcommerceLiveSerpScraper(args: Record<string, unknown> | undefined) {
  try {
    const { query, targetDomain } = (args || {}) as { 
      query?: string; 
      targetDomain?: string; 
    };

    if (!query) {
      throw new Error("Missing required argument 'query'");
    }

    const request: LiveSerpScraperRequest = {
      query,
      targetDomain,
    };

    const result = LiveSerpScraper.scrapeSerp(request);

    if (!result.success) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: result.error,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              data: result,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: false,
              error: error.message,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
