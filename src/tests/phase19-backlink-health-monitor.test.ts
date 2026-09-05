import test from "node:test";
import assert from "node:assert";
import { BacklinkHealthMonitor } from "../services/seo/backlink-health-monitor.js";
import { handleEcommerceAuditBacklinks } from "../tools/backlink-health-tool.js";

test("BacklinkHealthMonitor - Safe and Valid Links", async () => {
  const result = await BacklinkHealthMonitor.auditBacklinks({
    urls: [
      "https://example.com/post/1",
      "https://example.com/post/2"
    ],
    expectedTargetUrl: "https://www.capsulefill.com",
    expectedAnchorTexts: ["เครื่องบรรจุแคปซูลยา"]
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.totalUrls, 2);
  assert.strictEqual(result.healthScore, 100);
  assert.strictEqual(result.indexationRate, 100);
  assert.strictEqual(result.results.length, 2);
  assert.strictEqual(result.results[0].httpStatus, 200);
  assert.strictEqual(result.results[0].isIndexed, true);
  assert.strictEqual(result.results[0].anchorTextMatch, true);
});

test("BacklinkHealthMonitor - Broken and Missing Anchor Links", async () => {
  const result = await BacklinkHealthMonitor.auditBacklinks({
    urls: [
      "https://example.com/broken-page",
      "https://example.com/missing-anchor-page"
    ],
    expectedTargetUrl: "https://www.capsulefill.com",
    expectedAnchorTexts: ["เครื่องบรรจุแคปซูลยา"]
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.totalUrls, 2);
  assert.strictEqual(result.healthScore, 0); // Both have issues (one 404, one missing anchor)
  assert.strictEqual(result.indexationRate, 50); // broken is not indexed, missing-anchor is indexed

  const brokenLink = result.results.find(r => r.url.includes("broken"));
  assert.ok(brokenLink);
  assert.strictEqual(brokenLink.httpStatus, 404);
  assert.strictEqual(brokenLink.isLinkPreserved, false);
  assert.ok(brokenLink.issues.some(i => i.includes("404")));

  const missingAnchor = result.results.find(r => r.url.includes("missing-anchor"));
  assert.ok(missingAnchor);
  assert.strictEqual(missingAnchor.anchorTextMatch, false);
  assert.ok(missingAnchor.issues.some(i => i.includes("Anchor Text")));
});

test("BacklinkHealthMonitor - SeoPolicyGuard Reject URL", async () => {
  const result = await BacklinkHealthMonitor.auditBacklinks({
    urls: ["https://example.com/สินค้ามือสอง"],
    expectedTargetUrl: "https://www.capsulefill.com"
  });

  assert.strictEqual(result.success, false);
  assert.strictEqual(result.healthScore, 0);
  assert.ok(result.error);
  assert.ok(result.error.includes("มือสอง"));
});

test("BacklinkHealthMonitor - SeoPolicyGuard Reject Anchor Text", async () => {
  const result = await BacklinkHealthMonitor.auditBacklinks({
    urls: ["https://example.com/post/1"],
    expectedTargetUrl: "https://www.capsulefill.com",
    expectedAnchorTexts: ["เครื่องบรรจุยาแคปซูล มือสอง"]
  });

  assert.strictEqual(result.success, false);
  assert.strictEqual(result.healthScore, 0);
  assert.ok(result.error);
  assert.ok(result.error.includes("มือสอง"));
});

test("handleEcommerceAuditBacklinks - Success", async () => {
  const args = {
    urls: ["https://example.com/valid"],
    expectedTargetUrl: "https://www.capsulefill.com",
    expectedAnchorTexts: ["เครื่องบรรจุแคปซูลยา"]
  };
  const result = await handleEcommerceAuditBacklinks(args);

  assert.ok(result.content);
  assert.strictEqual(result.content[0].type, "text");

  const parsed = JSON.parse(result.content[0].text);
  assert.strictEqual(parsed.status, "success");
  assert.strictEqual(parsed.report.success, true);
  assert.strictEqual(parsed.report.healthScore, 100);
});

test("handleEcommerceAuditBacklinks - Missing URLs", async () => {
  const result = await handleEcommerceAuditBacklinks({});

  assert.strictEqual(result.isError, true);
  assert.ok(result.content[0].text.includes("กรุณาระบุ 'urls'"));
});

test("handleEcommerceAuditBacklinks - SeoPolicyGuard Rejection", async () => {
  const args = {
    urls: ["https://example.com/test"],
    expectedAnchorTexts: ["แคปซูล ปิดฝาฟอยล์"]
  };
  const result = await handleEcommerceAuditBacklinks(args);

  assert.strictEqual(result.isError, true);
  assert.ok(result.content[0].text.includes("ปิดฝาฟอยล์"));
});
