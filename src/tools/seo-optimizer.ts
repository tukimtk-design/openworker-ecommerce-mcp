import { SeoOptimizer, SeoOptimizationOptions } from "../services/seo-optimizer.js";

const seoOptimizer = new SeoOptimizer();

export async function handleEcommerceSeoOptimizer(args: any) {
    const { htmlString, title, description, entityType, entityData } = args;

    if (!htmlString) {
        return { isError: true, content: [{ type: "text", text: "Missing htmlString parameter" }] };
    }

    try {
        const options: SeoOptimizationOptions = {
            title,
            description,
            entityType,
            entityData
        };

        const result = seoOptimizer.optimizeHtml(htmlString, options);

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    status: "success",
                    message: "HTML Optimized Successfully",
                    optimizedHtml: result.optimizedHtml,
                    jsonLd: result.jsonLd
                })
            }]
        };
    } catch (error: any) {
        return { isError: true, content: [{ type: "text", text: error.message }] };
    }
}
