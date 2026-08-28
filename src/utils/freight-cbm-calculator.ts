export interface LandedCostParams {
  rmbPurchasePrice: number;
  thbExchangeRate: number;
  shippingCbm?: number;
  shippingCbmRateThb?: number;
  shippingWeightKg?: number;
  shippingWeightRateThb?: number;
  importTariffThb?: number;
  localFulfillmentFeeThb?: number;
}

export function calculateLandedCost(params: LandedCostParams): number {
  const itemCostThb = params.rmbPurchasePrice * params.thbExchangeRate;

  let shippingCostThb = 0;
  const cbmCost = (params.shippingCbm || 0) * (params.shippingCbmRateThb || 0);
  const weightCost = (params.shippingWeightKg || 0) * (params.shippingWeightRateThb || 0);

  // Freight forwarders usually charge whichever is higher: CBM or Weight
  if (cbmCost > 0 || weightCost > 0) {
      shippingCostThb = Math.max(cbmCost, weightCost);
  }

  const tariffThb = params.importTariffThb || 0;
  const fulfillmentThb = params.localFulfillmentFeeThb || 0;

  return itemCostThb + shippingCostThb + tariffThb + fulfillmentThb;
}
