import { SeoAuditor } from "../services/seo-auditor.js";

const auditor = new SeoAuditor();

export async function handleEcommerceCompetitorSeoAnalyzer(args: any) {
    const { ourHtmlString, competitorHtmlString, competitorName } = args;

    if (!ourHtmlString || !competitorHtmlString) {
        return { isError: true, content: [{ type: "text", text: "Missing ourHtmlString or competitorHtmlString" }] };
    }

    try {
        const ourAudit = auditor.auditHtml(ourHtmlString);
        const competitorAudit = auditor.auditHtml(competitorHtmlString);

        const comparison = {
            ourScore: ourAudit.score,
            competitorScore: competitorAudit.score,
            competitorName: competitorName || "Unknown Competitor",
            difference: ourAudit.score - competitorAudit.score,
            winner: ourAudit.score > competitorAudit.score ? "Our Store" : (ourAudit.score < competitorAudit.score ? "Competitor" : "Tie"),
            ourIssues: ourAudit.issues.filter(i => i.type === 'error' || i.type === 'warning'),
            competitorIssues: competitorAudit.issues.filter(i => i.type === 'error' || i.type === 'warning')
        };

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    status: "success",
                    message: "Competitor SEO Analysis Completed",
                    data: comparison
                })
            }]
        };
    } catch (error: any) {
        return { isError: true, content: [{ type: "text", text: error.message }] };
    }
}
