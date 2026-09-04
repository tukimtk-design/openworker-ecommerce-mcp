import { test } from 'node:test';
import * as assert from 'node:assert';
import { SeoContentEnricher } from '../services/seo/seo-content-enricher.js';
import { SiteAuditCrawler } from '../services/seo/site-audit-crawler.js';

test('SeoContentEnricher - Successful Enrichment', () => {
    const enricher = new SeoContentEnricher();
    const result = enricher.enrichContent({
        originalContent: 'Product Description Here',
        targetKeywords: ['shoes', 'running'],
        negativeKeywords: ['bad', 'ugly']
    });

    assert.strictEqual(result.status, 'READY_FOR_HUMAN_REVIEW');
    assert.ok(result.enrichedContent?.includes('Product Description Here'));
    assert.ok(result.enrichedContent?.includes('shoes, running'));
    assert.ok(result.enrichedContent?.includes('(Expertise)'));
});

test('SeoContentEnricher - Negative Keyword Detection', () => {
    const enricher = new SeoContentEnricher();
    const result = enricher.enrichContent({
        originalContent: 'This is a bad product',
        targetKeywords: ['shoes'],
        negativeKeywords: ['bad', 'ugly']
    });

    assert.strictEqual(result.status, 'REJECTED_DUE_TO_NEGATIVE_KEYWORDS');
    assert.ok(result.reason?.includes('bad'));
});

test('SiteAuditCrawler - Valid DOM Audit', () => {
    const crawler = new SiteAuditCrawler();
    const validHtml = `
        <html>
            <head>
                <title>Test Page</title>
                <script type="application/ld+json">
                {
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": "Shoes"
                }
                </script>
            </head>
            <body>
                <h1>Main Heading</h1>
                <img src="test.jpg" alt="A test image" />
            </body>
        </html>
    `;

    const result = crawler.auditDom(validHtml);
    assert.strictEqual(result.missingAltImages, 0);
    assert.strictEqual(result.h1HierarchyValid, true);
    assert.strictEqual(result.jsonLdValid, true);
    assert.strictEqual(result.score, 100);
});

test('SiteAuditCrawler - Invalid DOM Audit', () => {
    const crawler = new SiteAuditCrawler();
    const invalidHtml = `
        <html>
            <body>
                <h2>Secondary Heading (Missing H1)</h2>
                <img src="test1.jpg" />
                <img src="test2.jpg" alt="" />
            </body>
        </html>
    `;

    const result = crawler.auditDom(invalidHtml);
    assert.strictEqual(result.missingAltImages, 2);
    assert.strictEqual(result.h1HierarchyValid, false);
    assert.strictEqual(result.jsonLdValid, false);
    assert.ok(result.score < 100);
});
