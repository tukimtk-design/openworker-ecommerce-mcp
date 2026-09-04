import test from "node:test";
import assert from "node:assert";
import { DomTokenPruner } from "../services/seo/dom-token-pruner.js";

test("DomTokenPruner - extracts only relevant structural and SEO tokens", async (t) => {
  const pruner = new DomTokenPruner();

  const htmlInput = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Test Page</title>
      <meta name="description" content="This is a test description">
      <meta name="keywords" content="test, pruner, dom">
      <meta property="og:title" content="OG Test Title">
      <meta name="viewport" content="width=device-width, initial-scale=1.0"> <!-- Should be ignored -->
      <link rel="canonical" href="https://example.com/test">
      
      <style>
        body { color: red; }
      </style>
      <script>
        console.log("Hello, world!");
      </script>
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Test Product"
        }
      </script>
    </head>
    <body>
      <div class="container" id="main">
        <h1 class="header-title"> Main Heading </h1>
        <p>This is a paragraph that should not be extracted directly.</p>
        
        <h2>Sub Heading 1</h2>
        <svg><path d="M10 10 H 90 V 90 H 10 L 10 10"/></svg>
        
        <img src="https://example.com/image.jpg" alt="A test image" class="img-responsive">
        <img src="https://example.com/no-alt.png"> <!-- Missing alt should be empty string -->
        
        <h3>   Sub Heading 2   </h3>
        
        <!-- This is a comment -->
      </div>
    </body>
    </html>
  `;

  await t.test("Returns correct structure with expected headings", () => {
    const result = pruner.prune(htmlInput);
    
    assert.deepStrictEqual(result.headings, [
      { level: 'h1', text: 'Main Heading' },
      { level: 'h2', text: 'Sub Heading 1' },
      { level: 'h3', text: 'Sub Heading 2' }
    ]);
  });

  await t.test("Returns correct structure with expected meta tags", () => {
    const result = pruner.prune(htmlInput);
    
    // Check that we got the title tag, description, keywords, og:title, and canonical
    assert.ok(result.metaTags.find(m => m.name === 'title' && m.content === 'Test Page'));
    assert.ok(result.metaTags.find(m => m.name === 'description' && m.content === 'This is a test description'));
    assert.ok(result.metaTags.find(m => m.name === 'keywords' && m.content === 'test, pruner, dom'));
    assert.ok(result.metaTags.find(m => m.property === 'og:title' && m.content === 'OG Test Title'));
    assert.ok(result.metaTags.find(m => m.rel === 'canonical' && m.href === 'https://example.com/test'));
    
    // Make sure we didn't get viewport
    assert.ok(!result.metaTags.find(m => m.name === 'viewport'));
  });

  await t.test("Returns correct structure with parsed JSON-LD", () => {
    const result = pruner.prune(htmlInput);
    
    assert.strictEqual(result.jsonLd.length, 1);
    assert.strictEqual(result.jsonLd[0]["@type"], "Product");
    assert.strictEqual(result.jsonLd[0].name, "Test Product");
  });

  await t.test("Returns correct structure with expected images", () => {
    const result = pruner.prune(htmlInput);
    
    assert.deepStrictEqual(result.images, [
      { src: 'https://example.com/image.jpg', alt: 'A test image' },
      { src: 'https://example.com/no-alt.png', alt: '' }
    ]);
  });

  await t.test("Handles empty or null input gracefully", () => {
    const result = pruner.prune("");
    assert.deepStrictEqual(result, { headings: [], metaTags: [], jsonLd: [], images: [] });
  });
});
