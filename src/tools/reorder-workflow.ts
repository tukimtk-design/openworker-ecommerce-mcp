// Phase 13 Task 13.1: Reorder workflow tool — turns predictive forecasts into
// Purchase Order drafts, and manages their lifecycle.
import { createPoDraft, listPos, updatePoStatus, PoItem, PurchaseOrder } from "../services/po-store.js";

const VALID_STATUSES: PurchaseOrder["status"][] = ["draft", "ordered", "received", "cancelled"];

function itemFromForecast(f: any): PoItem | null {
    if (!f || typeof f.productId !== "string") return null;
    const qty = f.suggestedReorderQty ?? f.qty;
    if (typeof qty !== "number" || qty <= 0) return null;
    return {
        platform: f.platform,
        productId: f.productId,
        qty,
        supplierName: f.supplierName,
        supplierUrl: f.supplierUrl,
        unitCost: typeof f.unitCost === "number" ? f.unitCost : undefined,
    };
}

export async function handleEcommerceReorderWorkflow(args: any) {
    const action = args?.action;

    if (action === "create_po") {
        const rawItems = args?.items;
        if (!Array.isArray(rawItems) || rawItems.length === 0) {
            return { isError: true, content: [{ type: "text", text: "items must be a non-empty array of {productId, qty} (or a forecast entry with suggestedReorderQty)" }] };
        }
        const items: PoItem[] = [];
        for (const raw of rawItems) {
            const item = itemFromForecast(raw);
            if (!item) {
                return { isError: true, content: [{ type: "text", text: "each item needs productId (string) and a positive qty (or suggestedReorderQty)" }] };
            }
            items.push(item);
        }
        const po = await createPoDraft({ items, note: args?.note });
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", purchaseOrder: po }) }]
        };
    }

    if (action === "list_pos") {
        const status = args?.status;
        if (status !== undefined && !VALID_STATUSES.includes(status)) {
            return { isError: true, content: [{ type: "text", text: `status must be one of: ${VALID_STATUSES.join(", ")}` }] };
        }
        const pos = await listPos(status);
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", count: pos.length, purchaseOrders: pos }) }]
        };
    }

    if (action === "update_po_status") {
        const { poId, status } = args || {};
        if (typeof poId !== "string" || !poId) {
            return { isError: true, content: [{ type: "text", text: "poId (string) is required" }] };
        }
        if (!VALID_STATUSES.includes(status)) {
            return { isError: true, content: [{ type: "text", text: `status must be one of: ${VALID_STATUSES.join(", ")}` }] };
        }
        const updated = await updatePoStatus(poId, status);
        if (!updated) {
            return { isError: true, content: [{ type: "text", text: `Purchase order '${poId}' not found` }] };
        }
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", purchaseOrder: updated }) }]
        };
    }

    return {
        isError: true,
        content: [{ type: "text", text: "Invalid action. Use 'create_po', 'list_pos', or 'update_po_status'." }]
    };
}
