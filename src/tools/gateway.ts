import { handleEcommerceM365CopilotBridge } from "./m365-copilot-bridge.js";
import { handleEcommerceSeoOptimizer } from "./seo-optimizer.js";
import { handleEcommerceOwLnwshopSafeSeoUpdater } from "./lnwshop-seo-updater.js";
import { handleEcommerceSeoContentEnricher } from "./seo-content-enricher-tool.js";
import { handleEcommerceSiteAuditCrawler } from "./site-audit-crawler-tool.js";
import { handleEcommerceLiveSerpScraper } from "./live-serp-scraper-tool.js";
import { handleEcommerceLnwshopCdpActuator } from "./lnwshop-cdp-actuator-tool.js";
import { handleEcommerceOutboundSeoPublisher } from "./outbound-seo-tool.js";
import { handleEcommerceGoogleAdsIntegration } from "./google-ads-integration.js";
import { handleEcommerceAutonomousStoreManager } from "./store-agent-tool.js";
import { handleEcommerceCloneProduct } from "./product-cloner.js";
import { handleEcommerceAutoReplyChat } from "./chat-automation.js";
import { handleEcommerceGetPendingOrders, handleEcommerceFulfillOrder } from "./order-fulfillment.js";
import { handleEcommerceManagePromotions } from "./promotion-manager.js";
import { handleEcommerceSyncProductImages } from "./asset-sync.js";
import { handleEcommerceVisualDomAnalysis } from "./visual-analysis.js";
import { handleEcommerceMatchVariants } from "./variant-matcher.js";
import { handleEcommerceSyncMultiplatformStock } from "./multiplatform-sync.js";
import { handleEcommerceContextCompressor } from "./compressor.js";
import { handleEcommerceLocalSqliteCache } from "./local-cache.js";
import { handleEcommerceSmartDiffUpdate } from "./diff-update.js";
import { handleEcommerceHybridExecutor } from "./hybrid-executor-tool.js";
import { handleEcommerceTokenTelemetry } from "./telemetry.js";
import { handleEcommerceRunRecipe, handleEcommerceListRecipes, handleEcommerceSaveCustomRecipe } from "./ecommerce-recipe.js";
import { handleEcommerceCachedSelectorMap } from "./ecommerce-selectors.js";
import { handleBrowserDetectChallenge } from "./browser-challenge.js";
import { handleEcommerceGetStoreMetrics } from "./store-metrics.js";
import { handleEcommerceBatchUpdatePriceStock } from "./batch-update.js";
import { handleEcommerceAuditLog } from "./audit-log.js";
import { handleEcommerceProductSearch } from "./ecommerce-search.js";
import { handleEcommerceUpdatePriceStock } from "./ecommerce-update.js";
import { handleEcommerceSafetyGuard } from "./safety-guard.js";
import { SessionExtractor } from "../services/session-extractor.js";
import { CdpConnection } from "../services/cdp-connection.js";
import { handleBrowserAttachExisting } from "./browser-profile.js";
import { handleEcommerceMarketHunter } from "./market-hunter.js";
import { handleEcommerceDynamicPricing } from "./dynamic-pricing.js";
import { handleEcommerceCampaignParticipation } from "./campaign-participation.js";
import { handleEcommerceProfitLedger } from "./profit-ledger.js";
import { handleEcommerceAutonomyControl } from "./autonomy-control.js";
import { handleEcommerceMarketSensors } from "./market-sensors.js";
import { handleEcommerceRepricerDaemon } from "./repricer-tool.js";
import { handleEcommerceCognitionRouter } from "./cognition-tool.js";
import { handleEcommerceReviewMiner } from "./review-miner-tool.js";
import { handleEcommerceActuatorRouter } from "./actuator-tool.js";
import { handleEcommerceSupplierBridge } from "./supplier-tool.js";
import { handleEcommerceListingAbTest } from "./ab-test-tool.js";
import { handleEcommerceSerpRankTracker } from "./serp-rank-tracker-tool.js";

export interface ActionDefinition {
  action: string;
  category: string;
  description: string;
  handler: (args: any) => Promise<any>;
}

export const ACTION_REGISTRY: Record<string, ActionDefinition> = {
  list_actions: {
    action: "list_actions",
    category: "system",
    description: "List all available actions with descriptions and categories",
    handler: async () => {
      const actions = Object.values(ACTION_REGISTRY).map(a => ({
        action: a.action,
        category: a.category,
        description: a.description
      }));
      return {
        content: [{ type: "text", text: JSON.stringify({ actions }, null, 2) }]
      };
    }
  },
  // Phase 16 Tools
  serp_rank_tracker: {
    action: "serp_rank_tracker",
    category: "seo",
    description: "Track Google SERP rank and striking distance keywords",
    handler: handleEcommerceSerpRankTracker
  },
  seo_content_enricher: {
    action: "seo_content_enricher",
    category: "seo",
    description: "Enrich product content with SEO keywords and reject negative words",
    handler: handleEcommerceSeoContentEnricher
  },
  site_audit_crawler: {
    action: "site_audit_crawler",
    category: "seo",
    description: "Audit site DOM, schema markup, and metadata",
    handler: handleEcommerceSiteAuditCrawler
  },
  live_serp_scraper: {
    action: "live_serp_scraper",
    category: "seo",
    description: "Scrape live Google SERP with negative keyword filtering",
    handler: handleEcommerceLiveSerpScraper
  },
  lnwshop_cdp_actuator: {
    action: "lnwshop_cdp_actuator",
    category: "actuator",
    description: "Update LnwShop product SEO metadata via CDP Headless browser",
    handler: handleEcommerceLnwshopCdpActuator
  },
  lnwshop_safe_seo_updater: {
    action: "lnwshop_safe_seo_updater",
    category: "seo",
    description: "Safely update LnwShop SEO meta title/description/keywords",
    handler: handleEcommerceOwLnwshopSafeSeoUpdater
  },
  outbound_seo_publisher: {
    action: "outbound_seo_publisher",
    category: "seo",
    description: "Generate safe contextual outbound articles with backlink anchoring",
    handler: handleEcommerceOutboundSeoPublisher
  },
  seo_optimizer: {
    action: "seo_optimizer",
    category: "seo",
    description: "Optimize e-commerce product SEO metadata",
    handler: handleEcommerceSeoOptimizer
  },
  // Phase 15 Tools
  actuator_router: {
    action: "actuator_router",
    category: "actuator",
    description: "Route actions dynamically via API, XHR, or CDP",
    handler: handleEcommerceActuatorRouter
  },
  supplier_bridge: {
    action: "supplier_bridge",
    category: "supplier",
    description: "Calculate landed costs and arbitrage margin from suppliers (e.g. 1688)",
    handler: handleEcommerceSupplierBridge
  },
  listing_ab_test: {
    action: "listing_ab_test",
    category: "marketing",
    description: "Run listing A/B test and calculate revenue per impression (RPI)",
    handler: handleEcommerceListingAbTest
  },
  // Phase 14 Tools
  repricer_daemon: {
    action: "repricer_daemon",
    category: "pricing",
    description: "Evaluate and reprice products automatically based on competitor pricing",
    handler: handleEcommerceRepricerDaemon
  },
  cognition_router: {
    action: "cognition_router",
    category: "ai",
    description: "Classify incoming intent to optimize LLM execution tier",
    handler: handleEcommerceCognitionRouter
  },
  review_miner: {
    action: "review_miner",
    category: "analytics",
    description: "Mine competitor reviews for pain points and extract USP counter-points",
    handler: handleEcommerceReviewMiner
  },
  // Phase 13 Tools
  market_sensors: {
    action: "market_sensors",
    category: "analytics",
    description: "Market sensor mesh for diffing competitors and estimating sales velocity",
    handler: handleEcommerceMarketSensors
  },
  // Phase 12 Tools
  profit_ledger: {
    action: "profit_ledger",
    category: "finance",
    description: "Manage COGS, calculate net margin, and enforce floor margin",
    handler: handleEcommerceProfitLedger
  },
  autonomy_control: {
    action: "autonomy_control",
    category: "autonomy",
    description: "Manage autonomy mandates, kill switches, and dry run state",
    handler: handleEcommerceAutonomyControl
  },
  // Phase 10 & Core Store Tools
  autonomous_store_manager: {
    action: "autonomous_store_manager",
    category: "autonomy",
    description: "Manage autonomous store loops",
    handler: handleEcommerceAutonomousStoreManager
  },
  clone_product: {
    action: "clone_product",
    category: "catalog",
    description: "Clone products across e-commerce platforms",
    handler: handleEcommerceCloneProduct
  },
  auto_reply_chat: {
    action: "auto_reply_chat",
    category: "customer_service",
    description: "Automate chat responses across platforms",
    handler: handleEcommerceAutoReplyChat
  },
  get_pending_orders: {
    action: "get_pending_orders",
    category: "orders",
    description: "Retrieve pending store orders",
    handler: handleEcommerceGetPendingOrders
  },
  fulfill_order: {
    action: "fulfill_order",
    category: "orders",
    description: "Mark and fulfill orders",
    handler: handleEcommerceFulfillOrder
  },
  manage_promotions: {
    action: "manage_promotions",
    category: "marketing",
    description: "Create or update discount promotions",
    handler: handleEcommerceManagePromotions
  },
  sync_product_images: {
    action: "sync_product_images",
    category: "catalog",
    description: "Synchronize product images across platforms",
    handler: handleEcommerceSyncProductImages
  },
  product_search: {
    action: "product_search",
    category: "catalog",
    description: "Search products in store catalog",
    handler: handleEcommerceProductSearch
  },
  update_price_stock: {
    action: "update_price_stock",
    category: "catalog",
    description: "Update product price and stock",
    handler: handleEcommerceUpdatePriceStock
  },
  batch_update_price_stock: {
    action: "batch_update_price_stock",
    category: "catalog",
    description: "Batch update product prices and stocks",
    handler: handleEcommerceBatchUpdatePriceStock
  },
  safety_guard: {
    action: "safety_guard",
    category: "safety",
    description: "Validate price updates against maximum drop thresholds",
    handler: handleEcommerceSafetyGuard
  },
  sync_multiplatform_stock: {
    action: "sync_multiplatform_stock",
    category: "catalog",
    description: "Sync stock levels across multi-channels",
    handler: handleEcommerceSyncMultiplatformStock
  },
  store_metrics: {
    action: "store_metrics",
    category: "analytics",
    description: "Get performance metrics for store platforms",
    handler: handleEcommerceGetStoreMetrics
  },
  google_ads_integration: {
    action: "google_ads_integration",
    category: "marketing",
    description: "Dispatch Google Ads campaigns and offline conversions",
    handler: handleEcommerceGoogleAdsIntegration
  },
  market_hunter: {
    action: "market_hunter",
    category: "analytics",
    description: "Hunt winning product opportunities",
    handler: handleEcommerceMarketHunter
  },
  dynamic_margin_optimization: {
    action: "dynamic_margin_optimization",
    category: "pricing",
    description: "Dynamically optimize margins",
    handler: handleEcommerceDynamicPricing
  },
  campaign_participation: {
    action: "campaign_participation",
    category: "marketing",
    description: "Manage platform campaign enrollment",
    handler: handleEcommerceCampaignParticipation
  },
  // Utilities & Infrastructure
  m365_copilot_bridge: {
    action: "m365_copilot_bridge",
    category: "bridge",
    description: "Bridge communication with Microsoft 365 Copilot",
    handler: handleEcommerceM365CopilotBridge
  },
  visual_dom_analysis: {
    action: "visual_dom_analysis",
    category: "browser",
    description: "Analyze web DOM visually for e-commerce sites",
    handler: handleEcommerceVisualDomAnalysis
  },
  match_variants: {
    action: "match_variants",
    category: "catalog",
    description: "Fuzzy match product variants",
    handler: handleEcommerceMatchVariants
  },
  context_compressor: {
    action: "context_compressor",
    category: "utility",
    description: "Compress DOM and text context",
    handler: handleEcommerceContextCompressor
  },
  local_sqlite_cache: {
    action: "local_sqlite_cache",
    category: "utility",
    description: "Cache e-commerce key-value state locally",
    handler: handleEcommerceLocalSqliteCache
  },
  smart_diff_update: {
    action: "smart_diff_update",
    category: "utility",
    description: "Compute delta updates",
    handler: handleEcommerceSmartDiffUpdate
  },
  hybrid_executor: {
    action: "hybrid_executor",
    category: "utility",
    description: "Execute hybrid tasks",
    handler: handleEcommerceHybridExecutor
  },
  token_telemetry: {
    action: "token_telemetry",
    category: "utility",
    description: "Track token telemetry and usage",
    handler: handleEcommerceTokenTelemetry
  },
  run_recipe: {
    action: "run_recipe",
    category: "automation",
    description: "Run automated e-commerce recipe",
    handler: handleEcommerceRunRecipe
  },
  list_recipes: {
    action: "list_recipes",
    category: "automation",
    description: "List available recipes",
    handler: handleEcommerceListRecipes
  },
  save_custom_recipe: {
    action: "save_custom_recipe",
    category: "automation",
    description: "Save custom e-commerce recipe",
    handler: handleEcommerceSaveCustomRecipe
  },
  cached_selector_map: {
    action: "cached_selector_map",
    category: "browser",
    description: "Manage cached DOM selector mappings",
    handler: handleEcommerceCachedSelectorMap
  },
  browser_detect_challenge: {
    action: "browser_detect_challenge",
    category: "browser",
    description: "Detect browser CAPTCHA/challenge state",
    handler: handleBrowserDetectChallenge
  },
  browser_attach_existing: {
    action: "browser_attach_existing",
    category: "browser",
    description: "Attach to existing browser CDP session",
    handler: handleBrowserAttachExisting
  },
  audit_log: {
    action: "audit_log",
    category: "utility",
    description: "Record and inspect audit logs",
    handler: handleEcommerceAuditLog
  },
  extract_session: {
    action: "extract_session",
    category: "browser",
    description: "Extract platform session tokens/cookies via CDP",
    handler: async (args: any) => {
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
              })
            }
          ]
        };
      } catch (error: any) {
        await cdp.disconnect();
        return {
          isError: true,
          content: [{ type: "text", text: JSON.stringify({ status: "error", message: error.message }) }]
        };
      }
    }
  }
};

export const ECOMMERCE_OPS_SCHEMA = {
  name: "ecommerce_ops",
  description: "Adaptive Gateway for Openworker E-Commerce operations. Use action 'list_actions' to discover all available operations with short descriptions, or provide action and params to execute.",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        description: "The specific e-commerce operation to execute (e.g. 'list_actions', 'product_search', 'update_price_stock', 'serp_rank_tracker', 'actuator_router')"
      },
      params: {
        type: "object",
        properties: {
          _dummy: { type: "string" }
        },
        required: [],
        description: "JSON arguments specific to the requested operation"
      }
    },
    required: ["action"]
  }
};

export async function handleEcommerceOps(args: any) {
  const { action, params } = args || {};
  if (!action) {
    return {
      isError: true,
      content: [{ type: "text", text: "Error: Missing required parameter 'action'. Use 'list_actions' to view available operations." }]
    };
  }

  const targetAction = ACTION_REGISTRY[action];
  if (!targetAction) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error: Unknown action '${action}'. Available actions: ${Object.keys(ACTION_REGISTRY).join(", ")}` }]
    };
  }

  return await targetAction.handler(params || args);
}
