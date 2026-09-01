export interface ListingVariant {
  variantId: string;
  title: string;
  coverImageUrl?: string;
  impressions: number;
  clicks: number;
  orders: number;
  revenueThb: number;
}

export interface AbTestConfig {
  experimentId: string;
  productId: string;
  variants: ListingVariant[];
  minImpressionsPerVariant?: number;
}

export interface AbTestEvaluationResult {
  experimentId: string;
  productId: string;
  totalImpressions: number;
  variantMetrics: Array<ListingVariant & {
    ctrPercent: number;
    conversionRatePercent: number;
    rpiThb: number; // Revenue Per Impression
    isWinner: boolean;
  }>;
  winningVariant?: ListingVariant & {
    ctrPercent: number;
    conversionRatePercent: number;
    rpiThb: number;
    isWinner: boolean;
  };
  recommendation: 'PROMOTE_WINNER' | 'CONTINUE_TESTING' | 'INSUFFICIENT_DATA';
  actionableSummary: string;
}

export class ListingAbTest {
  public evaluateExperiment(config: AbTestConfig): AbTestEvaluationResult {
    const { experimentId, productId, variants, minImpressionsPerVariant = 100 } = config;

    let totalImpressions = 0;
    const evaluatedVariants = variants.map((v) => {
      totalImpressions += v.impressions;
      const ctrPercent = v.impressions > 0 ? Number(((v.clicks / v.impressions) * 100).toFixed(2)) : 0;
      const conversionRatePercent = v.clicks > 0 ? Number(((v.orders / v.clicks) * 100).toFixed(2)) : 0;
      const rpiThb = v.impressions > 0 ? Number((v.revenueThb / v.impressions).toFixed(2)) : 0;

      return {
        ...v,
        ctrPercent,
        conversionRatePercent,
        rpiThb,
        isWinner: false,
      };
    });

    // Sort by highest Revenue Per Impression (RPI)
    evaluatedVariants.sort((a, b) => b.rpiThb - a.rpiThb || b.ctrPercent - a.ctrPercent);

    const hasEnoughData = evaluatedVariants.every((v) => v.impressions >= minImpressionsPerVariant);
    let recommendation: AbTestEvaluationResult['recommendation'] = 'CONTINUE_TESTING';

    if (!hasEnoughData) {
      recommendation = 'INSUFFICIENT_DATA';
    } else if (evaluatedVariants.length > 0 && evaluatedVariants[0].rpiThb > (evaluatedVariants[1]?.rpiThb || 0)) {
      recommendation = 'PROMOTE_WINNER';
      evaluatedVariants[0].isWinner = true;
    }

    const winningVariant = evaluatedVariants.find((v) => v.isWinner);
    const actionableSummary = winningVariant
      ? `Promote variant ${winningVariant.variantId} ("${winningVariant.title}"): RPI=${winningVariant.rpiThb} THB (CTR=${winningVariant.ctrPercent}%).`
      : `Experiment ${experimentId} needs more traffic before promoting a permanent winner.`;

    return {
      experimentId,
      productId,
      totalImpressions,
      variantMetrics: evaluatedVariants,
      winningVariant,
      recommendation,
      actionableSummary,
    };
  }
}
