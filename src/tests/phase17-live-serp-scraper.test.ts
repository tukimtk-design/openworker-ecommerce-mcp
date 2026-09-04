import test from "node:test";
import assert from "node:assert";
import { LiveSerpScraper } from "../services/seo/live-serp-scraper.js";
import { handleEcommerceLiveSerpScraper } from "../tools/live-serp-scraper-tool.js";

test("Live SERP Scraper Service - Safe Query", () => {
  const result = LiveSerpScraper.scrapeSerp({ query: "รองเท้าวิ่ง", targetDomain: "example.com" });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.query, "รองเท้าวิ่ง");
  assert.strictEqual(result.targetDomain, "example.com");
  assert.ok(result.positions);
  assert.strictEqual(result.positions.length, 2);
  assert.strictEqual(result.positions[0].url, "https://example.com/best-shoes");
  assert.strictEqual(result.positions[1].url, "https://example.com/product/123");
});

test("Live SERP Scraper Service - Negative Keywords", () => {
  const badQueries = [
    "รองเท้ามือสอง",
    "อาหารเสริมปิดฝาฟอยล์",
    "ครีมกระปุก",
    "ยาลดน้ำหนักมีอย.",
    "สินค้า มือสอง ราคาถูก"
  ];

  for (const query of badQueries) {
    const result = LiveSerpScraper.scrapeSerp({ query });
    assert.strictEqual(result.success, false, `Query '${query}' should fail due to negative keywords`);
    assert.ok(result.error);
    assert.ok(result.error.includes("พบคำต้องห้าม"), `Error message should indicate negative keyword: ${result.error}`);
  }
});

test("Live SERP Scraper Service - Missing Query", () => {
  const result = LiveSerpScraper.scrapeSerp({ query: "" });
  assert.strictEqual(result.success, false);
  assert.ok(result.error?.includes("กรุณาระบุ query"));
});

test("Live SERP Scraper Tool Handler - Success", async () => {
  const result = await handleEcommerceLiveSerpScraper({
    query: "smart watch",
    targetDomain: "example.org"
  });

  assert.ok(result.content);
  assert.strictEqual(result.content.length, 1);
  assert.strictEqual(result.content[0].type, "text");

  const parsed = JSON.parse(result.content[0].text);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.data.query, "smart watch");
  assert.strictEqual(parsed.data.positions.length, 2);
  assert.strictEqual(parsed.data.positions[0].url, "https://example.org/reviews/running-shoes"); // Based on mock data
  assert.strictEqual(parsed.data.positions[1].url, "https://example.org/product/123");
});

test("Live SERP Scraper Tool Handler - Failure (Negative Keyword)", async () => {
  const result = await handleEcommerceLiveSerpScraper({
    query: "ขายของมือสอง"
  });

  const parsed = JSON.parse(result.content[0].text);
  assert.strictEqual(parsed.success, false);
  assert.ok(parsed.error.includes("พบคำต้องห้าม"));
});

test("Live SERP Scraper Tool Handler - Missing Argument", async () => {
  const result = await handleEcommerceLiveSerpScraper({});
  
  const parsed = JSON.parse(result.content[0].text);
  assert.strictEqual(parsed.success, false);
  assert.ok(parsed.error.includes("Missing required argument 'query'"));
});
