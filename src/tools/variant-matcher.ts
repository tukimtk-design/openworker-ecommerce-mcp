import { SqliteStore } from "../services/sqlite-store.js";
import { Platform } from "../types.js";

const store = new SqliteStore();

function levenshteinDistance(a: string, b: string): number {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    )
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function normalizeStr(str: string): string {
    return str.toLowerCase().replace(/[\W_]+/g, " ").trim();
}

export interface MatchCandidate {
    platform: Platform;
    productId: string;
    skuId: string;
    name: string;
}

export async function handleEcommerceMatchVariants(args: any) {
    const action = args?.action;

    if (action === "match") {
        const sourceName = args?.sourceName;
        const candidates = args?.candidates as MatchCandidate[];

        if (!sourceName || !candidates || !Array.isArray(candidates)) {
             return { isError: true, content: [{ type: "text", text: "Missing sourceName or candidates array" }] };
        }

        const cacheKey = `variant_match_${normalizeStr(sourceName)}`;
        const cached = await store.get(cacheKey);

        if (cached) {
            try {
                const parsedCache = JSON.parse(cached);
                const cachedCandidate = candidates.find(c => c.skuId === parsedCache.skuId);
                if (cachedCandidate) {
                    return {
                        content: [{ type: "text", text: JSON.stringify({ status: "success", matched: cachedCandidate, score: 0, fromCache: true }) }]
                    };
                }
            } catch (e) {}
        }

        const normalizedSource = normalizeStr(sourceName);
        let bestMatch: MatchCandidate | null = null;
        let bestScore = Infinity;

        for (const candidate of candidates) {
            const normalizedCandidate = normalizeStr(candidate.name);
            const score = levenshteinDistance(normalizedSource, normalizedCandidate);
            if (score < bestScore) {
                bestScore = score;
                bestMatch = candidate;
            }
        }

        const threshold = Math.max(5, Math.floor(normalizedSource.length * 0.4));

        if (bestMatch && bestScore <= threshold) {
            await store.set(cacheKey, JSON.stringify(bestMatch));
            return {
                content: [{ type: "text", text: JSON.stringify({ status: "success", matched: bestMatch, score: bestScore, fromCache: false }) }]
            };
        }

        return {
             content: [{ type: "text", text: JSON.stringify({ status: "failed", message: "No suitable match found within threshold", closestScore: bestScore }) }]
        };

    } else if (action === "force_map") {
         const sourceName = args?.sourceName;
         const targetCandidate = args?.targetCandidate;
         if (!sourceName || !targetCandidate) {
             return { isError: true, content: [{ type: "text", text: "Missing sourceName or targetCandidate" }] };
         }

         const cacheKey = `variant_match_${normalizeStr(sourceName)}`;
         await store.set(cacheKey, JSON.stringify(targetCandidate));

         return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", message: "Variant mapping forced into cache" }) }]
         };
    }

    return { isError: true, content: [{ type: "text", text: "Invalid action. Use 'match' or 'force_map'." }] };
}
