import * as cheerio from 'cheerio';

export interface SeoAuditIssue {
    type: 'error' | 'warning' | 'success';
    message: string;
}

export interface SeoAuditResult {
    score: number; // 0-100
    issues: SeoAuditIssue[];
}

export class SeoAuditor {
    public auditHtml(htmlString: string): SeoAuditResult {
        const $ = cheerio.load(htmlString);
        const issues: SeoAuditIssue[] = [];
        let score = 100;
        let deductions = 0;

        // 1. Check Title
        const title = $('head > title').text().trim();
        if (!title) {
            issues.push({ type: 'error', message: 'Missing <title> tag' });
            deductions += 20;
        } else if (title.length < 10 || title.length > 60) {
            issues.push({ type: 'warning', message: 'Title length should be between 10 and 60 characters' });
            deductions += 5;
        } else {
            issues.push({ type: 'success', message: 'Valid <title> tag found' });
        }

        // 2. Check Meta Description
        const description = $('head > meta[name="description"]').attr('content');
        if (!description || description.trim() === '') {
            issues.push({ type: 'error', message: 'Missing meta description' });
            deductions += 20;
        } else if (description.length < 50 || description.length > 160) {
            issues.push({ type: 'warning', message: 'Meta description should be between 50 and 160 characters' });
            deductions += 5;
        } else {
            issues.push({ type: 'success', message: 'Valid meta description found' });
        }

        // 3. Check H1 Tag
        const h1Count = $('h1').length;
        if (h1Count === 0) {
            issues.push({ type: 'error', message: 'Missing <h1> tag' });
            deductions += 15;
        } else if (h1Count > 1) {
            issues.push({ type: 'warning', message: 'Multiple <h1> tags found. Best practice is to have only one.' });
            deductions += 5;
        } else {
            issues.push({ type: 'success', message: 'Exactly one <h1> tag found' });
        }

        // 4. Check Image Alt Attributes
        let missingAltCount = 0;
        let totalImages = 0;
        $('img').each((i, el) => {
            totalImages++;
            const alt = $(el).attr('alt');
            if (!alt || alt.trim() === '') {
                missingAltCount++;
            }
        });

        if (totalImages > 0) {
            if (missingAltCount > 0) {
                issues.push({ type: 'warning', message: `Found ${missingAltCount} out of ${totalImages} images missing 'alt' attributes` });
                deductions += (missingAltCount / totalImages) * 15; // Max 15 points deduction
            } else {
                issues.push({ type: 'success', message: 'All images have alt attributes' });
            }
        }

        // 5. Check for JSON-LD Schema
        let hasJsonLd = false;
        $('script[type="application/ld+json"]').each((i, el) => {
            const content = $(el).html();
            if (content && content.includes('@type')) {
                hasJsonLd = true;
            }
        });

        if (!hasJsonLd) {
            issues.push({ type: 'warning', message: 'Missing JSON-LD structured data' });
            deductions += 10;
        } else {
            issues.push({ type: 'success', message: 'JSON-LD structured data found' });
        }

        score = Math.max(0, Math.round(score - deductions));

        return {
            score,
            issues
        };
    }
}
