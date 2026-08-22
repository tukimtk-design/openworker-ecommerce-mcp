import { SqliteStore } from "../services/sqlite-store.js";
const store = new SqliteStore();
const defaultCache: Record<string, string[]> = {
    "shopee_price_input": ["#price-input-shopee", "input[name='price']", "[data-testid='price']"],
    "tiktok_stock_input": [".stock-input-tiktok", "[name='stock']"],
    "lazada_save_button": ["button.save-lazada", "button.submit"]
};

export async function handleEcommerceCachedSelectorMap(args: any) {
    const action = args?.action;


    let selectorCache: Record<string, string[]> = defaultCache;
    const stored = await store.get("selector_cache_list");
    if (stored) {
        selectorCache = JSON.parse(stored);
    }

    if (action === "get") {
        const key = args?.key;
        if (!key) return { isError: true, content: [{ type: "text", text: "Missing key for get action" }] };

        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", selectors: selectorCache[key] || null }) }]
        };
    } else if (action === "set") {
        const key = args?.key;
        const selectors = args?.selectors; // expects an array now

        if (!key || !selectors || !Array.isArray(selectors)) return { isError: true, content: [{ type: "text", text: "Missing key or selectors (array) for set action" }] };

        selectorCache[key] = selectors;
        await store.set("selector_cache_list", JSON.stringify(selectorCache));
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", message: `Selectors for '${key}' saved.` }) }]
        };
    } else if (action === "list") {
        return {
             content: [{ type: "text", text: JSON.stringify({ status: "success", selectors: selectorCache }) }]
        };
    }

    return { isError: true, content: [{ type: "text", text: "Invalid action. Use 'get', 'set', or 'list'." }] };
}
