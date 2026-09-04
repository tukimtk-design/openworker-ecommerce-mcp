import { SeoPolicyGuard } from './seo-policy-guard.js';

export interface LiveSerpScraperRequest {
  query: string;
  targetDomain?: string;
}

export interface SerpPosition {
  position: number;
  url: string;
  title: string;
  snippet: string;
}

export interface LiveSerpScraperResponse {
  success: boolean;
  query: string;
  targetDomain?: string;
  positions?: SerpPosition[];
  error?: string;
}

export class LiveSerpScraper {
  /**
   * Scrapes live SERP data (mock implementation).
   * Enforces SEO negative keywords via SeoPolicyGuard.
   */
  public static scrapeSerp(request: LiveSerpScraperRequest): LiveSerpScraperResponse {
    if (!request.query) {
      return {
        success: false,
        query: request.query,
        error: "กรุณาระบุ query สำหรับการค้นหา",
      };
    }

    // Enforce negative keyword guard
    const policyResult = SeoPolicyGuard.checkPolicy({ text: request.query });
    if (!policyResult.isSafe) {
      return {
        success: false,
        query: request.query,
        error: policyResult.reason || "พบคำต้องห้ามในการค้นหา",
      };
    }

    // Mock SERP positions
    const mockPositions: SerpPosition[] = [
      {
        position: 1,
        url: "https://example.com/best-shoes",
        title: "Best Shoes for Running - Example",
        snippet: "Discover the best shoes for running in 2024.",
      },
      {
        position: 2,
        url: "https://example.org/reviews/running-shoes",
        title: "Top 10 Running Shoes Reviewed",
        snippet: "We tested the top 10 running shoes.",
      },
      {
        position: 3,
        url: request.targetDomain ? `https://${request.targetDomain}/product/123` : "https://example.net/shoes",
        title: `Your Product ${request.query}`,
        snippet: `Great deal on ${request.query}.`,
      }
    ];

    let filteredPositions = mockPositions;
    if (request.targetDomain) {
      filteredPositions = mockPositions.filter(p => p.url.includes(request.targetDomain!));
    }

    return {
      success: true,
      query: request.query,
      targetDomain: request.targetDomain,
      positions: filteredPositions,
    };
  }
}
