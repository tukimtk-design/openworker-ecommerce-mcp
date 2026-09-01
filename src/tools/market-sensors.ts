import { MarketSensorMesh, CompetitorSkuSnapshot } from "../services/market-sensor-mesh.js";

const sensorMesh = new MarketSensorMesh();

export async function handleEcommerceMarketSensors(args: any) {
  const action = args?.action;
  const platform = args?.platform || "shopee";

  if (!action) {
    return { isError: true, content: [{ type: "text", text: "Missing action in market sensor tool" }] };
  }

  if (action === "diff_competitor") {
    const skuId = args?.skuId;
    if (!skuId || args?.price === undefined || args?.stock === undefined || args?.soldCount === undefined) {
      return { isError: true, content: [{ type: "text", text: "Missing skuId, price, stock, or soldCount for competitor diff" }] };
    }

    const snapshot: CompetitorSkuSnapshot = {
      platform,
      competitorId: args?.competitorId || "competitor_unknown",
      skuId,
      title: args?.title || "Product Title",
      price: Number(args.price),
      stock: Number(args.stock),
      soldCount: Number(args.soldCount),
      rating: Number(args?.rating || 5.0),
      timestamp: args?.timestamp || Date.now(),
    };

    const diffs = await sensorMesh.ingestCompetitorSnapshot(snapshot);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            platform,
            skuId,
            hasChanged: diffs.length > 0,
            deltaDiffs: diffs,
            message: diffs.length > 0 ? `Detected ${diffs.length} competitor changes.` : "No change detected (Delta is 0).",
          }),
        },
      ],
    };
  }

  if (action === "velocity_estimate") {
    const skuId = args?.skuId;
    if (!skuId) {
      return { isError: true, content: [{ type: "text", text: "Missing skuId for velocity estimate" }] };
    }
    const velocity = await sensorMesh.estimateSalesVelocity(platform, skuId);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            platform,
            skuId,
            velocity,
          }),
        },
      ],
    };
  }

  if (action === "trend_radar") {
    const category = args?.category || "general";
    const trends = await sensorMesh.getTrendRadar(platform, category);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            platform,
            category,
            trends,
          }),
        },
      ],
    };
  }

  return { isError: true, content: [{ type: "text", text: `Unknown sensor action: ${action}` }] };
}
