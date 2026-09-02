// Phase 13 Task 13.1: Purchase Order draft store (persisted in SqliteStore).
import { SqliteStore } from "./sqlite-store.js";

const store = new SqliteStore();
const PO_KEY = "purchase_orders";

export interface PoItem {
    platform?: string;
    productId: string;
    qty: number;
    supplierName?: string;
    supplierUrl?: string;
    unitCost?: number;
    lineTotal?: number;
}

export interface PurchaseOrder {
    poId: string;
    status: "draft" | "ordered" | "received" | "cancelled";
    createdAt: string;
    updatedAt: string;
    note?: string;
    items: PoItem[];
    estimatedTotal: number;
}

async function loadAll(): Promise<PurchaseOrder[]> {
    const stored = await store.get(PO_KEY);
    if (!stored) return [];
    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

async function saveAll(pos: PurchaseOrder[]): Promise<void> {
    await store.set(PO_KEY, JSON.stringify(pos));
}

export async function createPoDraft(input: {
    items: PoItem[];
    note?: string;
}): Promise<PurchaseOrder> {
    const items = input.items.map(i => ({
        ...i,
        qty: Math.max(1, Math.floor(i.qty || 0)),
        lineTotal: i.unitCost !== undefined ? Math.round(i.unitCost * Math.max(1, Math.floor(i.qty || 0)) * 100) / 100 : undefined,
    }));
    const estimatedTotal = Math.round(
        items.reduce((sum, i) => sum + (i.lineTotal || 0), 0) * 100
    ) / 100;

    const now = new Date().toISOString();
    const po: PurchaseOrder = {
        poId: `PO-${now.slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        status: "draft",
        createdAt: now,
        updatedAt: now,
        note: input.note,
        items,
        estimatedTotal,
    };

    const all = await loadAll();
    all.push(po);
    await saveAll(all);
    return po;
}

export async function listPos(status?: PurchaseOrder["status"]): Promise<PurchaseOrder[]> {
    const all = await loadAll();
    return status ? all.filter(po => po.status === status) : all;
}

export async function updatePoStatus(poId: string, status: PurchaseOrder["status"]): Promise<PurchaseOrder | null> {
    const all = await loadAll();
    const po = all.find(p => p.poId === poId);
    if (!po) return null;
    po.status = status;
    po.updatedAt = new Date().toISOString();
    await saveAll(all);
    return po;
}
