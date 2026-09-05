import { SerpRankDriftTrackerService, PageSeoData, HistoricalRankData } from "../services/seo/serp-rank-drift-tracker.js";

/**
 * Handle SERP rank drift and cannibalization tracker tool request
 * @param args Tool arguments
 * @returns Tool result
 */
export async function handleEcommerceTrackRankDrift(args: Record<string, unknown> | undefined) {
  try {
    const { keyword, domain, pages, historicalRanks } = (args || {}) as {
      keyword?: string;
      domain?: string;
      pages?: PageSeoData[];
      historicalRanks?: HistoricalRankData[];
    };

    if (!keyword || typeof keyword !== 'string') {
      throw new Error("Missing required argument 'keyword' (string)");
    }

    if (!domain || typeof domain !== 'string') {
      throw new Error("Missing required argument 'domain' (string)");
    }

    if (!pages || !Array.isArray(pages)) {
      throw new Error("Missing required argument 'pages' (array of PageSeoData)");
    }

    if (!historicalRanks || !Array.isArray(historicalRanks)) {
      throw new Error("Missing required argument 'historicalRanks' (array of HistoricalRankData)");
    }

    const results = SerpRankDriftTrackerService.trackRankDriftAndCannibalization(
      keyword,
      domain,
      pages,
      historicalRanks
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      isError: true,
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
