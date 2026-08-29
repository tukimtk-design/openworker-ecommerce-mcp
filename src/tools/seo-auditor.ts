import { SeoAuditor } from "../services/seo-auditor.js";

const seoAuditor = new SeoAuditor();

export async function handleEcommerceSeoAuditor(args: any) {
    const { htmlString } = args;

    if (!htmlString) {
        return { isError: true, content: [{ type: "text", text: "Missing htmlString parameter" }] };
    }

    try {
        const result = seoAuditor.auditHtml(htmlString);

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    status: "success",
                    message: "SEO Audit Completed",
                    data: result
                })
            }]
        };
    } catch (error: any) {
        return { isError: true, content: [{ type: "text", text: error.message }] };
    }
}
