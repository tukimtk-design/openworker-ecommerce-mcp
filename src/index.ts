import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "openworker-ecommerce-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "browser_attach_existing",
        description: "ตรวจสอบการเชื่อมต่อ Chrome/Edge บนพอร์ต 9222 และแสดงรายการ Tab ร้านค้า Shopee/TikTok/Lazada",
        inputSchema: {
          type: "object",
          properties: {
            port: { type: "number", default: 9222 },
          },
        },
      },
      {
        name: "ecommerce_product_search",
        description: "ค้นหารายการสินค้าและ SKU จากระบบหลังบ้านร้านค้า",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada"] },
            query: { type: "string" },
          },
          required: ["platform", "query"],
        },
      },
      {
        name: "ecommerce_update_price_stock",
        description: "ปรับเปลี่ยนราคาสินค้าและจำนวนสต็อก",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada"] },
            productId: { type: "string" },
            skuId: { type: "string" },
            newPrice: { type: "number" },
            newStock: { type: "number" },
          },
          required: ["platform", "productId"],
        },
      },
      {
        name: "ecommerce_safety_guard",
        description: "ตรวจสอบความปลอดภัยและส่วนต่างของราคาสินค้าก่อนทำการอัปเดตบันทึกจริง",
        inputSchema: {
          type: "object",
          properties: {
            currentPrice: { type: "number" },
            proposedPrice: { type: "number" },
            maxPriceDropPercent: { type: "number", default: 50 },
          },
          required: ["currentPrice", "proposedPrice"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "browser_attach_existing":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "connected",
              message: "พร้อมรับคำสั่งพัฒนาต่อจาก Jules (Google AI Agent)",
              tabs: [],
            }),
          },
        ],
      };

    case "ecommerce_safety_guard": {
      const current = Number(args?.currentPrice || 0);
      const proposed = Number(args?.proposedPrice || 0);
      const maxDrop = Number(args?.maxPriceDropPercent || 50);

      const dropPercent = ((current - proposed) / current) * 100;
      const isSafe = dropPercent <= maxDrop;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              isSafe,
              dropPercent: Number(dropPercent.toFixed(2)),
              warning: isSafe
                ? null
                : `เตือน: ราคาสินค้าลดลง ${dropPercent.toFixed(1)}% ซึ่งเกินขีดจำกัดความปลอดภัย (${maxDrop}%)`,
            }),
          },
        ],
      };
    }

    default:
      return {
        content: [
          {
            type: "text",
            text: `Tool '${name}' กำลังถูกพัฒนาโดย Jules (Google AI Agent)`,
          },
        ],
      };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Openworker E-Commerce MCP Server Running on Stdio...");
}

main().catch((err) => {
  console.error("Fatal Error in MCP Server:", err);
  process.exit(1);
});
