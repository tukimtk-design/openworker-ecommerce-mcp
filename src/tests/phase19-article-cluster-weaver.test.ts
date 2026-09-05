import { describe, it } from "node:test";
import assert from "node:assert";
import { ArticleClusterWeaver, Article } from "../services/seo/article-cluster-weaver.js";

describe("WP19-02: Article Cluster Weaver", () => {
  it("Should successfully weave articles and category URLs", () => {
    const weaver = new ArticleClusterWeaver();

    const articles: Article[] = [
      {
        id: "1",
        title: "Guide to Silica Gel",
        content: "Silica gel is useful. Get it today.",
        targetKeyword: "Silica gel",
        targetUrl: "http://example.com/silica-gel"
      },
      {
        id: "2",
        title: "Workstation Setup",
        content: "A good workstation needs Silica gel for moisture control.",
        targetKeyword: "Workstation",
        targetUrl: "http://example.com/workstation"
      }
    ];

    const categoryUrls = ["http://example.com/category/1"];

    const result = weaver.weaveCluster(articles, categoryUrls);

    assert.strictEqual(result.weavedArticles.length, 2);

    // Article 2 should now have a link to Article 1 (targetKeyword "Silica gel")
    const weavedArticle2 = result.weavedArticles.find(a => a.id === "2");
    assert.ok(weavedArticle2?.content.includes('<a href="http://example.com/silica-gel">Silica gel</a>'));

    // Check category link
    assert.ok(weavedArticle2?.content.includes('<a href="http://example.com/category/1">Category</a>'));

    assert.ok(result.linkMatrix["2"].includes("http://example.com/silica-gel"));
    assert.ok(result.linkMatrix["2"].includes("http://example.com/category/1"));
  });

  it("Should fail-closed and throw error if 'มือสอง' is in the title", () => {
    const weaver = new ArticleClusterWeaver();
    const articles: Article[] = [
      {
        id: "1",
        title: "Guide to มือสอง",
        content: "Silica gel is useful. Get it today.",
        targetKeyword: "Silica gel"
      }
    ];

    assert.throws(() => weaver.weaveCluster(articles, []), /Policy violation in title/);
  });

  it("Should fail-closed and throw error if 'อย.' is in the content", () => {
    const weaver = new ArticleClusterWeaver();
    const articles: Article[] = [
      {
        id: "1",
        title: "Safe Title",
        content: "This product has อย. approved.",
        targetKeyword: "Silica gel"
      }
    ];

    assert.throws(() => weaver.weaveCluster(articles, []), /Policy violation in content/);
  });

  it("Should simulate publishing with mocked CDP connection", async () => {
    const pages: any[] = [];
    const mockPage = {
      goto: async (url: string) => {},
      waitForLoadState: async () => {},
      locator: (selector: string) => ({
        first: () => ({
          fill: async (text: string) => {},
          click: async () => {}
        })
      }),
      close: async () => {}
    };

    const mockCdpConnection: any = {
      connect: async () => {},
      browser: {
        contexts: () => [{
          newPage: async () => {
            pages.push(mockPage);
            return mockPage;
          }
        }],
        newContext: async () => ({
           newPage: async () => {
            pages.push(mockPage);
            return mockPage;
           }
        })
      },
      disconnect: async () => {}
    };

    const weaver = new ArticleClusterWeaver(mockCdpConnection);
    const articles: Article[] = [
      { id: "1", title: "A1", content: "C1", targetKeyword: "K1" },
      { id: "2", title: "A2", content: "C2", targetKeyword: "K2" }
    ];

    const startTime = Date.now();
    await weaver.publishCluster(articles, "http://publish.url", {
      titleSelector: "#title",
      contentSelector: "#content",
      submitButtonSelector: "#submit"
    });
    const duration = Date.now() - startTime;

    // It should wait ~2000ms between the 2 posts
    assert.ok(duration >= 1900, "Should have throttled for at least ~2 seconds");
    assert.strictEqual(pages.length, 1);
  });
});
