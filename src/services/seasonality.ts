// Phase 13 Task 13.2: Seasonality & Holiday Calendar
// Pure, deterministic demand multipliers for Thai/CN holidays, shopping festivals
// and payday windows. Multipliers compound but are capped to keep forecasts sane.

export interface SeasonalFactor {
    multiplier: number;
    reasons: string[];
}

interface SeasonalEvent {
    name: string;
    match: (month: number, day: number) => boolean;
    multiplier: number;
}

// Fixed-date windows (Gregorian). Lunar events (e.g. Chinese New Year) use an
// approximate window — recalibrate yearly if precision matters.
const EVENTS: SeasonalEvent[] = [
    {
        name: "Songkran Festival",
        match: (m, d) => (m === 4 && d >= 10 && d <= 16),
        multiplier: 1.35,
    },
    {
        name: "Thai New Year",
        match: (m, d) => (m === 12 && d >= 28) || (m === 1 && d <= 3),
        multiplier: 1.45,
    },
    {
        name: "Chinese New Year (approx.)",
        match: (m, d) => (m === 1 && d >= 20 && d <= 27) || (m === 2 && d <= 5),
        multiplier: 1.2,
    },
    {
        name: "Double-Day Mega Sale",
        // 9.9, 10.10, 11.11, 12.12 with a 2-day pre-sale ramp
        match: (m, d) => (m >= 9 && m <= 12) && d === m,
        multiplier: 1.8,
    },
    {
        name: "Double-Day Pre-Sale",
        match: (m, d) => (m >= 9 && m <= 12) && (d === m - 1 || d === m - 2),
        multiplier: 1.25,
    },
    {
        name: "Payday Window",
        match: (m, d) => d >= 25 || d <= 3,
        multiplier: 1.15,
    },
    {
        name: "Valentine's Day",
        match: (m, d) => m === 2 && d >= 10 && d <= 14,
        multiplier: 1.2,
    },
];

const MAX_COMPOUND_MULTIPLIER = 2.5;

function parseIso(isoDate: string): { month: number; day: number } {
    const [, m, d] = isoDate.split("-");
    return { month: Number(m), day: Number(d) };
}

/** Demand multiplier for one calendar day, with the events that caused it. */
export function getDemandMultiplier(isoDate: string): SeasonalFactor {
    const { month, day } = parseIso(isoDate);
    let multiplier = 1;
    const reasons: string[] = [];
    for (const ev of EVENTS) {
        if (ev.match(month, day)) {
            multiplier *= ev.multiplier;
            reasons.push(ev.name);
        }
    }
    return { multiplier: Math.min(multiplier, MAX_COMPOUND_MULTIPLIER), reasons };
}

function addDays(isoDate: string, days: number): string {
    const d = new Date(isoDate + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}

/** Average daily demand over the next `numDays` when each day's base demand is
 *  scaled by that day's seasonal multiplier. */
export function seasonalAdjustedDemand(baseDailyDemand: number, fromDateIso: string, numDays: number): number {
    if (numDays <= 0) return baseDailyDemand;
    let total = 0;
    for (let i = 0; i < numDays; i++) {
        total += baseDailyDemand * getDemandMultiplier(addDays(fromDateIso, i)).multiplier;
    }
    return total / numDays;
}

/** Per-day multipliers for a horizon — useful for UI/debug output. */
export function seasonalityPreview(fromDateIso: string, numDays: number): Array<{ date: string; multiplier: number; reasons: string[] }> {
    const out: Array<{ date: string; multiplier: number; reasons: string[] }> = [];
    for (let i = 0; i < numDays; i++) {
        const date = addDays(fromDateIso, i);
        const f = getDemandMultiplier(date);
        out.push({ date, multiplier: f.multiplier, reasons: f.reasons });
    }
    return out;
}
