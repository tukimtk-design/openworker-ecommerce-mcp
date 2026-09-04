export interface ContentEnrichRequest {
    originalContent: string;
    targetKeywords: string[];
    negativeKeywords: string[];
    platform?: 'SHOPEE' | 'TIKTOK_SHOP' | 'LAZADA' | 'LNWSHOP';
}

export interface ContentEnrichResult {
    status: 'READY_FOR_HUMAN_REVIEW' | 'REJECTED_DUE_TO_NEGATIVE_KEYWORDS';
    enrichedContent?: string;
    reason?: string;
}

export class SeoContentEnricher {
    public enrichContent(request: ContentEnrichRequest): ContentEnrichResult {
        const { originalContent, targetKeywords, negativeKeywords } = request;

        const lowerCaseContent = originalContent.toLowerCase();

        // 1. Negative Keyword Guard
        const foundNegativeKeywords = negativeKeywords.filter(kw => 
            lowerCaseContent.includes(kw.toLowerCase())
        );

        if (foundNegativeKeywords.length > 0) {
            return {
                status: 'REJECTED_DUE_TO_NEGATIVE_KEYWORDS',
                reason: `Found negative keywords: ${foundNegativeKeywords.join(', ')}`
            };
        }

        // 2. Generate E-E-A-T Draft
        // Experience, Expertise, Authoritativeness, and Trustworthiness
        let eeatBoilerplate = "\n\n---\n✅ การันตีคุณภาพและความเชี่ยวชาญจากร้านของเรา:\n";
        eeatBoilerplate += "- สินค้าทุกชิ้นผ่านการคัดสรรจากผู้เชี่ยวชาญ (Expertise)\n";
        eeatBoilerplate += "- เรามีประสบการณ์ในการให้บริการลูกค้ามากกว่า 5 ปี (Experience)\n";
        eeatBoilerplate += "- รีวิวจากลูกค้าจริงยืนยันความน่าเชื่อถือ (Authoritativeness)\n";
        eeatBoilerplate += "- ปลอดภัย มั่นใจได้ 100% พร้อมการรับประกันสินค้า (Trustworthiness)\n\n";

        eeatBoilerplate += "🔥 คีย์เวิร์ดที่เกี่ยวข้อง: " + targetKeywords.join(", ");

        const enrichedContent = `${originalContent}${eeatBoilerplate}`;

        return {
            status: 'READY_FOR_HUMAN_REVIEW',
            enrichedContent: enrichedContent
        };
    }
}
