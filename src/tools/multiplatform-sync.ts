import { Platform } from "../types.js";
import { RecipeRunner } from "../services/recipe-runner.js";
import { handleEcommerceMatchVariants } from "./variant-matcher.js";
import { handleEcommerceSafetyGuard } from "./safety-guard.js";
import { handleEcommerceAuditLog } from "./audit-log.js";

const runner = new RecipeRunner();

export interface SyncTarget {
    platform: Platform;
    productId: string;
    currentPrice?: number;
    currentStock?: number;
    availableVariants: any[]; // candidates
}

export async function handleEcommerceSyncMultiplatformStock(args: any) {
    const sourcePlatform = args?.sourcePlatform as Platform;
    const sourceProductName = args?.sourceProductName;
    const newStock = args?.newStock;
    const newPrice = args?.newPrice;
    const targets = args?.targets as SyncTarget[];

    if (!sourcePlatform || !sourceProductName || !targets || !Array.isArray(targets)) {
        return { isError: true, content: [{ type: "text", text: "Missing required arguments" }] };
    }

    const syncResults = [];

    for (const target of targets) {
        let targetVariant = null;

        // 1. Fuzzy Variant Matching
        const matchRes = await handleEcommerceMatchVariants({
            action: "match",
            sourceName: sourceProductName,
            candidates: target.availableVariants
        });

        const matchParsed = JSON.parse((matchRes as any).content[0].text);
        if (matchParsed.status === "success") {
            targetVariant = matchParsed.matched;
        } else {
             syncResults.push({ platform: target.platform, status: "failed", message: "Variant matching failed" });
             continue;
        }

        // 2. Safety Guard (if price update)
        if (newPrice !== undefined && target.currentPrice !== undefined) {
             const safetyRes = await handleEcommerceSafetyGuard({
                 currentPrice: target.currentPrice,
                 proposedPrice: newPrice,
                 maxPriceDropPercent: 30
             });
             const safetyParsed = JSON.parse((safetyRes as any).content[0].text);
             if (!safetyParsed.isSafe) {
                 syncResults.push({ platform: target.platform, status: "failed", message: "Safety guard blocked price drop" });
                 continue;
             }
        }

        // 3. Update execution via Recipe
        const params: Record<string, string> = {
            productId: target.productId,
            skuId: targetVariant.skuId
        };
        if (newStock !== undefined) params.stock = newStock.toString();
        if (newPrice !== undefined) params.price = newPrice.toString();

        try {
            const recipeResult = await runner.runRecipe("quick_update_price", params); // Mocking standard recipe

            // 4. Audit Logging
            await handleEcommerceAuditLog({
                 action: "record",
                 platform: target.platform,
                 productId: target.productId,
                 skuId: targetVariant.skuId,
                 newPrice: newPrice,
                 newStock: newStock
            });

            syncResults.push({ platform: target.platform, status: "success", variant: targetVariant.name });
        } catch (e: any) {
            syncResults.push({ platform: target.platform, status: "failed", message: e.message });
        }
    }

    return {
        content: [{ type: "text", text: JSON.stringify({ status: "completed", results: syncResults }) }]
    };
}
