import { Platform } from "../types.js";

export async function handleEcommerceDynamicPricing(args: any) {
  const platform = args?.platform as Platform;
  const productId = args?.productId;
  const currentPrice = args?.currentPrice;
  const competitorPrice = args?.competitorPrice;
  const floorPrice = args?.floorPrice;

  if (!platform || !productId || currentPrice === undefined || competitorPrice === undefined || floorPrice === undefined) {
    return {
      isError: true,
      content: [{ type: "text", text: "กรุณาระบุข้อมูลให้ครบถ้วน: platform, productId, currentPrice, competitorPrice, floorPrice" }],
    };
  }

  // Strategy: Undercut competitor by 1 unit if possible, but never go below floorPrice
  const targetPrice = competitorPrice - 1;
  let finalPrice = targetPrice;
  let reason = "Matched and undercut competitor price.";

  if (targetPrice < floorPrice) {
      finalPrice = floorPrice;
      reason = "Competitor price is too low. Defaulting to minimum floor price.";
  }

  if (finalPrice >= currentPrice) {
      // Don't increase price based on competitor alone in this simple model, just keep current if we are already lower and above floor
      if (currentPrice < competitorPrice && currentPrice >= floorPrice) {
          finalPrice = currentPrice;
          reason = "Current price is already better than competitor and above floor.";
      }
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          status: "success",
          productId,
          suggestedPrice: finalPrice,
          reason,
          platform
        }),
      },
    ],
  };
}
