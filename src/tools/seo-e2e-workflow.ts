import { AiSeoGenerator, ProductDetails } from "../services/ai-seo-generator.js";
import { SeoOptimizer, SeoOptimizationOptions } from "../services/seo-optimizer.js";
import { SeoAuditor } from "../services/seo-auditor.js";

const aiGenerator = new AiSeoGenerator();
const optimizer = new SeoOptimizer();
const auditor = new SeoAuditor();

export async function handleEcommerceSeoE2eWorkflow(args: any) {
    const { htmlString, productDetails } = args;

    if (!htmlString || !productDetails || !productDetails.productName) {
        return { isError: true, content: [{ type: "text", text: "Missing htmlString or valid productDetails" }] };
    }

    try {
        // Step 1: Pre-Audit
        const preAudit = auditor.auditHtml(htmlString);

        // Step 2: AI Generate SEO Content
        const generatedContent = await aiGenerator.generateSeoContent(productDetails as ProductDetails);

        // Step 3: Optimize HTML
        const optimizationOptions: SeoOptimizationOptions = {
            title: generatedContent.title,
            description: generatedContent.description,
            entityType: 'Product',
            entityData: generatedContent.entityData
        };
        const { optimizedHtml } = optimizer.optimizeHtml(htmlString, optimizationOptions);

        // Step 4: Post-Audit
        const postAudit = auditor.auditHtml(optimizedHtml);

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    status: "success",
                    message: "E2E SEO Workflow Completed",
                    data: {
                        preAuditScore: preAudit.score,
                        postAuditScore: postAudit.score,
                        improvements: postAudit.score - preAudit.score,
                        generatedContent,
                        optimizedHtml
                    }
                })
            }]
        };

    } catch (error: any) {
        return { isError: true, content: [{ type: "text", text: error.message }] };
    }
}
