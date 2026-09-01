import { handleEcommerceM365CopilotBridge } from "./tools/m365-copilot-bridge.js";
import { handleEcommerceSeoOptimizer } from "./tools/seo-optimizer.js";
import { handleEcommerceOwLnwshopSafeSeoUpdater } from "./tools/lnwshop-seo-updater.js";
import { handleEcommerceGoogleAdsIntegration } from "./tools/google-ads-integration.js";
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
import { handleEcommerceMarketHunter } from "./tools/market-hunter.js";
import { handleEcommerceDynamicPricing } from "./tools/dynamic-pricing.js";
import { handleEcommerceCampaignParticipation } from "./tools/campaign-participation.js";
import { handleEcommerceProfitLedger } from "./tools/profit-ledger.js";
import { handleEcommerceAutonomyControl } from "./tools/autonomy-control.js";
import { handleEcommerceMarketSensors } from "./tools/market-sensors.js";
import { handleEcommerceRepricerDaemon } from "./tools/repricer-tool.js";
import { handleEcommerceCognitionRouter } from "./tools/cognition-tool.js";
import { handleEcommerceReviewMiner } from "./tools/review-miner-tool.js";
import { handleEcommerceActuatorRouter } from "./tools/actuator-tool.js";
import { handleEcommerceSupplierBridge } from "./tools/supplier-tool.js";
import { handleEcommerceListingAbTest } from "./tools/ab-test-tool.js";
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
        name: "ecommerce_repricer_daemon",
        description: "Phase 14: Autonomous Repricer Daemon with margin floor & anti-oscillation safeguards",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["evaluate_and_reprice", "set_sku_rule"] },
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
            skuId: { type: "string" },
            currentPrice: { type: "number" },
            competitorPrice: { type: "number" },
            strategy: { type: "string", enum: ["UNDERCUT_COMPETITOR", "MATCH_COMPETITOR", "TARGET_MARGIN"] },
            undercutAmount: { type: "number" },
            targetMarginPercent: { type: "number" },
            maxUpdatesPerDay: { type: "number" }
          },
          required: ["action"]
        }
      },
      {
        name: "ecommerce_cognition_router",
        description: "Phase 14: Tiered Cognition Router to classify requests and minimize LLM token costs",
        inputSchema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            payload: {
              type: "object",
              properties: {
                metadata: { type: "string" }
              }
            }
          },
          required: ["intent"]
        }
      },
      {
        name: "ecommerce_review_miner",
        description: "Phase 14: Competitor Review Pain-Point Miner & Listing USP generator",
        inputSchema: {
          type: "object",
          properties: {
            reviews: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  rating: { type: "number" },
                  comment: { type: "string" }
                },
                required: ["rating", "comment"]
              }
            }
          },
          required: ["reviews"]
        }
      },
      {
        name: "ecommerce_market_sensors",
        description: "Phase 13: Market Sensor Mesh - Competitor Diff, Sales Velocity Estimation, and Trend Radar",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["diff_competitor", "velocity_estimate", "trend_radar"] },
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
            skuId: { type: "string" },
            competitorId: { type: "string" },
            title: { type: "string" },
            price: { type: "number" },
            stock: { type: "number" },
            soldCount: { type: "number" },
            rating: { type: "number" },
            category: { type: "string" }
          },
          required: ["action"]
        }
      },
      {
        name: "ecommerce_profit_ledger",
        description: "Phase 12: Profit Ledger & COGS Net Margin calculation engine with hardcoded margin floors",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["set_cogs", "compute_net_margin", "get_ledger"] },
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
            productId: { type: "string" },
            skuId: { type: "string" },
            cogs: { type: "number" },
            inboundShipping: { type: "number" },
            packagingCost: { type: "number" },
            minMarginPercent: { type: "number" },
            proposedPrice: { type: "number" },
            platformFeeRate: { type: "number" },
            shippingBurden: { type: "number" },
            adSpendPerUnit: { type: "number" }
          },
          required: ["action"]
        }
      },
      {
        name: "ecommerce_autonomy_control",
        description: "Phase 12: Autonomous governor, kill-switch, and dry-run mandate manager",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["get_status", "set_mandate", "kill_switch", "set_dry_run"] },
            maxPriceChangePercent: { type: "number" },
            dailyAdBudgetCap: { type: "number" },
            maxSkusPerBatch: { type: "number" },
            activate: { type: "boolean" },
            dryRun: { type: "boolean" }
          },
          required: ["action"]
        }
      },
      {
        name: "ecommerce_market_hunter",
        description: "Autonomous Market Opportunity Hunter - detects arbitrage and trending viral products.",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
            keyword: { type: "string" },
            minMarginPercent: { type: "number", default: 15 }
          },
          required: ["platform"]
        },
      },
      {
        name: "ecommerce_dynamic_margin_optimization",
        description: "Dynamic Pricing - auto-calculates and executes margin optimization against competitors.",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
            productId: { type: "string" },
            rule: { type: "string" }
          },
          required: ["platform", "productId", "rule"]
        },
      },
      {
        name: "ecommerce_campaign_participation",
        description: "Auto-enroll products into Flash Sales and store campaigns to maximize ROI.",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["shopee", "tiktok", "lazada", "lnwshop"] },
            campaignId: { type: "string" },
            products: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["platform", "campaignId"]
        }
      },
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
            minPriceFloor: { type: "number", default: 50 }
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
        description: "Background agent loop for autonomous store management",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["start", "stop", "status", "trigger_now"] },
            intervalMs: { type: "number" }
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
        name: "ecommerce_actuator_router",
        description: "Hybrid API Actuator Router for switching between Official Open API, Internal Session XHR, and Headless CDP fallback with circuit breaker",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["SHOPEE", "TIKTOK_SHOP", "LAZADA", "LNWSHOP"] },
            action: { type: "string", enum: ["UPDATE_PRICE", "UPDATE_STOCK", "PUBLISH_PRODUCT", "FETCH_ORDERS"] },
            payload: {
              type: "object",
              properties: {
                hasApiKey: { type: "boolean" },
                price: { type: "number" },
                stock: { type: "number" },
                sku: { type: "string" }
              }
            },
            availableChannels: {
              type: "array",
              items: { type: "string", enum: ["OFFICIAL_OPEN_API", "INTERNAL_XHR_SESSION", "HEADLESS_CDP_FALLBACK"] }
            },
            dryRun: { type: "boolean" }
          },
          required: ["platform", "action"]
        }
      },
      {
        name: "ecommerce_supplier_bridge",
        description: "Cross-Border Supplier Arbitrage Bridge for 1688, Taobao, and AliExpress with landed cost calculations and margin ranking",
        inputSchema: {
          type: "object",
          properties: {
            domesticSku: { type: "string" },
            domesticTitle: { type: "string" },
            domesticSellingPrice: { type: "number" },
            targetNetMarginPercent: { type: "number" },
            suppliers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  supplierPlatform: { type: "string", enum: ["1688", "TAOBAO", "ALIEXPRESS"] },
                  supplierProductId: { type: "string" },
                  supplierTitle: { type: "string" },
                  sourceCurrency: { type: "string", enum: ["CNY", "USD"] },
                  sourcePrice: { type: "number" },
                  estimatedFreightThb: { type: "number" },
                  importTaxRate: { type: "number" },
                  cnyToThbRate: { type: "number" },
                  moq: { type: "number" },
                  supplierRating: { type: "number" }
                },
                required: ["supplierPlatform", "supplierProductId", "sourcePrice", "sourceCurrency"]
              }
            }
          },
          required: ["domesticSku", "domesticSellingPrice", "suppliers"]
        }
      },
      {
        name: "ecommerce_listing_ab_test",
        description: "Automated Listing A/B Testing Engine for titles and cover images with Revenue Per Impression (RPI) attribution",
        inputSchema: {
          type: "object",
          properties: {
            experimentId: { type: "string" },
            productId: { type: "string" },
            minImpressionsPerVariant: { type: "number" },
            variants: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  variantId: { type: "string" },
                  title: { type: "string" },
                  coverImageUrl: { type: "string" },
                  impressions: { type: "number" },
                  clicks: { type: "number" },
                  orders: { type: "number" },
                  revenueThb: { type: "number" }
                },
                required: ["variantId", "title", "impressions", "clicks", "orders", "revenueThb"]
              }
            }
          },
          required: ["experimentId", "productId", "variants"]
        }
      }
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "ecommerce_actuator_router":
      return await handleEcommerceActuatorRouter(args);
    case "ecommerce_supplier_bridge":
      return await handleEcommerceSupplierBridge(args);
    case "ecommerce_listing_ab_test":
      return await handleEcommerceListingAbTest(args);
    case "ecommerce_repricer_daemon":
      return await handleEcommerceRepricerDaemon(args);
    case "ecommerce_cognition_router":
      return await handleEcommerceCognitionRouter(args);
    case "ecommerce_review_miner":
      return await handleEcommerceReviewMiner(args);
    case "ecommerce_market_sensors":
      return await handleEcommerceMarketSensors(args);
    case "ecommerce_profit_ledger":
      return await handleEcommerceProfitLedger(args);
    case "ecommerce_autonomy_control":
      return await handleEcommerceAutonomyControl(args);
    case "ecommerce_market_hunter":
      return await handleEcommerceMarketHunter(args);
    case "ecommerce_dynamic_margin_optimization":
      return await handleEcommerceDynamicPricing(args);
    case "ecommerce_campaign_participation":
      return await handleEcommerceCampaignParticipation(args);
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
