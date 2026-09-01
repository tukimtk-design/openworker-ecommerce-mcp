import { SupplierBridge, ArbitrageScanOptions } from "../services/supplier-bridge.js";

const bridge = new SupplierBridge();

export async function handleEcommerceSupplierBridge(args: any) {
  const domesticSku = args?.domesticSku;
  const domesticTitle = args?.domesticTitle || "";
  const domesticSellingPrice = Number(args?.domesticSellingPrice);
  const targetNetMarginPercent = Number(args?.targetNetMarginPercent || 25);
  const suppliers = args?.suppliers || [];

  if (!domesticSku || isNaN(domesticSellingPrice)) {
    return { isError: true, content: [{ type: "text", text: "Missing domesticSku or domesticSellingPrice" }] };
  }

  const options: ArbitrageScanOptions = {
    domesticSku,
    domesticTitle,
    domesticSellingPrice,
    targetNetMarginPercent,
    suppliers,
  };

  const result = bridge.analyzeArbitrage(options);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
