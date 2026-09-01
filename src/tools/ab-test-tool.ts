import { ListingAbTest, AbTestConfig } from "../services/listing-ab-test.js";

const engine = new ListingAbTest();

export async function handleEcommerceListingAbTest(args: any) {
  const experimentId = args?.experimentId;
  const productId = args?.productId;
  const variants = args?.variants || [];
  const minImpressionsPerVariant = Number(args?.minImpressionsPerVariant || 100);

  if (!experimentId || !productId || !Array.isArray(variants)) {
    return { isError: true, content: [{ type: "text", text: "Missing experimentId, productId, or variants array" }] };
  }

  const config: AbTestConfig = {
    experimentId,
    productId,
    variants,
    minImpressionsPerVariant,
  };

  const result = engine.evaluateExperiment(config);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
