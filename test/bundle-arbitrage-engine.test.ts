import { handleEcommerceBundleArbitrageEngine, BundleArbitrageEngineSchema } from '../src/tools/bundle-arbitrage-engine.js';

describe('ecommerce_bundle_arbitrage_engine', () => {
    test('basic scenario', async () => {
        const payload = {
            bundleItems: [
                {
                    name: "Smart Watch",
                    rmbPurchasePrice: 100, // 100 RMB -> 500 THB
                    shippingCbm: 0.001,    // 0.001 * 4000 = 4 THB
                    quantity: 1
                },
                {
                    name: "Watch Strap",
                    rmbPurchasePrice: 10,  // 10 RMB -> 50 THB
                    shippingWeightKg: 0.1, // 0.1 * 40 = 4 THB
                    quantity: 2            // total landed cost for this item = 2 * (50 + 4) = 108 THB
                }
            ],
            thbExchangeRate: 5,
            targetSellingPriceThb: 1500,
            localFulfillmentFeeThb: 50
        };

        const parsed = BundleArbitrageEngineSchema.parse(payload);
        const result = await handleEcommerceBundleArbitrageEngine(parsed);

        const jsonText = result.content[0].text;
        const response = JSON.parse(jsonText);

        expect(response.success).toBe(true);
        expect(response.data.totalLandedCostThb).toBe(662);
        expect(response.data.netProfitThb).toBe(838);
        expect(response.data.marginShieldAlert).toBe(false);
        expect(response.data.marginPercentage).toBeGreaterThan(55);
    });

    test('margin shield alert', async () => {
        const payload = {
            bundleItems: [
                {
                    name: "Cheap Item",
                    rmbPurchasePrice: 200, // 200 * 5 = 1000 THB
                    quantity: 1
                }
            ],
            thbExchangeRate: 5,
            targetSellingPriceThb: 1200, // Cost is 1000 + 50 = 1050 THB. Profit = 150. Margin = 150 / 1200 = 12.5%
            localFulfillmentFeeThb: 50,
            minimumMarginThreshold: 35
        };

        const parsed = BundleArbitrageEngineSchema.parse(payload);
        const result = await handleEcommerceBundleArbitrageEngine(parsed);

        const jsonText = result.content[0].text;
        const response = JSON.parse(jsonText);

        expect(response.success).toBe(true);
        expect(response.data.marginShieldAlert).toBe(true);
        expect(response.data.totalLandedCostThb).toBe(1050);
    });
});
