import test from "node:test";
import assert from "node:assert";
import { LnwShopCdpActuator } from "../services/seo/lnwshop-cdp-actuator.js";

test("WP17-02: LnwShop CDP Actuator - Fail-Closed Validation", async (t) => {
  // Mock CDP Connection
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

  const actuator = new LnwShopCdpActuator(mockCdpConnection);
  const dummySelectors = {
    metaTitle: "input.title",
    metaKeywords: "input.keywords",
    metaDescription: "textarea.desc",
    saveButton: "button.save"
  };

  await t.test("Should reject 'มือสอง' in Meta Title", async () => {
    try {
      await actuator.updateSeo("prod-1", dummySelectors, "https://test.com", "สินค้าราคาถูก มือสอง สภาพดี");
      assert.fail("Should have thrown an error");
    } catch (err: any) {
      assert.match(err.message, /นโยบาย SEO ล้มเหลว \(Meta Title\)/);
      assert.match(err.message, /มือสอง/);
    }
  });

  await t.test("Should reject 'อย.' in Meta Keywords", async () => {
    try {
      await actuator.updateSeo("prod-1", dummySelectors, "https://test.com", "สมุนไพร", ["ดีมาก", "มี อย."]);
      assert.fail("Should have thrown an error");
    } catch (err: any) {
      assert.match(err.message, /นโยบาย SEO ล้มเหลว \(Meta Keywords\)/);
      assert.match(err.message, /อย\./);
    }
  });

  await t.test("Should reject 'ปิดฝาฟอยล์' in Meta Description", async () => {
    try {
      await actuator.updateSeo("prod-1", dummySelectors, "https://test.com", "สมุนไพร", ["ดี"], "สินค้ากระปุก ปิดฝาฟอยล์ อย่างดี");
      assert.fail("Should have thrown an error");
    } catch (err: any) {
      assert.match(err.message, /นโยบาย SEO ล้มเหลว \(Meta Description\)/);
      assert.match(err.message, /ปิดฝาฟอยล์/);
    }
  });

  await t.test("Should accept valid SEO metadata and proceed with CDP (Mocked)", async () => {
    let gotoUrl = "";
    let filledTitle = "";
    
    const trackingCdpConnection = {
      connect: async () => {},
      browser: {
        contexts: () => [],
        newContext: async () => ({
          newPage: async () => ({
             goto: async (url: string) => { gotoUrl = url; },
             locator: (selector: string) => ({
               first: () => ({
                 fill: async (val: string) => { 
                   if (selector === dummySelectors.metaTitle) filledTitle = val; 
                 },
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

    const trackingActuator = new LnwShopCdpActuator(trackingCdpConnection);
    
    await trackingActuator.updateSeo(
      "prod-99", 
      dummySelectors, 
      "https://capsulefill.com/admin/123", 
      "สมุนไพรแท้บำรุงสุขภาพ", 
      ["สมุนไพร", "สุขภาพ"], 
      "สมุนไพรแท้ 100% บำรุงร่างกาย สดชื่น"
    );

    assert.strictEqual(gotoUrl, "https://capsulefill.com/admin/123");
    assert.strictEqual(filledTitle, "สมุนไพรแท้บำรุงสุขภาพ");
  });
});
