export interface SupplierItem {
  supplierPlatform: '1688' | 'TAOBAO' | 'ALIEXPRESS';
  supplierProductId: string;
  supplierTitle: string;
  sourceCurrency: 'CNY' | 'USD';
  sourcePrice: number;
  estimatedFreightThb: number;
  importTaxRate: number; // e.g. 0.07 for 7% VAT
  cnyToThbRate: number;
  moq: number;
  supplierRating: number;
}

export interface ArbitrageScanOptions {
  domesticSku: string;
  domesticTitle: string;
  domesticSellingPrice: number;
  targetNetMarginPercent?: number;
  suppliers: SupplierItem[];
}

export interface ArbitrageAnalysisResult {
  domesticSku: string;
  domesticSellingPrice: number;
  matchedSuppliers: Array<SupplierItem & {
    landedCostThb: number;
    potentialGrossMarginThb: number;
    potentialGrossMarginPercent: number;
    arbitrageFeasibility: 'HIGHLY_PROFITABLE' | 'MODERATE' | 'NOT_VIABLE';
  }>;
  bestSupplier?: SupplierItem & {
    landedCostThb: number;
    potentialGrossMarginThb: number;
    potentialGrossMarginPercent: number;
    arbitrageFeasibility: 'HIGHLY_PROFITABLE' | 'MODERATE' | 'NOT_VIABLE';
  };
  summaryRecommendation: string;
}

export class SupplierBridge {
  public calculateLandedCost(item: SupplierItem): number {
    const exchangeRate = item.sourceCurrency === 'CNY' ? (item.cnyToThbRate || 5.1) : 36.0;
    const baseCostThb = item.sourcePrice * exchangeRate;
    const costWithDuty = baseCostThb * (1 + item.importTaxRate);
    const totalLandedCost = costWithDuty + item.estimatedFreightThb;
    return Number(totalLandedCost.toFixed(2));
  }

  public analyzeArbitrage(options: ArbitrageScanOptions): ArbitrageAnalysisResult {
    const { domesticSku, domesticSellingPrice, suppliers, targetNetMarginPercent = 25 } = options;

    const matchedSuppliers = suppliers.map((sup) => {
      const landedCostThb = this.calculateLandedCost(sup);
      const potentialGrossMarginThb = Number((domesticSellingPrice - landedCostThb).toFixed(2));
      const potentialGrossMarginPercent = Number(((potentialGrossMarginThb / domesticSellingPrice) * 100).toFixed(2));

      let arbitrageFeasibility: 'HIGHLY_PROFITABLE' | 'MODERATE' | 'NOT_VIABLE' = 'NOT_VIABLE';
      if (potentialGrossMarginPercent >= targetNetMarginPercent + 15) {
        arbitrageFeasibility = 'HIGHLY_PROFITABLE';
      } else if (potentialGrossMarginPercent >= targetNetMarginPercent) {
        arbitrageFeasibility = 'MODERATE';
      }

      return {
        ...sup,
        landedCostThb,
        potentialGrossMarginThb,
        potentialGrossMarginPercent,
        arbitrageFeasibility,
      };
    });

    matchedSuppliers.sort((a, b) => b.potentialGrossMarginPercent - a.potentialGrossMarginPercent);

    const bestSupplier = matchedSuppliers[0];
    let summaryRecommendation = `Scanned ${suppliers.length} supplier sources for SKU ${domesticSku}.`;
    if (bestSupplier && bestSupplier.arbitrageFeasibility === 'HIGHLY_PROFITABLE') {
      summaryRecommendation += ` Found top supplier on ${bestSupplier.supplierPlatform} with ${bestSupplier.potentialGrossMarginPercent}% gross margin.`;
    } else {
      summaryRecommendation += ` Margin does not meet high-arbitrage threshold.`;
    }

    return {
      domesticSku,
      domesticSellingPrice,
      matchedSuppliers,
      bestSupplier,
      summaryRecommendation,
    };
  }
}
