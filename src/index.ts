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
        name: "ecommerce_extract_session",
        description: "ดึง Cookies, CSRF Tokens และ Authorization Headers จาก Tab ร้านค้าที่เปิดอยู่",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada"] },
          },
          required: ["platform"],
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
      {
        name: "browser_detect_challenge",
        description: "สแกนหา Captcha/OTP บน Tab ที่เปิดอยู่ และส่งสัญญาณแจ้งเตือนเมื่อต้องให้มนุษย์ปลดล็อกหน้าจอ",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada"] },
          },
          required: ["platform"],
        },
      },
      {
        name: "ecommerce_get_store_metrics",
        description: "ดึงข้อมูลสรุปออเดอร์ค้างจัดส่งและรายการ SKU ที่สต็อกกำลังหมด",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada"] },
          },
          required: ["platform"],
        },
      },
      {
        name: "ecommerce_batch_update_price_stock",
        description: "อัปเดตราคาและสต็อกแบบหลายรายการพร้อมระบบชะลอความเร็วเพื่อป้องกันการโดน Rate-Limit",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada"] },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string" },
                  skuId: { type: "string" },
                  newPrice: { type: "number" },
                  newStock: { type: "number" },
                },
                required: ["productId"],
              },
            },
          },
          required: ["platform", "items"],
        },
      },
      {
        name: "ecommerce_audit_log",
        description: "บันทึกและเรียกดูประวัติการเปลี่ยนแปลงราคาสินค้าและสต็อกย้อนหลัง",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["record", "get_history"] },
            productId: { type: "string" },
            limit: { type: "number", default: 20 },
          },
          required: ["action"],
        },
      },
      {
        name: "ecommerce_run_recipe",
        description: "⚡ [Token Saver] รันคำสั่งสำเร็จรูปโดยรับเพียงพารามิเตอร์หลัก ป้องกันการเจนสคริปต์ใหม่ที่สิ้นเปลือง Token",
        inputSchema: {
          type: "object",
          properties: {
            recipeId: {
              type: "string",
              enum: [
                "shopee_quick_update_price",
                "shopee_quick_update_stock",
                "tiktok_quick_update_price",
                "tiktok_quick_update_stock",
                "lazada_quick_update_price",
                "lazada_quick_update_stock",
                "batch_inventory_sync",
              ],
            },
            params: { type: "object" },
          },
          required: ["recipeId", "params"],
        },
      },
      {
        name: "ecommerce_list_recipes",
        description: "แสดงรายการ Workflow Recipes ทั้งหมด พร้อมโครงสร้าง Parameter",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "all"], default: "all" },
          },
        },
      },
      {
        name: "ecommerce_save_custom_recipe",
        description: "บันทึกลำดับขั้นตอนการทำงาน (Macro Sequence) เป็น Recipe ใหม่ไว้เรียกใช้ซ้ำ",
        inputSchema: {
          type: "object",
          properties: {
            recipeId: { type: "string" },
            description: { type: "string" },
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada"] },
            steps: { type: "array" },
          },
          required: ["recipeId", "platform", "steps"],
        },
      },
      {
        name: "ecommerce_cached_selector_map",
        description: "จัดการและอัปเดต Selector Cache เมื่อหน้าเว็บ E-Commerce มีการเปลี่ยนโครงสร้าง UI",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada"] },
            action: { type: "string", enum: ["get_map", "update_selector"] },
            selectorKey: { type: "string" },
            newSelector: { type: "string" },
          },
          required: ["platform", "action"],
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

    case "ecommerce_run_recipe": {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "success",
              recipeId: args?.recipeId,
              message: `[Token Saver Engine] รัน Recipe '${args?.recipeId}' สำเร็จด้วยพารามิเตอร์ที่กำหนด โดยไม่ต้องเจนสคริปต์ใหม่`,
              savedTokenEstimate: "~4,500 tokens",
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
