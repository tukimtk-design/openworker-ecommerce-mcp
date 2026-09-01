// Phase 12: Predictive Inventory & Smart Sourcing tool
import { bulkForecast, forecastInventory, ForecastOptions, ForecastProductInput } from "../services/predictive-engine.js";

function parseSalesHistory(raw: any): { ok: boolean; history?: any[]; error?: string } {
    if (!Array.isArray(raw) || raw.length === 0) {
        return { ok: false, error: "salesHistory must be a non-empty array of {date, unitsSold}" };
    }
    for (const rec of raw) {
        if (!rec || typeof rec.date !== "string" || typeof rec.unitsSold !== "number") {
            return { ok: false, error: "each salesHistory item must be {date: string ('YYYY-MM-DD'), unitsSold: number}" };
        }
    }
    return { ok: true, history: raw };
}

function parseOptions(args: any): ForecastOptions {
    const opts: ForecastOptions = {};
    if (args?.leadTimeDays !== undefined) opts.leadTimeDays = args.leadTimeDays;
    if (args?.targetCoverDays !== undefined) opts.targetCoverDays = args.targetCoverDays;
    if (args?.serviceLevel !== undefined) opts.serviceLevel = args.serviceLevel;
    if (args?.today !== undefined) opts.today = args.today;
    return opts;
}

export async function handleEcommercePredictiveInventory(args: any) {
    const action = args?.action;

    if (action === "forecast") {
        const { currentStock, salesHistory } = args || {};
        if (typeof currentStock !== "number") {
            return { isError: true, content: [{ type: "text", text: "currentStock (number) is required" }] };
        }
        const parsed = parseSalesHistory(salesHistory);
        if (!parsed.ok) {
            return { isError: true, content: [{ type: "text", text: parsed.error! }] };
        }
        try {
            const input: ForecastProductInput = {
                platform: args?.platform,
                productId: args?.productId || "unknown",
                currentStock,
                salesHistory: parsed.history!,
            };
            const forecast = forecastInventory(input, parseOptions(args));
            return {
                content: [{ type: "text", text: JSON.stringify({ status: "success", forecast }) }]
            };
        } catch (e: any) {
            return { isError: true, content: [{ type: "text", text: e.message }] };
        }
    }

    if (action === "bulk_forecast") {
        const products = args?.products;
        if (!Array.isArray(products) || products.length === 0) {
            return { isError: true, content: [{ type: "text", text: "products must be a non-empty array of {productId, currentStock, salesHistory}" }] };
        }
        const results = [];
        for (const p of products) {
            if (!p || typeof p.productId !== "string" || typeof p.currentStock !== "number") {
                return { isError: true, content: [{ type: "text", text: "each product must have productId (string), currentStock (number) and salesHistory (array)" }] };
            }
            const parsed = parseSalesHistory(p.salesHistory);
            if (!parsed.ok) {
                return { isError: true, content: [{ type: "text", text: `product '${p.productId}': ${parsed.error}` }] };
            }
            results.push({
                platform: p.platform,
                productId: p.productId,
                currentStock: p.currentStock,
                salesHistory: parsed.history!,
            });
        }
        try {
            const forecasts = bulkForecast(results, parseOptions(args));
            return {
                content: [{ type: "text", text: JSON.stringify({ status: "success", count: forecasts.length, forecasts }) }]
            };
        } catch (e: any) {
            return { isError: true, content: [{ type: "text", text: e.message }] };
        }
    }

    return {
        isError: true,
        content: [{ type: "text", text: "Invalid action. Use 'forecast' or 'bulk_forecast'." }]
    };
}
