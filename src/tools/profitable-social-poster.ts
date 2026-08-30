import { SocialTrendAnalyzer, TrendData } from "../services/social-trend-analyzer.js";
import { HybridExecutor } from "../services/hybrid-executor.js";

const trendAnalyzer = new SocialTrendAnalyzer();
const executor = new HybridExecutor();

export async function handleEcommerceProfitableSocialPoster(args: any) {
    const { productName, rawTrends, targetUrl } = args;

    if (!productName || !rawTrends || !Array.isArray(rawTrends)) {
        return { isError: true, content: [{ type: "text", text: "Missing productName or invalid rawTrends array" }] };
    }

    try {
        // Step 1: Pre-filter to save tokens (keep only top 2 most profitable)
        const topTrends = trendAnalyzer.filterProfitableTrends(rawTrends as TrendData[], 2);

        // Step 2: Compress data for LLM
        const compressedPromptData = trendAnalyzer.compressForLlm(topTrends);

        // Step 3: Generate Angles via (simulated) LLM call
        const angles = await trendAnalyzer.generateSellingAngles(compressedPromptData, productName);

        // Step 4: Pick the highest scoring angle
        angles.sort((a, b) => b.score - a.score);
        const bestAngle = angles[0];

        // Step 5: Automatically post the best angle to the target platform
        const taskPayload = {
            id: `profit-post-${bestAngle.platform}-${Date.now()}`,
            type: "social_media_auto_post",
            payload: {
                platform: bestAngle.platform,
                contentText: bestAngle.angle,
                mediaUrls: [],
                link: targetUrl || null
            },
            status: "pending",
            platform: bestAngle.platform,
            requiresHuman: false
        };

        const postResult = await executor.executeTask(taskPayload);

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    status: "success",
                    message: "Profitable social post generated and dispatched",
                    data: {
                        compressedTokensSaved: rawTrends.length - topTrends.length,
                        bestAngleUsed: bestAngle,
                        dispatchResult: postResult
                    }
                })
            }]
        };
    } catch (error: any) {
        return { isError: true, content: [{ type: "text", text: error.message }] };
    }
}
