import test from "node:test";
import assert from "node:assert";
import { OutboundAutoPoster, OutboundPosterSelectors } from "../services/seo/outbound-auto-poster.js";

test("WP18-02: Outbound Webboard Auto Poster - Fail-Closed Validation", async (t) => {
  const mockCdpConnection = {
    connect: async () => {},
    browser: {
      contexts: () => [],
      newContext: async () => ({
        newPage: async () => ({
           goto: async () => {},
           locator: () => ({
             first: () => ({
               fill: async () => {},
               click: async () => {}
             })
           }),
           waitForLoadState: async () => {},
           close: async () => {}
        })
      })
    },
    disconnect: async () => {}
  } as any;

  const poster = new OutboundAutoPoster(mockCdpConnection);
  const dummySelectors: OutboundPosterSelectors = {
    titleInput: "input.title",
    contentInput: "textarea.content",
    tagsInput: "input.tags",
    anchorLinksInput: "textarea.links",
    submitButton: "button.submit"
  };

  await t.test("Should reject 'มือสอง' in Title", async () => {
    try {
      await poster.postToWebboard({
        targetUrl: "https://test.com",
        title: "ขายของมือสอง ราคาถูก",
        content: "รายละเอียด",
        selectors: dummySelectors
      });
      assert.fail("Should have thrown an error");
    } catch (err: any) {
      assert.match(err.message, /นโยบาย SEO ล้มเหลว \(Title\)/);
      assert.match(err.message, /มือสอง/);
    }
  });

  await t.test("Should reject 'อย.' in Content", async () => {
    try {
      await poster.postToWebboard({
        targetUrl: "https://test.com",
        title: "สินค้าดี",
        content: "สินค้ามี อย. ปลอดภัย 100%",
        selectors: dummySelectors
      });
      assert.fail("Should have thrown an error");
    } catch (err: any) {
      assert.match(err.message, /นโยบาย SEO ล้มเหลว \(Content\)/);
      assert.match(err.message, /อย\./);
    }
  });
  
  await t.test("Should reject 'กระปุก' in Tags", async () => {
    try {
      await poster.postToWebboard({
        targetUrl: "https://test.com",
        title: "สินค้าดี",
        content: "ดีมาก",
        tags: ["แท้", "กระปุกใหม่", "พร้อมส่ง"],
        selectors: dummySelectors
      });
      assert.fail("Should have thrown an error");
    } catch (err: any) {
      assert.match(err.message, /นโยบาย SEO ล้มเหลว \(Tags\)/);
      assert.match(err.message, /กระปุก/);
    }
  });

  await t.test("Should accept valid content and simulate posting in DryRun", async () => {
    let gotoUrl = "";
    let submitted = false;

    const trackingCdpConnection = {
      connect: async () => {},
      browser: {
        contexts: () => [],
        newContext: async () => ({
          newPage: async () => ({
             goto: async (url: string) => { gotoUrl = url; },
             locator: (selector: string) => ({
               first: () => ({
                 fill: async () => {},
                 click: async () => { submitted = true; } // Should not be called in dryRun
               })
             }),
             waitForLoadState: async () => {},
             close: async () => {}
          })
        })
      },
      disconnect: async () => {}
    } as any;

    const trackingPoster = new OutboundAutoPoster(trackingCdpConnection);

    await trackingPoster.postToWebboard({
        targetUrl: "https://cmfreepost.com/post",
        title: "โปรโมทเว็บไซต์ใหม่",
        content: "เชิญแวะชมเว็บไซต์ของเรา",
        tags: ["โปรโมทเว็บ", "SEO"],
        selectors: dummySelectors,
        dryRun: true
    });

    assert.strictEqual(gotoUrl, "https://cmfreepost.com/post");
    assert.strictEqual(submitted, false, "Should not click submit in dryRun mode");
  });
});
