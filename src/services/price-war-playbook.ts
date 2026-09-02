// Phase 14 Task 14.3: Price-war playbook.
// Given my price vs the competitor's and a COGS basis, produce three response
// plans (match / promo bundle / hold) with margin math and a recommendation.

export interface CostBasis {
    totalCost: number;       // product + inbound shipping + packaging
    minMarginPercent: number;
}

export interface PlaybookPlan {
    plan: "match_price" | "promo_bundle" | "hold";
    label: string;
    effectivePrice: number;
    marginPercent: number;
    marginDeltaPercent: number;
    feasible: boolean;
    rationale: string;
}

export interface PlaybookResult {
    myPrice: number;
    competitorPrice: number;
    priceGapPercent: number;
    totalCost: number;
    minMarginPercent: number;
    currentMarginPercent: number;
    floorPrice: number;
    plans: PlaybookPlan[];
    recommended: PlaybookPlan["plan"];
    summary: string;
}

export function buildCostBasis(cogsRecord?: any, fallback?: { unitCost?: number; minMarginPercent?: number }): CostBasis | null {
    if (cogsRecord && typeof cogsRecord === "object") {
        const total = (Number(cogsRecord.cogs) || 0)
            + (Number(cogsRecord.inboundShipping) || 0)
            + (Number(cogsRecord.packagingCost) || 0);
        const minMargin = Number(cogsRecord.minMarginPercent);
        if (total > 0) {
            return { totalCost: total, minMarginPercent: Number.isFinite(minMargin) ? minMargin : 0 };
        }
    }
    if (fallback && typeof fallback.unitCost === "number" && fallback.unitCost > 0) {
        return { totalCost: fallback.unitCost, minMarginPercent: fallback.minMarginPercent ?? 0 };
    }
    return null;
}

function marginPercent(price: number, cost: number): number {
    return price <= 0 ? -100 : ((price - cost) / price) * 100;
}

export function buildPriceWarPlaybook(myPrice: number, competitorPrice: number, cost: CostBasis): PlaybookResult {
    const priceGapPercent = myPrice > 0 ? ((myPrice - competitorPrice) / myPrice) * 100 : 0;
    const floorPrice = cost.totalCost * (1 + cost.minMarginPercent / 100);
    const currentMargin = marginPercent(myPrice, cost.totalCost);

    // Plan 1: match the competitor, but never below the margin floor.
    const matchPrice = Math.max(competitorPrice, Math.ceil(floorPrice * 100) / 100);
    const matchFeasible = competitorPrice >= floorPrice;
    const matchMargin = marginPercent(matchPrice, cost.totalCost);

    // Plan 2: keep the list price, absorb ~half the gap as a voucher/bundle.
    const promoDiscountPercent = Math.max(0, priceGapPercent / 2);
    const promoPrice = Math.round(myPrice * (1 - promoDiscountPercent / 100) * 100) / 100;
    const promoMargin = marginPercent(promoPrice, cost.totalCost);
    const promoFeasible = promoPrice >= floorPrice;

    // Plan 3: hold the price, accept the volume risk.
    const holdMargin = currentMargin;

    const plans: PlaybookPlan[] = [
        {
            plan: "match_price",
            label: "ตามลดราคา (Match)",
            effectivePrice: matchPrice,
            marginPercent: Math.round(matchMargin * 100) / 100,
            marginDeltaPercent: Math.round((matchMargin - currentMargin) * 100) / 100,
            feasible: matchFeasible,
            rationale: matchFeasible
                ? `ตั้งราคา ${matchPrice} เท่าคู่แข่ง — margin เหลือ ${Math.round(matchMargin)}% (ขั้นต่ำ ${cost.minMarginPercent}%)`
                : `ราคาคู่แข่ง (${competitorPrice}) ต่ำกว่าจุดคุ้มทุนของเรา (ขั้นต่ำ ${Math.ceil(floorPrice)}) — ห้ามตามลดเต็มที่`,
        },
        {
            plan: "promo_bundle",
            label: "แพ็กเซจโปรโมชัน (Voucher/Bundle)",
            effectivePrice: promoPrice,
            marginPercent: Math.round(promoMargin * 100) / 100,
            marginDeltaPercent: Math.round((promoMargin - currentMargin) * 100) / 100,
            feasible: promoFeasible,
            rationale: `คงราคา ${myPrice} แต่แจก voucher/bundle ~${Math.round(promoDiscountPercent)}% (ราคาสุทธิ ~${promoPrice}) — กระทบ margin ครึ่งเดียวของการตัดราคาจริง`,
        },
        {
            plan: "hold",
            label: "ไม่ทำอะไร (Hold)",
            effectivePrice: myPrice,
            marginPercent: Math.round(holdMargin * 100) / 100,
            marginDeltaPercent: 0,
            feasible: true,
            rationale: `คงราคา ${myPrice} — รักษา margin เดิม แต่เสี่ยงยอดขายหายให้คู่แข่งช่วงที่ gap ${(Math.round(priceGapPercent * 10) / 10)}%`,
        },
    ];

    let recommended: PlaybookPlan["plan"];
    if (matchFeasible && priceGapPercent <= 20) {
        recommended = "match_price";
    } else if (promoFeasible) {
        recommended = "promo_bundle";
    } else {
        recommended = "hold";
    }

    const rec = plans.find(p => p.plan === recommended)!;
    const summary = `คู่แข่งขาย ${competitorPrice} เราขาย ${myPrice} (gap ${Math.round(priceGapPercent * 10) / 10}%) — ` +
        `แนะนำ: ${rec.label} (${rec.rationale})`;

    return {
        myPrice,
        competitorPrice,
        priceGapPercent: Math.round(priceGapPercent * 100) / 100,
        totalCost: cost.totalCost,
        minMarginPercent: cost.minMarginPercent,
        currentMarginPercent: Math.round(currentMargin * 100) / 100,
        floorPrice: Math.ceil(floorPrice * 100) / 100,
        plans,
        recommended,
        summary,
    };
}
