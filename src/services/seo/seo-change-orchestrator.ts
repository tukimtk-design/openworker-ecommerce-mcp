import { SeoPolicyGuard } from "./seo-policy-guard.js";
import crypto from "crypto";

export interface ChangeRequest {
  id: string;
  targetId: string; // Product or page ID
  beforeContent: string;
  afterContent: string;
  timestamp: number;
}

export interface ChangeResult {
  success: boolean;
  fingerprint?: string;
  reason?: string;
  rejectedKeywords?: string[];
}

export class SeoChangeOrchestrator {
  // targetId -> timestamp of last change
  private cooldownRegistry: Map<string, number> = new Map();
  private readonly COOLDOWN_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Prepares and hashes the before/after diff to create a unique fingerprint.
   * @param request The change request
   * @returns The fingerprint hash
   */
  public generateFingerprint(request: ChangeRequest): string {
    const diffContent = `BEFORE:${request.beforeContent}|AFTER:${request.afterContent}`;
    return crypto.createHash("sha256").update(diffContent).digest("hex");
  }

  /**
   * Orchestrates an SEO change, enforcing policy and cooldown validations.
   * @param request The change request
   * @returns The result of the change execution
   */
  public executeChange(request: ChangeRequest): ChangeResult {
    // 1. Cooldown Validation Enforcement
    const lastChangeTime = this.cooldownRegistry.get(request.targetId);
    if (lastChangeTime && (request.timestamp - lastChangeTime < this.COOLDOWN_PERIOD_MS)) {
      return {
        success: false,
        reason: "Cooldown period has not elapsed for this target."
      };
    }

    // 2. Strict SeoPolicyGuard.checkPolicy Validation
    const policyResult = SeoPolicyGuard.checkPolicy({ text: request.afterContent });
    if (!policyResult.isSafe) {
      return {
        success: false,
        reason: policyResult.reason || "Policy validation failed.",
        rejectedKeywords: policyResult.rejectedKeywords
      };
    }

    // 3. Exact before/after diff preparation & fingerprint hashing
    const fingerprint = this.generateFingerprint(request);

    // 4. Update Cooldown Registry (Mock Execution)
    this.cooldownRegistry.set(request.targetId, request.timestamp);

    return {
      success: true,
      fingerprint,
      reason: "Change successfully orchestrated."
    };
  }

  public resetCooldowns(): void {
      this.cooldownRegistry.clear();
  }
}
