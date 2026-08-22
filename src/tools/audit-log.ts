import { AuditLogEntry, Platform } from "../types.js";

// In-memory mock store for audit logs (would use a real DB/file in production)
const mockAuditLogs: AuditLogEntry[] = [];

export async function handleEcommerceAuditLog(args: any) {
  const action = args?.action;

  if (action === "record") {
     const newEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        platform: args.platform || "shopee",
        productId: args.productId || "unknown",
        skuId: args.skuId,
        action: "update_price_stock",
        oldPrice: args.oldPrice,
        newPrice: args.newPrice,
        oldStock: args.oldStock,
        newStock: args.newStock,
        updatedBy: "MCP_Agent"
     };
     mockAuditLogs.push(newEntry);
     return {
        content: [{ type: "text", text: JSON.stringify({ status: "recorded", entry: newEntry }) }]
     };
  } else if (action === "get_history") {
     const productId = args.productId;
     const limit = args.limit || 20;

     let filteredLogs = mockAuditLogs;
     if (productId) {
         filteredLogs = mockAuditLogs.filter(log => log.productId === productId);
     }

     // Sort newest first
     filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

     return {
         content: [{ type: "text", text: JSON.stringify({ status: "success", logs: filteredLogs.slice(0, limit) }) }]
     };
  }

  return {
     isError: true,
     content: [{ type: "text", text: "Invalid action. Use 'record' or 'get_history'." }]
  };
}
