import { z } from 'zod';
import { calculateLandedCost, LandedCostParams } from '../utils/freight-cbm-calculator.js';

export const BundleArbitrageEngineSchema = z.object({
  bundleItems: z.array(z.object({
    name: z.string(),
    rmbPurchasePrice: z.number(),
    shippingCbm: z.number().optional(),
    shippingWeightKg: z.number().optional(),
    quantity: z.number().default(1),
  })).min(1),
  thbExchangeRate: z.number(),
  shippingCbmRateThb: z.number().default(4000), // Default 4000 THB/CBM
  shippingWeightRateThb: z.number().default(40), // Default 40 THB/Kg
  importTariffThb: z.number().default(0),
  localFulfillmentFeeThb: z.number().default(50),
  targetSellingPriceThb: z.number(),
  minimumMarginThreshold: z.number().default(35), // Default 35% margin
});

export type BundleArbitrageEngineParams = z.infer<typeof BundleArbitrageEngineSchema>;

export async function handleEcommerceBundleArbitrageEngine(params: BundleArbitrageEngineParams) {
  let totalLandedCostThb = 0;

  const itemBreakdowns = params.bundleItems.map(item => {
    const qty = item.quantity ?? 1;
    const landedCostParams: LandedCostParams = {
      rmbPurchasePrice: item.rmbPurchasePrice,
      thbExchangeRate: params.thbExchangeRate,
      shippingCbm: item.shippingCbm,
      shippingCbmRateThb: params.shippingCbmRateThb,
      shippingWeightKg: item.shippingWeightKg,
      shippingWeightRateThb: params.shippingWeightRateThb,
      importTariffThb: 0,
      localFulfillmentFeeThb: 0,
    };

    const itemUnitLandedCost = calculateLandedCost(landedCostParams);
    const totalItemLandedCost = itemUnitLandedCost * qty;

    totalLandedCostThb += totalItemLandedCost;

    return {
      name: item.name,
      quantity: qty,
      unitLandedCostThb: itemUnitLandedCost,
      totalLandedCostThb: totalItemLandedCost
    };
  });

  totalLandedCostThb += params.importTariffThb + params.localFulfillmentFeeThb;

  const netProfitThb = params.targetSellingPriceThb - totalLandedCostThb;
  const marginPercentage = params.targetSellingPriceThb > 0
    ? (netProfitThb / params.targetSellingPriceThb) * 100
    : 0;

  const marginThreshold = params.minimumMarginThreshold ?? 35;
  const marginShieldAlert = marginPercentage < marginThreshold;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          success: true,
          data: {
            totalLandedCostThb,
            targetSellingPriceThb: params.targetSellingPriceThb,
            netProfitThb,
            marginPercentage,
            marginShieldAlert,
            marginShieldThreshold: marginThreshold,
            itemBreakdowns,
            message: marginShieldAlert
              ? `ALERT: Minimum Margin Shield triggered. Net profit margin (${marginPercentage.toFixed(2)}%) is below the required ${marginThreshold}%.`
              : `Arbitrage calculation successful. Margin: ${marginPercentage.toFixed(2)}%.`
          }
        }, null, 2)
      }
    ]
  };
}
