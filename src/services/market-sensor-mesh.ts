import { SqliteStore } from "./sqlite-store.js";

const store = new SqliteStore();

export interface CompetitorSkuSnapshot {
  platform: string;
  competitorId: string;
  skuId: string;
  title: string;
  price: number;
  stock: number;
  soldCount: number;
  rating?: number;
  timestamp: number;
}

export interface CompetitorSkuDiff {
  skuId: string;
  platform: string;
  field: "price" | "stock" | "soldCount" | "title";
  oldValue: number | string;
  newValue: number | string;
  delta?: number;
  timestamp: number;
}

export class MarketSensorMesh {
  /**
   * Records a competitor snapshot and returns only the semantic diffs (Zero-Waste).
   */
  async ingestCompetitorSnapshot(snapshot: CompetitorSkuSnapshot): Promise<CompetitorSkuDiff[]> {
    const key = `competitor:${snapshot.platform}:${snapshot.skuId}`;
    const rawPrev = await store.get(key);
    const diffs: CompetitorSkuDiff[] = [];

    if (rawPrev) {
      const prev: CompetitorSkuSnapshot = JSON.parse(rawPrev);
      if (prev.price !== snapshot.price) {
        diffs.push({
          skuId: snapshot.skuId,
          platform: snapshot.platform,
          field: "price",
          oldValue: prev.price,
          newValue: snapshot.price,
          delta: snapshot.price - prev.price,
          timestamp: snapshot.timestamp,
        });
      }
      if (prev.stock !== snapshot.stock) {
        diffs.push({
          skuId: snapshot.skuId,
          platform: snapshot.platform,
          field: "stock",
          oldValue: prev.stock,
          newValue: snapshot.stock,
          delta: snapshot.stock - prev.stock,
          timestamp: snapshot.timestamp,
        });
      }
      if (prev.soldCount !== snapshot.soldCount) {
        diffs.push({
          skuId: snapshot.skuId,
          platform: snapshot.platform,
          field: "soldCount",
          oldValue: prev.soldCount,
          newValue: snapshot.soldCount,
          delta: snapshot.soldCount - prev.soldCount,
          timestamp: snapshot.timestamp,
        });
      }
    }

    // Save latest snapshot to SQLite
    await store.set(key, JSON.stringify(snapshot));

    // Append to time-series history log
    const historyKey = `competitor_history:${snapshot.platform}:${snapshot.skuId}`;
    const rawHistory = await store.get(historyKey);
    const history: CompetitorSkuSnapshot[] = rawHistory ? JSON.parse(rawHistory) : [];
    history.push(snapshot);
    // Keep last 30 snapshots
    if (history.length > 30) history.shift();
    await store.set(historyKey, JSON.stringify(history));

    return diffs;
  }

  /**
   * Calculates estimated sales velocity (units/day) based on time-series delta of soldCount.
   */
  async estimateSalesVelocity(platform: string, skuId: string): Promise<{
    unitsSoldPerDay: number;
    observationDays: number;
    totalDeltaSold: number;
    velocityCategory: "HIGH" | "MEDIUM" | "LOW" | "STAGNANT";
  }> {
    const historyKey = `competitor_history:${platform}:${skuId}`;
    const rawHistory = await store.get(historyKey);
    if (!rawHistory) {
      return { unitsSoldPerDay: 0, observationDays: 0, totalDeltaSold: 0, velocityCategory: "STAGNANT" };
    }
    const history: CompetitorSkuSnapshot[] = JSON.parse(rawHistory);
    if (history.length < 2) {
      return { unitsSoldPerDay: 0, observationDays: 0, totalDeltaSold: 0, velocityCategory: "STAGNANT" };
    }

    const first = history[0];
    const last = history[history.length - 1];
    const deltaMs = last.timestamp - first.timestamp;
    const observationDays = Math.max(0.1, deltaMs / (1000 * 60 * 60 * 24));
    const totalDeltaSold = Math.max(0, last.soldCount - first.soldCount);
    const unitsSoldPerDay = Number((totalDeltaSold / observationDays).toFixed(2));

    let velocityCategory: "HIGH" | "MEDIUM" | "LOW" | "STAGNANT" = "STAGNANT";
    if (unitsSoldPerDay >= 20) velocityCategory = "HIGH";
    else if (unitsSoldPerDay >= 5) velocityCategory = "MEDIUM";
    else if (unitsSoldPerDay > 0) velocityCategory = "LOW";

    return {
      unitsSoldPerDay,
      observationDays: Number(observationDays.toFixed(2)),
      totalDeltaSold,
      velocityCategory,
    };
  }

  /**
   * Scans trending products from radar cache or simulation.
   */
  async getTrendRadar(platform: string, category: string = "all") {
    return [
      {
        keyword: "สเปรย์ล็อคเครื่องสำอาง",
        searchVolumeGrowth: "+340%",
        trendingPlatform: platform,
        category,
        suggestedAction: "SOURCING_ARBITRAGE"
      },
      {
        keyword: "กระบอกน้ำเก็บความเย็น 2L",
        searchVolumeGrowth: "+180%",
        trendingPlatform: platform,
        category,
        suggestedAction: "DYNAMIC_PRICING"
      }
    ];
  }
}
