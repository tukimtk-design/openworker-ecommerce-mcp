import { Platform } from "../types.js";

export async function handleEcommerceOrderAggregator(args: any) {
  const platforms = args?.platforms as Platform[];
  const action = args?.action as "aggregate_pending" | "allocate_stock";

  if (!platforms || !Array.isArray(platforms) || !action) {
    return {
      isError: true,
      content: [{ type: "text", text: "กรุณาระบุ platforms เป็น array และ action" }],
    };
  }

  if (action === "aggregate_pending") {
      // Mock aggregating orders from multiple platforms
      const mockOrders = platforms.flatMap(platform => [
          { orderId: `${platform}_101`, platform, status: "pending", items: [{ skuId: "SKU1", qty: 1 }] },
          { orderId: `${platform}_102`, platform, status: "pending", items: [{ skuId: "SKU2", qty: 2 }] }
      ]);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "success",
              message: "Aggregated pending orders successfully.",
              totalOrders: mockOrders.length,
              orders: mockOrders
            }),
          },
        ],
      };
  } else if (action === "allocate_stock") {
      const globalStockMap = args?.globalStockMap;
      if (!globalStockMap) {
           return {
              isError: true,
              content: [{ type: "text", text: "กรุณาระบุ globalStockMap" }],
            };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "success",
              message: "Allocated stock centrally across requested platforms.",
              allocatedPlatforms: platforms
            }),
          },
        ],
      };
  }

  return {
    isError: true,
    content: [{ type: "text", text: "Invalid action" }],
  };
}
