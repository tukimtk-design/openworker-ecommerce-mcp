import { SiteAuditCrawler } from "../services/seo/site-audit-crawler.js";

const siteAuditCrawler = new SiteAuditCrawler();

export async function handleEcommerceSiteAuditCrawler(args: any) {
    const { htmlContent } = args;

    if (!htmlContent) {
        return { isError: true, content: [{ type: "text", text: "Missing htmlContent parameter" }] };
    }

    try {
        const result = siteAuditCrawler.auditDom(htmlContent);

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    status: "success",
                    message: "Site Audit Processed",
                    auditResult: result
                })
            }]
        };
    } catch (error: any) {
        return { isError: true, content: [{ type: "text", text: error.message }] };
    }
}
