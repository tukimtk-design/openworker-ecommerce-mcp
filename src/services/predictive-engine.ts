// Predictive Inventory Engine (Phase 12)
// Pure, deterministic forecasting functions: weighted sales velocity, linear trend,
// safety stock, stockout date, reorder point and suggested reorder quantity.
// Phase 13: optional seasonality-aware depletion and reorder calculations.

import { getDemandMultiplier, seasonalAdjustedDemand } from "./seasonality.js";

export interface SalesRecord {
    date: string;      // ISO date "YYYY-MM-DD"
    unitsSold: number;
}

export interface ForecastProductInput {
    platform?: string;
    productId: string;
    currentStock: number;
    salesHistory: SalesRecord[];
}

export interface ForecastOptions {
    leadTimeDays?: number;     // supplier lead time (default 7)
    targetCoverDays?: number;  // desired days of stock after reorder (default 30)
    serviceLevel?: number;     // 0.90 | 0.95 | 0.98 | 0.99 (default 0.95)
    today?: string;            // ISO date override for deterministic runs
    useSeasonality?: boolean;  // apply holiday/mega-sale demand multipliers (Phase 13)
}

export type InventoryRisk = "critical" | "warning" | "healthy";

export interface InventoryForecast {
    platform?: string;
    productId: string;
    asOf: string;
    currentStock: number;
    dataPoints: number;
    avgDailySales: number;
    trendPerDay: number;
    projectedDailySales: number;
    daysOfCover: number;
    stockoutDate: string | null;
    leadTimeDays: number;
    safetyStock: number;
    reorderPoint: number;
    suggestedReorderQty: number;
    risk: InventoryRisk;
    seasonalityApplied: boolean;
    recommendation: string;
}

const MAX_HORIZON_DAYS = 365;
const COVER_CAP_DAYS = 999;

const Z_SCORES: Record<string, number> = {
    "0.9": 1.28,
    "0.95": 1.645,
    "0.98": 2.05,
    "0.99": 2.33,
};

function toIsoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
    const d = new Date(isoDate + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    return toIsoDate(d);
}

function diffDays(fromIso: string, toIso: string): number {
    const a = new Date(fromIso + "T00:00:00Z").getTime();
    const b = new Date(toIso + "T00:00:00Z").getTime();
    return Math.round((b - a) / 86400000);
}

/** Sort ascending by date, coerce/clamp units, collapse duplicate dates (last wins),
 *  and fill missing days with 0 so the series is contiguous (capped at 365 points). */
export function normalizeSalesHistory(records: SalesRecord[]): SalesRecord[] {
    const byDate = new Map<string, number>();
    for (const r of records || []) {
        if (!r || typeof r.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.date)) continue;
        const units = Math.max(0, Number(r.unitsSold) || 0);
        byDate.set(r.date, units);
    }
    if (byDate.size === 0) return [];

    const dates = [...byDate.keys()].sort();
    const start = dates[0];
    const end = dates[dates.length - 1];
    const span = Math.min(diffDays(start, end), MAX_HORIZON_DAYS - 1);

    const series: SalesRecord[] = [];
    for (let i = 0; i <= span; i++) {
        const date = addDays(start, i);
        series.push({ date, unitsSold: byDate.get(date) || 0 });
    }
    return series;
}

/** Linearly-weighted moving average: recent days count more than old ones. */
export function weightedAverage(values: number[]): number {
    const n = values.length;
    if (n === 0) return 0;
    let weightedSum = 0;
    let weightTotal = 0;
    for (let i = 0; i < n; i++) {
        const w = i + 1;
        weightedSum += values[i] * w;
        weightTotal += w;
    }
    return weightedSum / weightTotal;
}

/** Least-squares slope of daily demand (units/day per day). */
export function trendSlope(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;
    const meanX = (n - 1) / 2;
    const meanY = values.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
        num += (i - meanX) * (values[i] - meanY);
        den += (i - meanX) ** 2;
    }
    return den === 0 ? 0 : num / den;
}

export function stdDev(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1);
    return Math.sqrt(variance);
}

export function zScoreForServiceLevel(level: number | undefined): number {
    const key = level === undefined ? "0.95" : String(level);
    return Z_SCORES[key] ?? 1.645;
}

/** Days until stock runs out under trend-adjusted demand; capped at COVER_CAP_DAYS.
 *  `seasonalFactor(day)` optionally scales the base demand for that future day. */
function simulateDaysOfCover(
    currentStock: number,
    avgDaily: number,
    slope: number,
    seasonalFactor?: (day: number) => number
): number {
    if (currentStock <= 0) return 0;
    let remaining = currentStock;
    for (let day = 0; day < COVER_CAP_DAYS; day++) {
        const base = Math.max(0, avgDaily + slope * day);
        const demand = base * (seasonalFactor ? seasonalFactor(day) : 1);
        remaining -= demand;
        if (remaining <= 0) return day + 1;
    }
    return COVER_CAP_DAYS;
}

export function forecastInventory(input: ForecastProductInput, options: ForecastOptions = {}): InventoryForecast {
    const { platform, productId, currentStock } = input;
    const stock = Math.max(0, Number(currentStock) || 0);

    const series = normalizeSalesHistory(input.salesHistory);
    if (series.length === 0) {
        throw new Error("salesHistory must contain at least one valid record {date: 'YYYY-MM-DD', unitsSold: number}");
    }

    const leadTimeDays = Math.max(1, Math.floor(options.leadTimeDays ?? 7));
    const targetCoverDays = Math.max(1, Math.floor(options.targetCoverDays ?? 30));
    const z = zScoreForServiceLevel(options.serviceLevel);
    const asOf = options.today && /^\d{4}-\d{2}-\d{2}$/.test(options.today)
        ? options.today
        : toIsoDate(new Date());

    const values = series.map(s => s.unitsSold);
    const avgDailySales = weightedAverage(values);
    const slope = trendSlope(values);
    const projectedDailySales = Math.max(0, avgDailySales + slope * (leadTimeDays / 2));

    const useSeasonality = options.useSeasonality === true;
    const seasonalFactor = useSeasonality
        ? (day: number) => getDemandMultiplier(addDays(asOf, day)).multiplier
        : undefined;

    const daysOfCover = simulateDaysOfCover(stock, avgDailySales, slope, seasonalFactor);
    const stockoutDate = daysOfCover >= COVER_CAP_DAYS ? null : addDays(asOf, daysOfCover);

    const sigma = stdDev(values);
    const safetyStock = Math.ceil(z * sigma * Math.sqrt(leadTimeDays));
    const leadTimeDemand = Math.ceil(
        useSeasonality
            ? seasonalAdjustedDemand(projectedDailySales, asOf, leadTimeDays) * leadTimeDays
            : projectedDailySales * leadTimeDays
    );
    const reorderPoint = leadTimeDemand + safetyStock;
    const suggestedReorderQty = Math.max(0, Math.ceil(targetCoverDays * projectedDailySales) - stock);

    let risk: InventoryRisk;
    if (stock <= reorderPoint) {
        risk = "critical";
    } else if (daysOfCover <= Math.ceil(targetCoverDays / 2)) {
        risk = "warning";
    } else {
        risk = "healthy";
    }

    let recommendation: string;
    if (risk === "critical") {
        recommendation = `สั่งซื้อด่วน ${suggestedReorderQty} ชิ้น — สต็อก ( ${stock} ) ต่ำกว่าจุดสั่งซื้อ ( ${reorderPoint} ) คาดว่าของจะหมดประมาณ ${daysOfCover} วัน ซึ่งเสี่ยงหมดสต็อกก่อนของถึงมือ (lead time ${leadTimeDays} วัน)`;
    } else if (risk === "warning") {
        recommendation = `เตรียมสั่งซื้อ ${suggestedReorderQty} ชิ้น ภายใน ${daysOfCover - leadTimeDays} วันข้างหน้า — สต็อกเหลือประมาณ ${daysOfCover} วัน`;
    } else {
        recommendation = `สต็อกเพียงพอ (ครอบคลุม ~${daysOfCover >= COVER_CAP_DAYS ? "มากกว่า 1 ปี" : daysOfCover + " วัน"}) ยังไม่จำเป็นต้องสั่งซื้อเพิ่ม`;
    }

    return {
        platform,
        productId,
        asOf,
        currentStock: stock,
        dataPoints: series.length,
        avgDailySales: Math.round(avgDailySales * 100) / 100,
        trendPerDay: Math.round(slope * 100) / 100,
        projectedDailySales: Math.round(projectedDailySales * 100) / 100,
        daysOfCover,
        stockoutDate,
        leadTimeDays,
        safetyStock,
        reorderPoint,
        suggestedReorderQty,
        risk,
        seasonalityApplied: useSeasonality,
        recommendation,
    };
}

/** Forecast many products and return them sorted by urgency (critical first, then least cover). */
export function bulkForecast(products: ForecastProductInput[], options: ForecastOptions = {}): InventoryForecast[] {
    const riskOrder: Record<InventoryRisk, number> = { critical: 0, warning: 1, healthy: 2 };
    return products
        .map(p => forecastInventory(p, options))
        .sort((a, b) =>
            riskOrder[a.risk] - riskOrder[b.risk] || a.daysOfCover - b.daysOfCover
        );
}
