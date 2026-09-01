import { SqliteStore } from "../services/sqlite-store.js";

const store = new SqliteStore();

export interface CogsEntry {
  platform: string;
  productId: string;
  skuId?: string;
  cogs: number;
  inboundShipping: number;
  packagingCost: number;
  minMarginPercent: number;
}

export async function handleEcommerceProfitLedger(args: any) {
  const action = args?.action;
  const platform = args?.platform || "shopee";
  const productId = args?.productId;

  if (!action) {
    return { isError: true, content: [{ type: "text", text: "Missing action in profit ledger" }] };
  }

  if (action === "set_cogs") {
    if (!productId || args?.cogs === undefined) {
      return { isError: true, content: [{ type: "text", text: "Missing productId or cogs" }] };
    }
    const entry: CogsEntry = {
      platform,
      productId,
      skuId: args?.skuId || "default",
      cogs: Number(args.cogs),
      inboundShipping: Number(args?.inboundShipping || 0),
      packagingCost: Number(args?.packagingCost || 0),
      minMarginPercent: Number(args?.minMarginPercent || 15),
    };
    const key = `cogs:${platform}:${productId}:${entry.skuId}`;
    await store.set(key, JSON.stringify(entry));
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            message: `COGS configured for ${productId} (${platform})`,
            entry,
          }),
        },
      ],
    };
  }

  if (action === "compute_net_margin") {
    const proposedPrice = Number(args?.proposedPrice || 0);
    const skuId = args?.skuId || "default";
    const key = `cogs:${platform}:${productId}:${skuId}`;
    const raw = await store.get(key);
    
    // Default fallback COGS if not explicitly recorded
    const cogsData: CogsEntry = raw ? JSON.parse(raw) : {
      platform,
      productId: productId || "unknown",
      skuId,
      cogs: proposedPrice * 0.5,
      inboundShipping: 0,
      packagingCost: 5,
      minMarginPercent: 15
    };

    const platformFeeRate = Number(args?.platformFeeRate || 0.08); // 8% avg commission + transaction
    const shippingBurden = Number(args?.shippingBurden || 0);
    const adSpendPerUnit = Number(args?.adSpendPerUnit || 0);

    const totalCogs = cogsData.cogs + cogsData.inboundShipping + cogsData.packagingCost;
    const netRevenue = proposedPrice * (1 - platformFeeRate) - shippingBurden - adSpendPerUnit;
    const netMarginBaht = netRevenue - totalCogs;
    const netMarginPercent = proposedPrice > 0 ? (netMarginBaht / proposedPrice) * 100 : 0;
    const isSafe = netMarginPercent >= cogsData.minMarginPercent;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            platform,
            productId,
            proposedPrice,
            totalCogs,
            netRevenue: Number(netRevenue.toFixed(2)),
            netMarginBaht: Number(netMarginBaht.toFixed(2)),
            netMarginPercent: Number(netMarginPercent.toFixed(2)),
            minMarginPercent: cogsData.minMarginPercent,
            isSafe,
            recommendation: isSafe ? "APPROVED" : "REJECTED_BELOW_MARGIN_FLOOR"
          }),
        },
      ],
    };
  }

  if (action === "get_ledger") {
    const skuId = args?.skuId || "default";
    const key = `cogs:${platform}:${productId}:${skuId}`;
    const raw = await store.get(key);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            data: raw ? JSON.parse(raw) : null
          })
        }
      ]
    };
  }

  return { isError: true, content: [{ type: "text", text: `Unknown action ${action}` }] };
}
