import test from "node:test";
import assert from "node:assert";
import { SerpRankTrackerService, RankBand } from "../services/seo/serp-rank-tracker.js";
import { handleEcommerceSerpRankTracker } from "../tools/serp-rank-tracker-tool.js";

test("SERP Rank Tracker Service Classifications", () => {
  // Test NOT_OBSERVED
  assert.strictEqual(SerpRankTrackerService.classifyRankBand(null), "NOT_OBSERVED");
  assert.strictEqual(SerpRankTrackerService.classifyRankBand(0), "NOT_OBSERVED");
  assert.strictEqual(SerpRankTrackerService.classifyRankBand(-5), "NOT_OBSERVED");
  assert.strictEqual(SerpRankTrackerService.classifyRankBand(31), "NOT_OBSERVED");
  assert.strictEqual(SerpRankTrackerService.classifyRankBand(100), "NOT_OBSERVED");

  // Test TOP_FIVE
  assert.strictEqual(SerpRankTrackerService.classifyRankBand(1), "TOP_FIVE");
  assert.strictEqual(SerpRankTrackerService.classifyRankBand(3), "TOP_FIVE");
  assert.strictEqual(SerpRankTrackerService.classifyRankBand(5), "TOP_FIVE");

  // Test STRIKING_DISTANCE
  assert.strictEqual(SerpRankTrackerService.classifyRankBand(6), "STRIKING_DISTANCE");
  assert.strictEqual(SerpRankTrackerService.classifyRankBand(12), "STRIKING_DISTANCE");
  assert.strictEqual(SerpRankTrackerService.classifyRankBand(18), "STRIKING_DISTANCE");

  // Test DISCOVERY_RANGE
  assert.strictEqual(SerpRankTrackerService.classifyRankBand(19), "DISCOVERY_RANGE");
  assert.strictEqual(SerpRankTrackerService.classifyRankBand(25), "DISCOVERY_RANGE");
  assert.strictEqual(SerpRankTrackerService.classifyRankBand(30), "DISCOVERY_RANGE");
});

test("SERP Rank Tracker Tool Handler", async () => {
  const result = await handleEcommerceSerpRankTracker({
    items: [
      { keyword: "shoes", url: "https://example.com/shoes", position: 3 },
      { keyword: "boots", url: "https://example.com/boots", position: 10 },
      { keyword: "sandals", url: "https://example.com/sandals", position: 20 },
      { keyword: "socks", url: "https://example.com/socks", position: null },
      { keyword: "hats", url: "https://example.com/hats", position: 50 },
    ],
  });

  const parsed = JSON.parse(result.content[0].text);
  assert.strictEqual(parsed.success, true);
  
  const data = parsed.data;
  assert.strictEqual(data.length, 5);

  assert.strictEqual(data[0].rankBand, "TOP_FIVE");
  assert.strictEqual(data[1].rankBand, "STRIKING_DISTANCE");
  assert.strictEqual(data[2].rankBand, "DISCOVERY_RANGE");
  assert.strictEqual(data[3].rankBand, "NOT_OBSERVED");
  assert.strictEqual(data[4].rankBand, "NOT_OBSERVED");
});

test("SERP Rank Tracker Tool Handler - Invalid Argument", async () => {
  const result = await handleEcommerceSerpRankTracker({});
  const parsed = JSON.parse(result.content[0].text);
  assert.strictEqual(parsed.success, false);
  assert.ok(parsed.error.includes("Missing required argument"));
});
