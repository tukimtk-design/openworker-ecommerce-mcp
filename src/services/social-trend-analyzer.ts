export interface TrendData {
    keyword: string;
    searchVolume: number;
    competition: number; // 0.0 to 1.0
    cpc: number; // Cost per click estimate (profitability indicator)
}

export interface ProfitableAngle {
    platform: string;
    angle: string;
    score: number;
}

export class SocialTrendAnalyzer {
    // 1. Local Pre-filtering to save tokens
    // We only send the top highly-profitable trends to the LLM
    public filterProfitableTrends(trends: TrendData[], maxItems: number = 3): TrendData[] {
        return trends
            .map(trend => {
                // Profitability Score = (Volume * CPC) / (Competition + 0.1)
                const score = (trend.searchVolume * trend.cpc) / (trend.competition + 0.1);
                return { ...trend, _score: score };
            })
            .sort((a, b) => b._score - a._score)
            .slice(0, maxItems)
            .map(({ _score, ...rest }) => rest as TrendData);
    }

    // 2. Token-Optimized formatting
    public compressForLlm(trends: TrendData[]): string {
        // Use a dense CSV format instead of bulky JSON to save tokens in the prompt
        let compressed = "kw,vol,comp,cpc\n";
        for (const t of trends) {
            compressed += `${t.keyword},${t.searchVolume},${t.competition},${t.cpc}\n`;
        }
        return compressed;
    }

    // 3. Simulate AI Angle Generation based on compressed data
    public async generateSellingAngles(compressedData: string, productName: string): Promise<ProfitableAngle[]> {
        // In reality, this would send the highly compressed CSV to an LLM
        // For simulation, we parse the first keyword from the compressed string

        const lines = compressedData.split('\n');
        let topKeyword = "trending product";
        if (lines.length > 1 && lines[1].trim() !== '') {
            topKeyword = lines[1].split(',')[0];
        }

        return [
            {
                platform: "tiktok",
                angle: `Stop scrolling! Did you know ${topKeyword} is changing how we use ${productName}? Link in bio!`,
                score: 95
            },
            {
                platform: "facebook_reels",
                angle: `The secret to ${topKeyword} with our new ${productName}. 50% off today only.`,
                score: 88
            }
        ];
    }
}
