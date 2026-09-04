export type RankBand = "TOP_FIVE" | "STRIKING_DISTANCE" | "DISCOVERY_RANGE" | "NOT_OBSERVED";

export interface SerpRankResult {
  keyword: string;
  url: string;
  position: number | null;
  rankBand: RankBand;
}

export class SerpRankTrackerService {
  /**
   * Classifies a SERP position into a predefined rank band.
   * - TOP_FIVE: 1..5
   * - STRIKING_DISTANCE: 6..18 (Priority page 2 targets)
   * - DISCOVERY_RANGE: 19..30
   * - NOT_OBSERVED: null
   * 
   * @param position The position of the URL in the SERP (1-based index). null if not found.
   * @returns The classified rank band.
   */
  static classifyRankBand(position: number | null): RankBand {
    if (position === null || position <= 0) {
      return "NOT_OBSERVED";
    }

    if (position >= 1 && position <= 5) {
      return "TOP_FIVE";
    }

    if (position >= 6 && position <= 18) {
      return "STRIKING_DISTANCE";
    }

    if (position >= 19 && position <= 30) {
      return "DISCOVERY_RANGE";
    }

    return "NOT_OBSERVED";
  }

  /**
   * Processes a list of positions for keywords and returns the rank results.
   */
  static trackRanks(data: { keyword: string; url: string; position: number | null }[]): SerpRankResult[] {
    return data.map((item) => ({
      keyword: item.keyword,
      url: item.url,
      position: item.position,
      rankBand: this.classifyRankBand(item.position),
    }));
  }
}
