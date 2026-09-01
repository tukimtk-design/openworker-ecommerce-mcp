import { SqliteStore } from "./sqlite-store.js";
import { handleEcommerceProfitLedger } from "../tools/profit-ledger.js";

const store = new SqliteStore();

export type RepriceStrategy = "UNDERCUT_COMPETITOR" | "MATCH_COMPETITOR" | "TARGET_MARGIN";

export interface RepriceRule {
  platform: string;
  skuId: string;
  strategy: RepriceStrategy;
  undercutAmount?: number; // default 1 THB
  targetMarginPercent?: number; // e.g. 20%
  maxUpdatesPerDay?: number; // default 5
  cooldownMinutes?: number; // default 30
}

export interface RepriceDecision {
  skuId: string;
  platform: string;
  currentPrice: number;
  competitorPrice: number;
  proposedPrice: number;
  strategy: RepriceStrategy;
  isBlocked: boolean;
  blockReason?: string;
  actionTaken: "PRICE_UPDATED" | "PRICE_UNCHANGED" | "BLOCKED_MARGIN_FLOOR" | "BLOCKED_COOLDOWN" | "BLOCKED_OSCILLATION_WAR";
}

export class RepricerDaemon {
  /**
   * Executes deterministic T0 repricing decision against a competitor price.
   */
  async evaluateReprice(
    rule: RepriceRule,
    currentPrice: number,
    competitorPrice: number
  ): Promise<RepriceDecision> {
    const { platform, skuId, strategy } = rule;
    const undercut = rule.undercutAmount || 1;
    const maxUpdates = rule.maxUpdatesPerDay || 5;

    // 1. Check Cooldown & Daily Update Count
    const countKey = `reprice_count:${platform}:${skuId}:${new Date().toISOString().slice(0, 10)}`;
    const rawCount = await store.get(countKey);
    const updateCount = rawCount ? parseInt(rawCount, 10) : 0;

    if (updateCount >= maxUpdates) {
      return {
        skuId,
        platform,
        currentPrice,
        competitorPrice,
        proposedPrice: currentPrice,
        strategy,
        isBlocked: true,
        blockReason: `Daily update limit reached (${updateCount}/${maxUpdates})`,
        actionTaken: "BLOCKED_COOLDOWN"
      };
    }

    // 2. Oscillation War Detection
    const warKey = `reprice_war:${platform}:${skuId}`;
    const rawWar = await store.get(warKey);
    const warLog: { timestamp: number; diff: number }[] = rawWar ? JSON.parse(rawWar) : [];

    // Check if competitor responded within 15 mins multiple times
    const now = Date.now();
    const recentWars = warLog.filter(w => now - w.timestamp < 15 * 60 * 1000);
    if (recentWars.length >= 3) {
      return {
        skuId,
        platform,
        currentPrice,
        competitorPrice,
        proposedPrice: currentPrice,
        strategy,
        isBlocked: true,
        blockReason: "Oscillation Price War detected (Competitor retaliated 3x within 15 mins). Pausing price cuts.",
        actionTaken: "BLOCKED_OSCILLATION_WAR"
      };
    }

    // 3. Compute Target Price based on Strategy
    let targetPrice = currentPrice;
    if (strategy === "UNDERCUT_COMPETITOR") {
      targetPrice = Math.max(1, competitorPrice - undercut);
    } else if (strategy === "MATCH_COMPETITOR") {
      targetPrice = competitorPrice;
    } else if (strategy === "TARGET_MARGIN") {
      // Fetch COGS to calculate price
      const cogsRaw = await store.get(`cogs:${platform}:${skuId}:default`);
      const cogs = cogsRaw ? JSON.parse(cogsRaw).cogs : currentPrice * 0.6;
      const desiredMargin = (rule.targetMarginPercent || 20) / 100;
      targetPrice = Number((cogs / (1 - 0.08 - desiredMargin)).toFixed(2));
    }

    if (targetPrice === currentPrice) {
      return {
        skuId,
        platform,
        currentPrice,
        competitorPrice,
        proposedPrice: currentPrice,
        strategy,
        isBlocked: false,
        actionTaken: "PRICE_UNCHANGED"
      };
    }

    // 4. Hardcoded Profit Ledger Check (Fail-closed Margin Floor)
    const ledgerCheck = await handleEcommerceProfitLedger({
      action: "compute_net_margin",
      platform,
      productId: skuId,
      skuId: "default",
      proposedPrice: targetPrice,
    });
    const parsedLedger = JSON.parse((ledgerCheck as any).content[0].text);

    if (!parsedLedger.isSafe) {
      return {
        skuId,
        platform,
        currentPrice,
        competitorPrice,
        proposedPrice: targetPrice,
        strategy,
        isBlocked: true,
        blockReason: `Net Margin (${parsedLedger.netMarginPercent}%) is below minimum required (${parsedLedger.minMarginPercent}%)`,
        actionTaken: "BLOCKED_MARGIN_FLOOR"
      };
    }

    // 5. Record Update & History
    await store.set(countKey, (updateCount + 1).toString());
    warLog.push({ timestamp: now, diff: targetPrice - currentPrice });
    if (warLog.length > 10) warLog.shift();
    await store.set(warKey, JSON.stringify(warLog));

    return {
      skuId,
      platform,
      currentPrice,
      competitorPrice,
      proposedPrice: targetPrice,
      strategy,
      isBlocked: false,
      actionTaken: "PRICE_UPDATED"
    };
  }
}
