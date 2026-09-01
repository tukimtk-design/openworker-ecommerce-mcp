import { RepricerDaemon, RepriceRule } from "../services/repricer-daemon.js";
import { SqliteStore } from "../services/sqlite-store.js";

const repricer = new RepricerDaemon();
const store = new SqliteStore();

export async function handleEcommerceRepricerDaemon(args: any) {
  const action = args?.action;
  const platform = args?.platform || "shopee";
  const skuId = args?.skuId;

  if (!action) {
    return { isError: true, content: [{ type: "text", text: "Missing action in repricer daemon" }] };
  }

  if (action === "evaluate_and_reprice") {
    if (!skuId || args?.currentPrice === undefined || args?.competitorPrice === undefined) {
      return { isError: true, content: [{ type: "text", text: "Missing skuId, currentPrice, or competitorPrice" }] };
    }

    const rule: RepriceRule = {
      platform,
      skuId,
      strategy: args?.strategy || "UNDERCUT_COMPETITOR",
      undercutAmount: Number(args?.undercutAmount || 1),
      targetMarginPercent: Number(args?.targetMarginPercent || 20),
      maxUpdatesPerDay: Number(args?.maxUpdatesPerDay || 5),
    };

    const decision = await repricer.evaluateReprice(
      rule,
      Number(args.currentPrice),
      Number(args.competitorPrice)
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            decision,
          }),
        },
      ],
    };
  }

  if (action === "set_sku_rule") {
    if (!skuId) {
      return { isError: true, content: [{ type: "text", text: "Missing skuId to configure rule" }] };
    }
    const rule: RepriceRule = {
      platform,
      skuId,
      strategy: args?.strategy || "UNDERCUT_COMPETITOR",
      undercutAmount: Number(args?.undercutAmount || 1),
      targetMarginPercent: Number(args?.targetMarginPercent || 20),
      maxUpdatesPerDay: Number(args?.maxUpdatesPerDay || 5),
    };
    await store.set(`reprice_rule:${platform}:${skuId}`, JSON.stringify(rule));
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            message: `Reprice rule saved for ${skuId} on ${platform}`,
            rule,
          }),
        },
      ],
    };
  }

  return { isError: true, content: [{ type: "text", text: `Unknown repricer action: ${action}` }] };
}
