export interface ReviewPainPoint {
  category: "QUALITY" | "DELIVERY" | "PACKAGING" | "CUSTOMER_SERVICE" | "ACCURACY";
  keyword: string;
  mentionCount: number;
  sampleQuotes: string[];
  suggestedUspHighlight: string;
}

export class ReviewMiner {
  /**
   * Mines 1-3 star competitor reviews to extract recurring customer complaints
   * and synthesize them into selling advantages for our own product listings.
   */
  mineReviews(reviews: { rating: number; comment: string }[]): {
    totalReviewsAnalyzed: number;
    negativeCount: number;
    painPoints: ReviewPainPoint[];
    recommendedUspBullets: string[];
  } {
    const negativeReviews = reviews.filter(r => r.rating <= 3);
    const painPoints: ReviewPainPoint[] = [];
    const recommendedUsps: string[] = [];

    // Rule-based cluster matching (T0 local analysis)
    const patterns = [
      {
        category: "QUALITY" as const,
        match: /ผ้าบาง|ขาดง่าย|ก๊องแก๊ง|พังง่าย|ไม่ทน|บางมาก/,
        keyword: "เนื้อผ้า/วัสดุบางหรือเปราะบาง",
        usp: "✅ การันตีวัสดุเกรดพรีเมียม หนาพิเศษ ไม่ขาดง่าย ใช้งานได้ยาวนาน"
      },
      {
        category: "DELIVERY" as const,
        match: /ส่งช้า|รอนาน|ดองของ|ส่งไม่ตรงเวลา/,
        keyword: "ระยะเวลาจัดส่งล่าช้า",
        usp: "⚡ จัดส่งด่วนพิเศษภายใน 24 ชม. สินค้าพร้อมส่งทันทีจากคลังในไทย"
      },
      {
        category: "PACKAGING" as const,
        match: /แพ็คไม่ดี|กล่องบุบ|แตกหัก|เสียหาย|ไม่มีกันกระแทก/,
        keyword: "การแพ็คหีบห่อไม่ปลอดภัย",
        usp: "🛡️ แพ็คหนาแน่น ห่อบับเบิ้ลกันกระแทก 3 ชั้น กล่องแข็งแรงปลอดภัย 100%"
      },
      {
        category: "ACCURACY" as const,
        match: /ไม่ตรงปก|ผิดไซส์|สีไม่ตรง|คนละแบบ/,
        keyword: "สินค้าไม่ตรงตามภาพโฆษณา",
        usp: "📸 ภาพถ่ายจากสินค้าจริง 100% ตรงปก ไซส์มาตรฐาน คืนเงินเต็มจำนวนหากไม่ตรงปก"
      }
    ];

    for (const p of patterns) {
      const matching = negativeReviews.filter(r => p.match.test(r.comment));
      if (matching.length > 0) {
        painPoints.push({
          category: p.category,
          keyword: p.keyword,
          mentionCount: matching.length,
          sampleQuotes: matching.slice(0, 3).map(m => m.comment),
          suggestedUspHighlight: p.usp,
        });
        recommendedUsps.push(p.usp);
      }
    }

    return {
      totalReviewsAnalyzed: reviews.length,
      negativeCount: negativeReviews.length,
      painPoints,
      recommendedUspBullets: recommendedUsps,
    };
  }
}
