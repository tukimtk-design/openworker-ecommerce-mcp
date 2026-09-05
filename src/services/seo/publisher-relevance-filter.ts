export type RelevanceStatus = 'RELEVANT' | 'UNCERTAIN' | 'EXCLUDED';

export interface PublisherRelevanceResult {
  status: RelevanceStatus;
  score: number;
  matchedKeywords: string[];
  reason: string;
}

export class PublisherRelevanceFilter {
  // Configurable rules
  private excludeKeywords: string[] = ["สแปม", "การพนัน", "คาสิโน", "หวย", "ผิดกฎหมาย", "18+", "แทงบอล"];
  private relevantKeywords: string[] = ["รีวิว", "แนะนำ", "ราคา", "โปรโมชั่น", "ช้อปปิ้ง", "สินค้า", "คุณภาพ", "วิธีใช้"];

  constructor(
    customExcludeKeywords?: string[],
    customRelevantKeywords?: string[]
  ) {
    if (customExcludeKeywords) {
      this.excludeKeywords = customExcludeKeywords;
    }
    if (customRelevantKeywords) {
      this.relevantKeywords = customRelevantKeywords;
    }
  }

  public evaluateRelevance(publisherUrl: string, content: string): PublisherRelevanceResult {
    const text = (publisherUrl + " " + content).toLowerCase();
    
    // 1. Check EXCLUDED deterministic rules first
    const excludedMatches = this.excludeKeywords.filter(kw => text.includes(kw.toLowerCase()));
    if (excludedMatches.length > 0) {
      return {
        status: 'EXCLUDED',
        score: -1,
        matchedKeywords: excludedMatches,
        reason: `Found excluded keywords: ${excludedMatches.join(', ')}`
      };
    }

    // 2. Check RELEVANT rules (scoring based on hits)
    const relevantMatches = this.relevantKeywords.filter(kw => text.includes(kw.toLowerCase()));
    
    // Threshold for automatic relevance
    if (relevantMatches.length >= 2) {
      return {
        status: 'RELEVANT',
        score: relevantMatches.length,
        matchedKeywords: relevantMatches,
        reason: `Found sufficient relevant keywords: ${relevantMatches.join(', ')}`
      };
    }

    // 3. Fallback to UNCERTAIN for LLM or human review
    return {
      status: 'UNCERTAIN',
      score: relevantMatches.length,
      matchedKeywords: relevantMatches,
      reason: `Insufficient keywords to determine relevance deterministically.`
    };
  }
}
