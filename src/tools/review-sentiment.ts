import { Platform } from "../types.js";

export async function handleEcommerceReviewSentiment(args: any) {
  const platform = args?.platform as Platform;
  const productId = args?.productId;
  const reviews = args?.reviews as string[];

  if (!platform || !productId || !reviews || !Array.isArray(reviews)) {
    return {
      isError: true,
      content: [{ type: "text", text: "กรุณาระบุข้อมูลให้ครบถ้วน: platform, productId, reviews เป็น array" }],
    };
  }

  // Mock sentiment analysis
  let positive = 0;
  let negative = 0;
  let neutral = 0;

  for (const review of reviews) {
      const lower = review.toLowerCase();
      if (lower.includes("ดี") || lower.includes("ชอบ") || lower.includes("เยี่ยม") || lower.includes("good")) {
          positive++;
      } else if (lower.includes("แย่") || lower.includes("ช้า") || lower.includes("พัง") || lower.includes("bad")) {
          negative++;
      } else {
          neutral++;
      }
  }

  let overallSentiment = "neutral";
  if (positive > negative) overallSentiment = "positive";
  if (negative > positive) overallSentiment = "negative";

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          status: "success",
          productId,
          platform,
          analysis: {
              totalReviews: reviews.length,
              positive,
              negative,
              neutral,
              overallSentiment
          },
          message: "Sentiment analysis completed."
        }),
      },
    ],
  };
}
