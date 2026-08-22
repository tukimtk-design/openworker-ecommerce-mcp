const selectorCache: Record<string, string> = {
    "shopee_price_input": "#price-input-shopee",
    "tiktok_stock_input": ".stock-input-tiktok",
    "lazada_save_button": "button.save-lazada"
};

export async function handleEcommerceCachedSelectorMap(args: any) {
    const action = args?.action;

    if (action === "get") {
        const key = args?.key;
        if (!key) return { isError: true, content: [{ type: "text", text: "Missing key for get action" }] };

        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", selector: selectorCache[key] || null }) }]
        };
    } else if (action === "set") {
        const key = args?.key;
        const selector = args?.selector;

        if (!key || !selector) return { isError: true, content: [{ type: "text", text: "Missing key or selector for set action" }] };

        selectorCache[key] = selector;
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", message: `Selector for '${key}' saved.` }) }]
        };
    } else if (action === "list") {
        return {
             content: [{ type: "text", text: JSON.stringify({ status: "success", selectors: selectorCache }) }]
        };
    }

    return { isError: true, content: [{ type: "text", text: "Invalid action. Use 'get', 'set', or 'list'." }] };
}
