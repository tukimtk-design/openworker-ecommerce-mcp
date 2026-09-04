import { SeoContentEnricher, ContentEnrichRequest } from "../services/seo/seo-content-enricher.js";

const seoContentEnricher = new SeoContentEnricher();

export async function handleEcommerceSeoContentEnricher(args: any) {
    const { originalContent, targetKeywords, negativeKeywords, platform } = args;

    if (!originalContent) {
        return { isError: true, content: [{ type: "text", text: "Missing originalContent parameter" }] };
    }

    if (!targetKeywords || !Array.isArray(targetKeywords)) {
        return { isError: true, content: [{ type: "text", text: "Missing or invalid targetKeywords parameter (must be array)" }] };
    }

    if (!negativeKeywords || !Array.isArray(negativeKeywords)) {
        return { isError: true, content: [{ type: "text", text: "Missing or invalid negativeKeywords parameter (must be array)" }] };
    }

    try {
        const request: ContentEnrichRequest = {
            originalContent,
            targetKeywords,
            negativeKeywords,
            platform
        };

        const result = seoContentEnricher.enrichContent(request);

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    status: "success",
                    message: "Content Enrichment Processed",
                    enrichmentResult: result
                })
            }]
        };
    } catch (error: any) {
        return { isError: true, content: [{ type: "text", text: error.message }] };
    }
}
