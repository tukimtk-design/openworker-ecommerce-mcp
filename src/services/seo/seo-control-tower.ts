export interface Observation {
  id: string;
  keyword: string;
  rank: number;
  clicks: number;
  impressions: number;
  semanticSignature: string;
  timestamp: string;
}

export interface Delta {
  keyword: string;
  rankDelta: number;
  clicksDelta: number;
  semanticChange: boolean;
}

export interface Recommendation {
  id: string;
  action: string;
  keyword: string;
  expectedImpact: string;
}

export class SeoControlTower {
  private observationCache: Map<string, Observation> = new Map();
  public llmCallCount: number = 0;

  /**
   * Records a new observation from Search Console and detects delta.
   * @param newObs The new observation
   * @returns Delta detection result
   */
  public recordObservation(newObs: Observation): Delta {
    const prevObs = this.observationCache.get(newObs.id);
    
    let semanticChange = false;
    let rankDelta = 0;
    let clicksDelta = 0;

    if (prevObs) {
      rankDelta = prevObs.rank - newObs.rank; // Positive means rank improved (e.g. 5 -> 3, delta = 2)
      clicksDelta = newObs.clicks - prevObs.clicks;
      
      // Deterministic semantic delta filter
      if (prevObs.semanticSignature !== newObs.semanticSignature) {
        semanticChange = true;
      }
    } else {
      semanticChange = true; // First time seeing this observation
    }

    if (semanticChange) {
      // Analyze semantic change (requires LLM)
      this.llmCallCount++;
    } else {
      // If NO_SEMANTIC_CHANGE, llmCallCount is not incremented (deterministic filter)
    }

    this.observationCache.set(newObs.id, newObs);

    return {
      keyword: newObs.keyword,
      rankDelta,
      clicksDelta,
      semanticChange
    };
  }

  /**
   * Generates a daily decision basket.
   * Limits to top 3-5 actionable recommendations.
   * @param recommendations Raw list of recommendations
   * @param limit Limit for the basket (default 5, min 3, max 5)
   * @returns Filtered list of top recommendations
   */
  public generateDailyDecisionBasket(recommendations: Recommendation[], limit: number = 5): Recommendation[] {
    const finalLimit = Math.max(3, Math.min(5, limit)); // Enforce 3-5 limit
    return recommendations.slice(0, finalLimit);
  }

  /**
   * Clears the observation cache.
   */
  public clearCache(): void {
    this.observationCache.clear();
    this.llmCallCount = 0;
  }
}
