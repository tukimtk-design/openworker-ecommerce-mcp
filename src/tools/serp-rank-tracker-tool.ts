import { SerpRankTrackerService } from "../services/seo/serp-rank-tracker.js";

/**
 * Handle SERP rank tracker tool request
 * @param args Tool arguments
 * @returns Tool result
 */
export async function handleEcommerceSerpRankTracker(args: Record<string, unknown> | undefined) {
  try {
    const { items } = (args || {}) as { 
      items?: { keyword: string; url: string; position: number | null }[] 
    };

    if (!items || !Array.isArray(items)) {
      throw new Error("Missing required argument 'items' (array of {keyword, url, position})");
    }

    const results = SerpRankTrackerService.trackRanks(items);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              data: results,
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
