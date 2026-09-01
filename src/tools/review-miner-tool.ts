import { ReviewMiner } from "../services/review-miner.js";

const miner = new ReviewMiner();

export async function handleEcommerceReviewMiner(args: any) {
  const reviews = args?.reviews;

  if (!reviews || !Array.isArray(reviews)) {
    return { isError: true, content: [{ type: "text", text: "Missing or invalid reviews array" }] };
  }

  const analysis = miner.mineReviews(reviews);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          status: "success",
          analysis,
        }),
      },
    ],
  };
}
