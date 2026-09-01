import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ActuatorRouter } from '../services/actuator-router.js';
import { SupplierBridge } from '../services/supplier-bridge.js';
import { ListingAbTest } from '../services/listing-ab-test.js';

describe('Phase 15: Actuator Router, Supplier Bridge, and A/B Testing', () => {
  describe('ActuatorRouter', () => {
    it('should fallback gracefully when official API credentials are missing', () => {
      const router = new ActuatorRouter();
      const res = router.routeAndExecute({
        platform: 'SHOPEE',
        action: 'UPDATE_PRICE',
        payload: { price: 299 },
      });

      assert.strictEqual(res.selectedChannel, 'INTERNAL_XHR_SESSION');
      assert.strictEqual(res.executedStatus, 'SUCCESS');
      assert.strictEqual(res.attempts[0].channel, 'OFFICIAL_OPEN_API');
      assert.strictEqual(res.attempts[0].status, 'FAILED');
      assert.strictEqual(res.attempts[1].channel, 'INTERNAL_XHR_SESSION');
      assert.strictEqual(res.attempts[1].status, 'SUCCESS');
    });

    it('should respect dryRun without actual execution', () => {
      const router = new ActuatorRouter();
      const res = router.routeAndExecute({
        platform: 'LAZADA',
        action: 'UPDATE_STOCK',
        payload: { stock: 50 },
        dryRun: true,
      });

      assert.strictEqual(res.executedStatus, 'DRY_RUN_ROUTED');
    });
  });

  describe('SupplierBridge', () => {
    it('should calculate landed cost and rank arbitrage profitability', () => {
      const bridge = new SupplierBridge();
      const res = bridge.analyzeArbitrage({
        domesticSku: 'SKU-POWERBANK-20000',
        domesticTitle: 'Power Bank 20000mAh Fast Charge',
        domesticSellingPrice: 490,
        suppliers: [
          {
            supplierPlatform: '1688',
            supplierProductId: '1688-9921',
            supplierTitle: '20000mAh Powerbank OEM Factory',
            sourceCurrency: 'CNY',
            sourcePrice: 28,
            estimatedFreightThb: 25,
            importTaxRate: 0.07,
            cnyToThbRate: 5.1,
            moq: 10,
            supplierRating: 4.8,
          },
          {
            supplierPlatform: 'ALIEXPRESS',
            supplierProductId: 'ALI-8812',
            supplierTitle: 'Fast Charge Powerbank Retail',
            sourceCurrency: 'USD',
            sourcePrice: 11,
            estimatedFreightThb: 15,
            importTaxRate: 0.07,
            cnyToThbRate: 5.1,
            moq: 1,
            supplierRating: 4.5,
          },
        ],
      });

      assert.strictEqual(res.matchedSuppliers.length, 2);
      assert.strictEqual(res.bestSupplier?.supplierPlatform, '1688');
      assert.strictEqual(res.bestSupplier?.arbitrageFeasibility, 'HIGHLY_PROFITABLE');
      assert(res.bestSupplier.potentialGrossMarginPercent > 50);
    });
  });

  describe('ListingAbTest', () => {
    it('should determine winning variant based on revenue per impression (RPI)', () => {
      const engine = new ListingAbTest();
      const res = engine.evaluateExperiment({
        experimentId: 'EXP-TITLE-001',
        productId: 'PROD-101',
        variants: [
          {
            variantId: 'VAR-A',
            title: 'พาวเวอร์แบงค์ 20000mAh ชาร์จเร็ว',
            impressions: 1000,
            clicks: 50,
            orders: 5,
            revenueThb: 2450,
          },
          {
            variantId: 'VAR-B',
            title: '[ของแท้ 100%] แบตสำรอง 20000mAh ชาร์จไว ส่งฟรี',
            impressions: 1000,
            clicks: 80,
            orders: 12,
            revenueThb: 5880,
          },
        ],
      });

      assert.strictEqual(res.recommendation, 'PROMOTE_WINNER');
      assert.strictEqual(res.winningVariant?.variantId, 'VAR-B');
      assert.strictEqual(res.winningVariant?.rpiThb, 5.88);
      assert.strictEqual(res.winningVariant?.ctrPercent, 8);
    });

    it('should flag INSUFFICIENT_DATA if traffic threshold is not met', () => {
      const engine = new ListingAbTest();
      const res = engine.evaluateExperiment({
        experimentId: 'EXP-TITLE-002',
        productId: 'PROD-102',
        minImpressionsPerVariant: 500,
        variants: [
          {
            variantId: 'VAR-A',
            title: 'Title A',
            impressions: 200,
            clicks: 10,
            orders: 1,
            revenueThb: 490,
          },
        ],
      });

      assert.strictEqual(res.recommendation, 'INSUFFICIENT_DATA');
    });
  });
});
