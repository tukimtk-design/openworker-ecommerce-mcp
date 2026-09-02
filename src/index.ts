import { handleEcommerceM365CopilotBridge } from "./tools/m365-copilot-bridge.js";
import { handleEcommerceSeoOptimizer } from "./tools/seo-optimizer.js";
import { handleEcommerceOwLnwshopSafeSeoUpdater } from "./tools/lnwshop-seo-updater.js";
import { handleEcommerceGoogleAdsIntegration } from "./tools/google-ads-integration.js";
import { handleEcommercePredictiveInventory } from "./tools/predictive-inventory.js";
import { handleEcommerceReorderWorkflow } from "./tools/reorder-workflow.js";
import { handleEcommerceSendNotification } from "./tools/notify.js";
import { handleEcommerceAutonomousStoreManager } from "./tools/store-agent-tool.js";
import { handleEcommerceCloneProduct } from "./tools/product-cloner.js";
import { handleEcommerceAutoReplyChat } from "./tools/chat-automation.js";
import { handleEcommerceGetPendingOrders, handleEcommerceFulfillOrder } from "./tools/order-fulfillment.js";
import { handleEcommerceManagePromotions } from "./tools/promotion-manager.js";
import { handleEcommerceSyncProductImages } from "./tools/asset-sync.js";
import { handleEcommerceVisualDomAnalysis } from "./tools/visual-analysis.js";
import { handleEcommerceMatchVariants } from "./tools/variant-matcher.js";
import { handleEcommerceSyncMultiplatformStock } from "./tools/multiplatform-sync.js";
import { handleEcommerceContextCompressor } from "./tools/compressor.js";
import { handleEcommerceLocalSqliteCache } from "./tools/local-cache.js";
import { handleEcommerceSmartDiffUpdate } from "./tools/diff-update.js";
import { handleEcommerceHybridExecutor } from "./tools/hybrid-executor-tool.js";
import { handleEcommerceTokenTelemetry } from "./tools/telemetry.js";
import { handleEcommerceRunRecipe, handleEcommerceListRecipes, handleEcommerceSaveCustomRecipe } from "./tools/ecommerce-recipe.js";
import { handleEcommerceCachedSelectorMap } from "./tools/ecommerce-selectors.js";
import { handleBrowserDetectChallenge } from "./tools/browser-challenge.js";
import { handleEcommerceGetStoreMetrics } from "./tools/store-metrics.js";
import { handleEcommerceBatchUpdatePriceStock } from "./tools/batch-update.js";
import { handleEcommerceAuditLog } from "./tools/audit-log.js";
import { handleEcommerceProductSearch } from "./tools/ecommerce-search.js";
import { handleEcommerceUpdatePriceStock } from "./tools/ecommerce-update.js";
import { handleEcommerceSafetyGuard } from "./tools/safety-guard.js";
import { SessionExtractor } from "./services/session-extractor.js";
import { CdpConnection } from "./services/cdp-connection.js";
import { handleBrowserAttachExisting } from "./tools/browser-profile.js";
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
            port: { type: "number", default: 9222 }
          }
        },
      },
      {
        name: "ecommerce_extract_session",
        description: "ดึง Cookies, CSRF Tokens และ Authorization Headers จาก Tab ร้านค้าที่เปิดอยู่",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
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
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
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
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
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
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
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
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
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
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string" },
                  skuId: { type: "string" },
                  newPrice: { type: "number" },
                  newStock: { type: "number" }
                },
                required: ["productId"]
              }
            }
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
        description: "Run a predefined workflow recipe",
        inputSchema: {
          type: "object",
          properties: {
            recipeId: { type: "string" },
            params: {
              type: "object",
              properties: { _dummy: { type: "string" } },
              additionalProperties: { type: "string" }
            }
          },
          required: ["recipeId"]
        }
      },
      {
        name: "ecommerce_list_recipes",
        description: "List all available workflow recipes",
        inputSchema: {
          type: "object",
          properties: {
             _dummy: { type: "string", description: "Dummy parameter to satisfy strict schema requirements" }
          }
        }
      },
      {
        name: "ecommerce_save_custom_recipe",
        description: "Save a custom macro recipe",
        inputSchema: {
          type: "object",
          properties: {
            recipe: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string" },
                    steps: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                action: { type: "string" },
                                selectorKey: { type: "string" },
                                selector: { type: "string" },
                                value: { type: "string" },
                                delayMs: { type: "number" }
                            },
                            required: ["action"]
                        }
                    }
                },
                required: ["id", "name", "steps"]
            }
          },
          required: ["recipe"]
        }
      },
      {
        name: "ecommerce_cached_selector_map",
        description: "Manage cached DOM selectors",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["get", "set", "list"] },
            key: { type: "string" },
            selectors: {
                type: "array",
                items: { type: "string" }
            }
          },
          required: ["action"]
        }
      },
      {
        name: "ecommerce_context_compressor",
        description: "Compress DOM to micro-JSON",
        inputSchema: {
          type: "object",
          properties: {
            domString: { type: "string" }
          },
          required: ["domString"]
        }
      },
      {
        name: "ecommerce_local_sqlite_cache",
        description: "Local SQLite caching",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["get", "set"] },
            key: { type: "string" },
            value: { type: "string" }
          },
          required: ["action", "key"]
        }
      },
      {
        name: "ecommerce_smart_diff_update",
        description: "Calculate deltas between states",
        inputSchema: {
          type: "object",
          properties: {
            currentState: { type: "object", properties: { _dummy: { type: "string" } }, additionalProperties: true },
            targetState: { type: "object", properties: { _dummy: { type: "string" } }, additionalProperties: true }
          },
          required: ["currentState", "targetState"]
        }
      },
      {
        name: "ecommerce_hybrid_executor",
        description: "Hybrid API/CDP/Human execution",
        inputSchema: {
          type: "object",
          properties: {
            taskDetails: { type: "object", properties: { _dummy: { type: "string" } }, additionalProperties: true }
          },
          required: ["taskDetails"]
        }
      },
      {
        name: "ecommerce_token_telemetry",
        description: "Record token telemetry",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["record", "get"] },
            inputTokens: { type: "number" },
            outputTokens: { type: "number" },
            savedTokens: { type: "number" }
          },
          required: ["action"]
        }
      },
      {
        name: "ecommerce_match_variants",
        description: "Fuzzy match product variants across platforms",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["match", "force_map"] },
            sourceName: { type: "string" },
            candidates: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        platform: { type: "string" },
                        productId: { type: "string" },
                        skuId: { type: "string" },
                        name: { type: "string" }
                    },
                    required: ["platform", "productId", "skuId", "name"]
                }
            },
            targetCandidate: {
                type: "object",
                properties: {
                    platform: { type: "string" },
                    productId: { type: "string" },
                    skuId: { type: "string" },
                    name: { type: "string" }
                }
            }
          },
          required: ["action", "sourceName"]
        }
      },
      {
        name: "ecommerce_sync_multiplatform_stock",
        description: "Sync stock and prices across multiple platforms",
        inputSchema: {
          type: "object",
          properties: {
            sourcePlatform: { type: "string" },
            sourceProductName: { type: "string" },
            newStock: { type: "number" },
            newPrice: { type: "number" },
            targets: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        platform: { type: "string" },
                        productId: { type: "string" },
                        currentPrice: { type: "number" },
                        currentStock: { type: "number" },
                        availableVariants: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    platform: { type: "string" },
                                    productId: { type: "string" },
                                    skuId: { type: "string" },
                                    name: { type: "string" }
                                }
                            }
                        }
                    },
                    required: ["platform", "productId", "availableVariants"]
                }
            }
          },
          required: ["sourcePlatform", "sourceProductName", "targets"]
        }
      },
      {
        name: "ecommerce_visual_dom_analysis",
        description: "Capture viewport screenshots and bounding boxes for self-correction",
        inputSchema: {
          type: "object",
          properties: {
            simulate: { type: "boolean" }
          }
        }
      },
      {
        name: "ecommerce_autonomous_store_manager",
        description: "Background agent loop for autonomous store management (supports Phase 13 inventory watchdog via configure_watchdog)",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["start", "stop", "status", "trigger_now", "configure_watchdog"] },
            intervalMs: { type: "number" },
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
                  productId: { type: "string" },
                  currentStock: { type: "number" },
                  salesHistory: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        date: { type: "string", description: "YYYY-MM-DD" },
                        unitsSold: { type: "number" }
                      },
                      required: ["date", "unitsSold"]
                    }
                  }
                },
                required: ["productId", "currentStock", "salesHistory"]
              }
            },
            useSeasonality: { type: "boolean", default: false },
            leadTimeDays: { type: "number", default: 7 },
            targetCoverDays: { type: "number", default: 30 },
            autoCreatePo: { type: "boolean", default: true },
            notifyOnCritical: { type: "boolean", default: false },
            poNote: { type: "string" }
          },
          required: ["action"]
        }
      },
      {
        name: "ecommerce_clone_product",
        description: "Clone a product from a source URL to multiple target platforms",
        inputSchema: {
          type: "object",
          properties: {
            sourceUrl: { type: "string" },
            targetPlatforms: { type: "array", items: { type: "string" } },
            translationTemplate: { type: "string" }
          },
          required: ["sourceUrl", "targetPlatforms"]
        }
      },
      {
        name: "ecommerce_auto_reply_chat",
        description: "Fetch unread messages and auto-reply",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string" },
            action: { type: "string", enum: ["fetch_unread", "reply"] },
            messageId: { type: "string" },
            replyText: { type: "string" }
          },
          required: ["platform", "action"]
        }
      },
      {
        name: "ecommerce_get_pending_orders",
        description: "Query unfulfilled orders",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string" }
          },
          required: ["platform"]
        }
      },
      {
        name: "ecommerce_fulfill_order",
        description: "Trigger shipment arrangement",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string" },
            orderId: { type: "string" },
            trackingProvider: { type: "string" }
          },
          required: ["platform", "orderId"]
        }
      },
      {
        name: "ecommerce_manage_promotions",
        description: "Query and update store Flash Sales and voucher campaigns",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string" },
            action: { type: "string", enum: ["list", "create", "update"] },
            promoDetails: { type: "object", properties: { _dummy: { type: "string" } }, additionalProperties: true }
          },
          required: ["platform", "action"]
        }
      },
      {
        name: "ecommerce_sync_product_images",
        description: "Extract, re-format, and upload product gallery images across platforms",
        inputSchema: {
          type: "object",
          properties: {
            sourcePlatform: { type: "string" },
            targetPlatforms: { type: "array", items: { type: "string" } },
            productId: { type: "string" }
          },
          required: ["sourcePlatform", "targetPlatforms", "productId"]
        }
      },
      {
        name: "ecommerce_m365_copilot_bridge",
        description: "Bridge to Microsoft 365 Copilot Chat interface",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["attach_m365_tab", "send_prompt", "read_latest_response", "get_chat_history"] },
            prompt: { type: "string" }
          },
          required: ["action"]
        }
      },
      {
        name: "ecommerce_seo_optimizer",
        description: "Fast HTML DOM parsing and rewriting to generate entity-based JSON-LD schemas and optimize on-page SEO",
        inputSchema: {
          type: "object",
          properties: {
            htmlString: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            entityType: { type: "string", enum: ["Product", "Organization", "Article"] },
            entityData: {
              type: "object",
              properties: { _dummy: { type: "string" } },
              additionalProperties: true
            }
          },
          required: ["htmlString"]
        }
      },
      {
        name: "ecommerce_ow_lnwshop_safe_seo_updater",
        description: "Safe update for meta titles and keywords without disrupting live product layout.",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["lnwshop"] },
            productId: { type: "string" },
            metaTitle: { type: "string" },
            metaKeywords: {
              type: "array",
              items: {
                type: "string"
              }
            },
            metaDescription: { type: "string" }
          },
          required: ["platform", "productId"]
        }
      },
      {
        name: "ecommerce_google_ads_integration",
        description: "Integrate Google Ads Campaign Payload dispatcher and offline conversion tracking for platforms like CapsuleFill (lnwshop)",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
            action: { type: "string", enum: ["dispatch_campaign", "track_offline_conversion"] },
            campaignPayload: {
              type: "object",
              properties: {
                campaignId: { type: "string" },
                budget: { type: "number" },
                targetAudience: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            conversionData: {
              type: "object",
              properties: {
                transactionId: { type: "string" },
                conversionValue: { type: "number" },
                currencyCode: { type: "string" }
              }
            }
          },
          required: ["platform", "action"]
        }
      },
      {
        name: "ecommerce_predictive_inventory",
        description: "พยากรณ์สต็อกล่วงหน้าจากประวัติยอดขาย: คำนวณความเร็วขาย, วันที่สินค้าหมด, จุดสั่งซื้อ (Reorder Point) และจำนวนที่ควรสั่งซื้อเพิ่ม พร้อมลิสต์เรียงตามความเร่งด่วน (Smart Sourcing)",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["forecast", "bulk_forecast"] },
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
            productId: { type: "string" },
            currentStock: { type: "number" },
            leadTimeDays: { type: "number", default: 7 },
            targetCoverDays: { type: "number", default: 30 },
            serviceLevel: { type: "number", enum: [0.9, 0.95, 0.98, 0.99], default: 0.95 },
            today: { type: "string", description: "ISO date (YYYY-MM-DD) override for deterministic forecasts" },
            salesHistory: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string", description: "YYYY-MM-DD" },
                  unitsSold: { type: "number" }
                },
                required: ["date", "unitsSold"]
              }
            },
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
                  productId: { type: "string" },
                  currentStock: { type: "number" },
                  salesHistory: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        date: { type: "string", description: "YYYY-MM-DD" },
                        unitsSold: { type: "number" }
                      },
                      required: ["date", "unitsSold"]
                    }
                  }
                },
                required: ["productId", "currentStock", "salesHistory"]
              }
            }
          },
          required: ["action"]
        }
      },
      {
        name: "ecommerce_reorder_workflow",
        description: "จัดการ Purchase Order จากผลพยากรณ์สต็อก: สร้าง PO draft อัตโนมัติจากรายการ critical, ดูรายการ PO, และอัปเดตสถานะ (draft/ordered/received/cancelled)",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["create_po", "list_pos", "update_po_status"] },
            note: { type: "string" },
            status: { type: "string", enum: ["draft", "ordered", "received", "cancelled"] },
            poId: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
                  productId: { type: "string" },
                  qty: { type: "number" },
                  supplierName: { type: "string" },
                  supplierUrl: { type: "string" },
                  unitCost: { type: "number" }
                },
                required: ["productId", "qty"]
              }
            }
          },
          required: ["action"]
        }
      },
      {
        name: "ecommerce_send_notification",
        description: "ส่งการแจ้งเตือนถึงเจ้าของร้านผ่าน LINE Messaging API หรือ Telegram Bot (เตือนสินค้าใกล้หมด, คู่แข่งตัดราคา ฯลฯ) — ถ้าไม่ได้ตั้งค่า token จะทำงานแบบ dry-run (ไม่ส่งจริง)",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["send", "history"] },
            channel: { type: "string", enum: ["line", "telegram"] },
            message: { type: "string" },
            targetId: { type: "string", description: "LINE user/room id (optional, defaults to LINE_TARGET_ID env)" },
            chatId: { type: "string", description: "Telegram chat id (optional, defaults to TELEGRAM_CHAT_ID env)" },
            limit: { type: "number", default: 20 }
          },
          required: ["action"]
        }
      }
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "browser_attach_existing":
      return await handleBrowserAttachExisting(args);

    case "ecommerce_extract_session": {
      const platform = args?.platform;
      if (!platform) {
         return {
           isError: true,
           content: [{ type: "text", text: "กรุณาระบุ platform" }]
         };
      }

      const cdp = new CdpConnection();
      const extractor = new SessionExtractor(cdp);

      try {
         const session = await extractor.extractSession(platform as any);
         await cdp.disconnect();
         return {
           content: [
             {
               type: "text",
               text: JSON.stringify({
                 status: "success",
                 message: `ดึงข้อมูล Session สำหรับ ${platform} สำเร็จ`,
                 sessionSummary: {
                    platform: session?.platform,
                    hasCookies: (session?.cookies?.length || 0) > 0,
                    hasCsrfToken: !!session?.csrfToken,
                    hasAuthorization: !!session?.authorization
                 }
               }),
             },
           ],
         };
      } catch (error: any) {
         await cdp.disconnect();
         return {
            isError: true,
            content: [{ type: "text", text: JSON.stringify({ status: "error", message: error.message }) }]
         };
      }
    }

    case "ecommerce_product_search":
      return await handleEcommerceProductSearch(args);
    case "ecommerce_update_price_stock":
      return await handleEcommerceUpdatePriceStock(args);
    case "ecommerce_safety_guard":
      return await handleEcommerceSafetyGuard(args);

    case "browser_detect_challenge":
      return await handleBrowserDetectChallenge(args);
    case "ecommerce_get_store_metrics":
      return await handleEcommerceGetStoreMetrics(args);
    case "ecommerce_batch_update_price_stock":
      return await handleEcommerceBatchUpdatePriceStock(args);
    case "ecommerce_audit_log":
      return await handleEcommerceAuditLog(args);
    case "ecommerce_run_recipe":
      return await handleEcommerceRunRecipe(args);
    case "ecommerce_list_recipes":
      return await handleEcommerceListRecipes(args);
    case "ecommerce_save_custom_recipe":
      return await handleEcommerceSaveCustomRecipe(args);
    case "ecommerce_cached_selector_map":
      return await handleEcommerceCachedSelectorMap(args);
    case "ecommerce_context_compressor":
      return await handleEcommerceContextCompressor(args);
    case "ecommerce_local_sqlite_cache":
      return await handleEcommerceLocalSqliteCache(args);
    case "ecommerce_smart_diff_update":
      return await handleEcommerceSmartDiffUpdate(args);
    case "ecommerce_hybrid_executor":
      return await handleEcommerceHybridExecutor(args);
    case "ecommerce_token_telemetry":
      return await handleEcommerceTokenTelemetry(args);
    case "ecommerce_match_variants":
      return await handleEcommerceMatchVariants(args);
    case "ecommerce_sync_multiplatform_stock":
      return await handleEcommerceSyncMultiplatformStock(args);
    case "ecommerce_visual_dom_analysis":
      return await handleEcommerceVisualDomAnalysis(args);
    case "ecommerce_autonomous_store_manager":
      return await handleEcommerceAutonomousStoreManager(args);
    case "ecommerce_clone_product":
      return await handleEcommerceCloneProduct(args);
    case "ecommerce_auto_reply_chat":
      return await handleEcommerceAutoReplyChat(args);
    case "ecommerce_get_pending_orders":
      return await handleEcommerceGetPendingOrders(args);
    case "ecommerce_fulfill_order":
      return await handleEcommerceFulfillOrder(args);
    case "ecommerce_manage_promotions":
      return await handleEcommerceManagePromotions(args);
    case "ecommerce_sync_product_images":
      return await handleEcommerceSyncProductImages(args);
    case "ecommerce_m365_copilot_bridge":
      return await handleEcommerceM365CopilotBridge(args);
    case "ecommerce_seo_optimizer":
      return await handleEcommerceSeoOptimizer(args);
    case "ecommerce_ow_lnwshop_safe_seo_updater":
      return await handleEcommerceOwLnwshopSafeSeoUpdater(args);
    case "ecommerce_google_ads_integration":
      return await handleEcommerceGoogleAdsIntegration(args);
    case "ecommerce_predictive_inventory":
      return await handleEcommercePredictiveInventory(args);
    case "ecommerce_reorder_workflow":
      return await handleEcommerceReorderWorkflow(args);
    case "ecommerce_send_notification":
      return await handleEcommerceSendNotification(args);
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
