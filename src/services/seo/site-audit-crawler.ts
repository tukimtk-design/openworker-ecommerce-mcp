import * as cheerio from 'cheerio';
import { XMLParser } from 'fast-xml-parser';

export interface AuditResult {
    score: number;
    issues: string[];
    missingAltImages: number;
    h1HierarchyValid: boolean;
    jsonLdValid: boolean;
}

export class SiteAuditCrawler {
    private xmlParser: XMLParser;

    constructor() {
        this.xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    }

    public auditDom(htmlContent: string): AuditResult {
        const $ = cheerio.load(htmlContent);
        const issues: string[] = [];
        let score = 100;

        // 1. Missing Alt Tags
        let missingAltImages = 0;
        $('img').each((i, el) => {
            const alt = $(el).attr('alt');
            if (!alt || alt.trim() === '') {
                missingAltImages++;
            }
        });
        
        if (missingAltImages > 0) {
            issues.push(`Found ${missingAltImages} image(s) missing alt attributes.`);
            score -= Math.min(20, missingAltImages * 5); // Max -20 for missing alts
        }

        // 2. H1 Hierarchy
        let h1HierarchyValid = true;
        const h1Count = $('h1').length;
        if (h1Count === 0) {
            h1HierarchyValid = false;
            issues.push("Missing H1 tag. A page should have exactly one H1 tag.");
            score -= 15;
        } else if (h1Count > 1) {
            h1HierarchyValid = false;
            issues.push(`Found ${h1Count} H1 tags. A page should ideally have exactly one H1 tag.`);
            score -= 10;
        }

        // Check if H1 comes before H2/H3 (rough hierarchy check)
        const allHeadings = $('h1, h2, h3, h4, h5, h6');
        let highestFound = 6;
        let hierarchyIssue = false;
        
        allHeadings.each((i, el) => {
            const tagName = (el as any).tagName;
            if (tagName) {
                const level = parseInt(tagName.replace('h', ''), 10);
                if (level === 1 && highestFound < 1) {
                     // H1 found after lower tags, not strictly invalid but a warning
                } else if (level < highestFound) {
                     // E.g. H2 followed by H1? We check if an H2 appears before any H1
                     // We will skip strict complex hierarchy for now, H1 count is primary.
                }
            }
        });


        // 3. JSON-LD Validity
        let jsonLdValid = true;
        const jsonLdScripts = $('script[type="application/ld+json"]');
        
        if (jsonLdScripts.length === 0) {
            jsonLdValid = false;
            issues.push("Missing JSON-LD structured data.");
            score -= 20;
        } else {
            jsonLdScripts.each((i, el) => {
                const scriptContent = $(el).html();
                if (scriptContent) {
                    try {
                        const parsed = JSON.parse(scriptContent);
                        if (!parsed['@type'] || !parsed['@context']) {
                             jsonLdValid = false;
                             issues.push("JSON-LD structure missing @type or @context.");
                        }
                    } catch (e) {
                        jsonLdValid = false;
                        issues.push("Invalid JSON-LD syntax.");
                    }
                }
            });
            
            if (!jsonLdValid) {
                score -= 15;
            }
        }

        return {
            score: Math.max(0, score),
            issues,
            missingAltImages,
            h1HierarchyValid,
            jsonLdValid
        };
    }
}
