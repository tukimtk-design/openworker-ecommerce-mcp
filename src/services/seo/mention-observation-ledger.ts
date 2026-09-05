export interface BrandMention {
  id: string;
  brandKeyword: string;
  sourceUrl: string;
  contextSnippet: string;
  timestamp: string; // ISO string
  sentiment?: "positive" | "neutral" | "negative";
}

export interface EarnedBacklink {
  id: string;
  targetUrl: string; // URL on our domain
  sourceUrl: string; // URL of the backlink
  anchorText: string;
  timestamp: string;
  relAttribute?: string; // e.g., 'nofollow', 'dofollow'
}

export interface DriftData {
  targetUrl: string;
  keyword: string;
  previousRank: number;
  currentRank: number;
  timestamp: string;
}

export interface CorrelationResult {
  targetUrl: string;
  keyword: string;
  rankChange: number;
  mentionsCount: number;
  backlinksCount: number;
  correlationSignal: "strong" | "weak" | "none";
}

export class MentionObservationLedger {
  private mentions: Map<string, BrandMention> = new Map();
  private backlinks: Map<string, EarnedBacklink> = new Map();

  public recordMention(mention: BrandMention): void {
    this.mentions.set(mention.id, mention);
  }

  public recordBacklink(backlink: EarnedBacklink): void {
    this.backlinks.set(backlink.id, backlink);
  }

  public getMentions(): BrandMention[] {
    return Array.from(this.mentions.values());
  }

  public getBacklinks(): EarnedBacklink[] {
    return Array.from(this.backlinks.values());
  }

  public correlateDrift(driftData: DriftData): CorrelationResult {
    const rankChange = driftData.previousRank - driftData.currentRank; // Positive means rank improved (e.g., 10 to 5)
    
    // Find relevant mentions (e.g., matching the keyword)
    const relatedMentions = Array.from(this.mentions.values()).filter(m => 
      m.brandKeyword.toLowerCase().includes(driftData.keyword.toLowerCase()) || 
      driftData.keyword.toLowerCase().includes(m.brandKeyword.toLowerCase())
    );

    // Find relevant backlinks (e.g., matching the target URL)
    const relatedBacklinks = Array.from(this.backlinks.values()).filter(b => 
      b.targetUrl === driftData.targetUrl || 
      b.anchorText.toLowerCase().includes(driftData.keyword.toLowerCase())
    );

    let signal: "strong" | "weak" | "none" = "none";
    if (rankChange > 0) {
       if (relatedMentions.length > 2 || relatedBacklinks.length > 1) {
           signal = "strong";
       } else if (relatedMentions.length > 0 || relatedBacklinks.length > 0) {
           signal = "weak";
       }
    } else if (rankChange < 0) {
       // Negative rank change could also be correlated if there are negative sentiment mentions, but for now just general correlation.
       if (relatedMentions.some(m => m.sentiment === 'negative')) {
           signal = "strong";
       }
    }

    return {
      targetUrl: driftData.targetUrl,
      keyword: driftData.keyword,
      rankChange: rankChange,
      mentionsCount: relatedMentions.length,
      backlinksCount: relatedBacklinks.length,
      correlationSignal: signal
    };
  }

  public clear(): void {
    this.mentions.clear();
    this.backlinks.clear();
  }
}
