export type CognitionTier = "T0_DETERMINISTIC" | "T1_LOCAL_CACHE" | "T2_LOCAL_SLM" | "T3_FRONTIER_LLM";

export interface TaskClassification {
  taskType: string;
  recommendedTier: CognitionTier;
  estimatedTokens: number;
  rationale: string;
  executionHandler: string;
}

export class CognitionRouter {
  /**
   * Classifies an incoming automation request into the lowest-cost execution tier.
   */
  classifyTask(intent: string, payload: any): TaskClassification {
    const norm = (intent || "").toLowerCase();

    // 1. T0 Tier: Repricing, Margin Check, Stock Sync, Diff Update, Regex Extraction (~85%)
    if (
      norm.includes("reprice") ||
      norm.includes("margin") ||
      norm.includes("sync_stock") ||
      norm.includes("diff") ||
      norm.includes("compress") ||
      norm.includes("safety_guard")
    ) {
      return {
        taskType: intent,
        recommendedTier: "T0_DETERMINISTIC",
        estimatedTokens: 0,
        rationale: "Deterministic arithmetic, rule engine, or SQL operation. Zero LLM token consumption.",
        executionHandler: "Local MCP Tool (Rule Engine / SQLite)"
      };
    }

    // 2. T1 Tier: Cached Selector lookup, Exact FAQ / Chat lookup (~8%)
    if (norm.includes("selector") || norm.includes("cached_faq") || norm.includes("lookup")) {
      return {
        taskType: intent,
        recommendedTier: "T1_LOCAL_CACHE",
        estimatedTokens: 0,
        rationale: "Retrieved directly from SQLite local cache or Vector memory. Zero LLM token consumption.",
        executionHandler: "SqliteStore Cache Hit"
      };
    }

    // 3. T2 Tier: Standard customer reply draft, title variation template (~5%)
    if (norm.includes("chat_reply") || norm.includes("template_draft") || norm.includes("seo_keywords")) {
      return {
        taskType: intent,
        recommendedTier: "T2_LOCAL_SLM",
        estimatedTokens: 50,
        rationale: "Routine content generation handled by local lightweight SLM (Ollama) without frontier model API cost.",
        executionHandler: "Local SLM Worker"
      };
    }

    // 4. T3 Tier: Complex anomaly, Policy change approval, Novel dispute (~2%)
    return {
      taskType: intent,
      recommendedTier: "T3_FRONTIER_LLM",
      estimatedTokens: 800,
      rationale: "High-level strategic ambiguity or unhandled policy conflict requiring frontier model reasoning.",
      executionHandler: "Frontier LLM (Claude / GPT / Gemini)"
    };
  }
}
