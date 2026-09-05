import assert from "node:assert";
import test, { describe, it } from "node:test";
import { SeoControlTower } from "../services/seo/seo-control-tower.js";
import { SeoChangeOrchestrator, ChangeRequest } from "../services/seo/seo-change-orchestrator.js";

describe("Phase 23: SEO Control Tower & Change Orchestrator", () => {

  describe("SeoControlTower", () => {
    it("should correctly detect delta and semantic changes", () => {
      const tower = new SeoControlTower();
      
      const obs1 = {
        id: "kw-001",
        keyword: "test keyword",
        rank: 10,
        clicks: 100,
        impressions: 1000,
        semanticSignature: "sig-A",
        timestamp: "2023-10-01T00:00:00Z"
      };

      const delta1 = tower.recordObservation(obs1);
      assert.strictEqual(delta1.semanticChange, true); // First time
      assert.strictEqual(tower.llmCallCount, 1);
      
      const obs2 = {
        ...obs1,
        rank: 8,
        clicks: 110,
        semanticSignature: "sig-A", // Same signature
        timestamp: "2023-10-02T00:00:00Z"
      };

      const delta2 = tower.recordObservation(obs2);
      assert.strictEqual(delta2.semanticChange, false);
      assert.strictEqual(delta2.rankDelta, 2); // 10 - 8 = 2 (improved)
      assert.strictEqual(delta2.clicksDelta, 10);
      assert.strictEqual(tower.llmCallCount, 1); // Not incremented

      const obs3 = {
        ...obs1,
        semanticSignature: "sig-B", // Changed signature
        timestamp: "2023-10-03T00:00:00Z"
      };
      
      const delta3 = tower.recordObservation(obs3);
      assert.strictEqual(delta3.semanticChange, true);
      assert.strictEqual(tower.llmCallCount, 2); // Incremented
    });

    it("should limit the daily decision basket to 3-5 recommendations", () => {
        const tower = new SeoControlTower();
        const recs = [
            { id: "1", action: "A", keyword: "K1", expectedImpact: "High" },
            { id: "2", action: "B", keyword: "K2", expectedImpact: "High" },
            { id: "3", action: "C", keyword: "K3", expectedImpact: "Medium" },
            { id: "4", action: "D", keyword: "K4", expectedImpact: "Medium" },
            { id: "5", action: "E", keyword: "K5", expectedImpact: "Low" },
            { id: "6", action: "F", keyword: "K6", expectedImpact: "Low" },
        ];

        const basket5 = tower.generateDailyDecisionBasket(recs);
        assert.strictEqual(basket5.length, 5);

        const basket3 = tower.generateDailyDecisionBasket(recs, 2);
        assert.strictEqual(basket3.length, 3); // Enforce min 3

        const basketMax = tower.generateDailyDecisionBasket(recs, 10);
        assert.strictEqual(basketMax.length, 5); // Enforce max 5
        
        const shortRecs = recs.slice(0, 2);
        const basketShort = tower.generateDailyDecisionBasket(shortRecs);
        assert.strictEqual(basketShort.length, 2); // Should not pad if there are fewer than 3
    });
  });

  describe("SeoChangeOrchestrator", () => {
    it("should enforce cooldown validation", () => {
      const orchestrator = new SeoChangeOrchestrator();
      const now = Date.now();
      
      const request1: ChangeRequest = {
        id: "req-001",
        targetId: "prod-001",
        beforeContent: "Hello",
        afterContent: "Hello World",
        timestamp: now
      };

      const result1 = orchestrator.executeChange(request1);
      assert.strictEqual(result1.success, true);
      
      const request2: ChangeRequest = {
        ...request1,
        id: "req-002",
        afterContent: "Hello World Again",
        timestamp: now + 1000 * 60 * 60 // 1 hour later
      };

      const result2 = orchestrator.executeChange(request2);
      assert.strictEqual(result2.success, false);
      assert.strictEqual(result2.reason, "Cooldown period has not elapsed for this target.");
    });

    it("should enforce SeoPolicyGuard negative keywords", () => {
        const orchestrator = new SeoChangeOrchestrator();
        const now = Date.now();
        
        const request: ChangeRequest = {
          id: "req-003",
          targetId: "prod-002",
          beforeContent: "Safe content",
          afterContent: "มี อย. รับประกัน",
          timestamp: now
        };
  
        const result = orchestrator.executeChange(request);
        assert.strictEqual(result.success, false);
        assert.ok(result.rejectedKeywords?.includes("อย."));
    });

    it("should successfully orchestrate valid changes and generate fingerprint", () => {
        const orchestrator = new SeoChangeOrchestrator();
        const now = Date.now();
        
        const request: ChangeRequest = {
          id: "req-004",
          targetId: "prod-003",
          beforeContent: "Old title",
          afterContent: "New optimized title",
          timestamp: now
        };
  
        const result = orchestrator.executeChange(request);
        assert.strictEqual(result.success, true);
        assert.ok(result.fingerprint);
    });
  });

});
