import { SeoPolicyGuard } from './seo-policy-guard.js';
import { LiveSerpScraper, LiveSerpScraperRequest, LiveSerpScraperResponse } from './live-serp-scraper.js';

export interface PageSeoData {
  url: string;
  type: 'category' | 'article' | 'product';
  title: string;
  description: string;
  h1: string;
  h2s: string[];
}

export interface HistoricalRankData {
  keyword: string;
  url: string;
  pastPosition: number | null;
  date: string; // ISO string
}

export interface CannibalizationConflict {
  url1: string;
  url2: string;
  similarityScore: number;
  conflictType: string;
  recommendation: string;
}

export interface RankDriftResult {
  keyword: string;
  url: string;
  currentPosition: number | null;
  pastPosition: number | null;
  velocity: number; // positive means gain (e.g. 5 to 3 is +2), negative means loss, 0 means unchanged
  velocityText: string;
}

export interface SerpRankDriftTrackerResponse {
  keyword: string;
  success: boolean;
  error?: string;
  rankDrift?: RankDriftResult[];
  cannibalizationConflicts?: CannibalizationConflict[];
  overallRecommendation?: string;
}

export class SerpRankDriftTrackerService {
  /**
   * Tracks rank drift and detects keyword cannibalization.
   */
  public static trackRankDriftAndCannibalization(
    keyword: string,
    domain: string,
    pages: PageSeoData[],
    historicalRanks: HistoricalRankData[]
  ): SerpRankDriftTrackerResponse {

    // 1. Enforce SEO Policy Guard (Fail-Closed)
    const policyCheck = SeoPolicyGuard.checkPolicy({ text: keyword });
    if (!policyCheck.isSafe) {
      throw new Error(`คำค้นหา "${keyword}" ถูกระงับเนื่องจากพบคำต้องห้าม: ${policyCheck.rejectedKeywords.join(', ')}`);
    }

    // Check all pages' text to be safe
    for (const page of pages) {
      const pageText = `${page.title} ${page.description} ${page.h1} ${page.h2s.join(' ')}`;
      const pagePolicyCheck = SeoPolicyGuard.checkPolicy({ text: pageText });
      if (!pagePolicyCheck.isSafe) {
         throw new Error(`เนื้อหาในหน้า ${page.url} ถูกระงับเนื่องจากพบคำต้องห้าม: ${pagePolicyCheck.rejectedKeywords.join(', ')}`);
      }
    }

    // 2. Fetch current SERP
    const serpRequest: LiveSerpScraperRequest = {
      query: keyword,
      targetDomain: domain
    };

    const serpResponse: LiveSerpScraperResponse = LiveSerpScraper.scrapeSerp(serpRequest);
    if (!serpResponse.success) {
       return {
         keyword,
         success: false,
         error: serpResponse.error
       };
    }

    // 3. Track Rank Drift
    const rankDrift: RankDriftResult[] = [];
    const currentPositions = serpResponse.positions || [];

    // Combine unique URLs from historical and current SERP
    const allUrls = new Set<string>();
    historicalRanks.forEach(h => allUrls.add(h.url));
    currentPositions.forEach(p => allUrls.add(p.url));

    allUrls.forEach(url => {
       const pastData = historicalRanks.find(h => h.url === url);
       const pastPosition = pastData ? pastData.pastPosition : null;

       const currentData = currentPositions.find(p => p.url === url);
       const currentPosition = currentData ? currentData.position : null;

       let velocity = 0;
       let velocityText = "ไม่มีการเปลี่ยนแปลง";

       if (pastPosition !== null && currentPosition !== null) {
          velocity = pastPosition - currentPosition; // 10 -> 5 means +5 (gain)
          if (velocity > 0) {
            velocityText = `อันดับดีขึ้น ${velocity} ตำแหน่ง`;
          } else if (velocity < 0) {
            velocityText = `อันดับลดลง ${Math.abs(velocity)} ตำแหน่ง`;
          }
       } else if (pastPosition === null && currentPosition !== null) {
          velocityText = "ติดอันดับใหม่";
       } else if (pastPosition !== null && currentPosition === null) {
          velocityText = "หลุดจากอันดับ";
       }

       rankDrift.push({
         keyword,
         url,
         currentPosition,
         pastPosition,
         velocity,
         velocityText
       });
    });

    // 4. Detect Keyword Cannibalization
    const cannibalizationConflicts = this.detectCannibalization(pages, keyword);

    // 5. Generate Overall Recommendation
    let overallRecommendation = "เว็บไซต์ของคุณมีโครงสร้างและการจัดอันดับที่ดี";
    if (cannibalizationConflicts.length > 0) {
      overallRecommendation = "พบปัญหา Keyword Cannibalization ควรพิจารณาปรับปรุงโครงสร้างเนื้อหาเพื่อลดการแข่งขันกันเอง";
    } else {
       const droppedRanks = rankDrift.filter(r => r.velocity < 0 || (r.pastPosition !== null && r.currentPosition === null));
       if (droppedRanks.length > 0) {
         overallRecommendation = "พบว่าอันดับลดลง ควรตรวจสอบเนื้อหาและ Backlinks เพื่อปรับปรุงอันดับ";
       }
    }

    return {
      keyword,
      success: true,
      rankDrift,
      cannibalizationConflicts,
      overallRecommendation
    };
  }

  /**
   * Detects cannibalization conflicts between pages based on text similarity and target keyword matching.
   */
  public static detectCannibalization(pages: PageSeoData[], keyword: string): CannibalizationConflict[] {
     const conflicts: CannibalizationConflict[] = [];

     for (let i = 0; i < pages.length; i++) {
       for (let j = i + 1; j < pages.length; j++) {
         const p1 = pages[i];
         const p2 = pages[j];

         // Basic similarity computation based on shared words (token overlap)
         const text1 = `${p1.title} ${p1.h1} ${p1.description}`.toLowerCase();
         const text2 = `${p2.title} ${p2.h1} ${p2.description}`.toLowerCase();

         const similarityScore = this.calculateSimilarity(text1, text2);

         // If pages are highly similar (e.g. > 60% token overlap) and both target/contain the keyword
         const p1HasKeyword = text1.includes(keyword.toLowerCase());
         const p2HasKeyword = text2.includes(keyword.toLowerCase());

         if (similarityScore > 0.6 && p1HasKeyword && p2HasKeyword) {
            conflicts.push({
               url1: p1.url,
               url2: p2.url,
               similarityScore: Math.round(similarityScore * 100) / 100,
               conflictType: `${p1.type} vs ${p2.type}`,
               recommendation: `ปรับเนื้อหาของหน้าที่สำคัญน้อยกว่าให้โฟกัสไปที่ Long-tail keyword อื่น หรือรวมเนื้อหาเข้าด้วยกัน (301 Redirect) และปรับ Heading (H1/H2) ให้แตกต่างกันอย่างชัดเจน`
            });
         }
       }
     }

     return conflicts;
  }

  /**
   * Simple Jaccard similarity implementation for text comparison
   */
  public static calculateSimilarity(str1: string, str2: string): number {
    const tokenize = (str: string) => {
       return new Set(str.replace(/[^\w\s\u0E00-\u0E7F]/g, '').split(/\s+/).filter(w => w.length > 0));
    };

    const tokens1 = tokenize(str1);
    const tokens2 = tokenize(str2);

    if (tokens1.size === 0 && tokens2.size === 0) return 1.0;
    if (tokens1.size === 0 || tokens2.size === 0) return 0.0;

    let intersectionSize = 0;
    for (const token of tokens1) {
      if (tokens2.has(token)) {
        intersectionSize++;
      }
    }

    const unionSize = tokens1.size + tokens2.size - intersectionSize;
    return intersectionSize / unionSize;
  }
}
