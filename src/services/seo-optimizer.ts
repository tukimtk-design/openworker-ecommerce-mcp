import * as cheerio from 'cheerio';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export interface SeoOptimizationOptions {
    title?: string;
    description?: string;
    keywords?: string;
    entityType?: 'Product' | 'Organization' | 'Article';
    entityData?: any;
}

export class SeoOptimizer {
    private xmlParser: XMLParser;
    private xmlBuilder: XMLBuilder;

    constructor() {
        this.xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
        this.xmlBuilder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    }

    public optimizeHtml(html: string, options: SeoOptimizationOptions): { optimizedHtml: string, jsonLd: any } {
        const $ = cheerio.load(html);

        // Update Title
        if (options.title) {
            let titleEl = $('head > title');
            if (titleEl.length === 0) {
                $('head').append(`<title>${options.title}</title>`);
            } else {
                titleEl.text(options.title);
            }
        }

        // Update Meta Description
        if (options.description) {
            let descEl = $('head > meta[name="description"]');
            if (descEl.length === 0) {
                $('head').append(`<meta name="description" content="${options.description}">`);
            } else {
                descEl.attr('content', options.description);
            }
        }

        // Generate JSON-LD Schema
        let jsonLd = null;
        if (options.entityType && options.entityData) {
            jsonLd = this.generateJsonLd(options.entityType, options.entityData);

            // Remove existing JSON-LD of same type if it exists
            $('head > script[type="application/ld+json"]').each((i, el) => {
                try {
                    const parsed = JSON.parse($(el).html() || '{}');
                    if (parsed['@type'] === options.entityType) {
                        $(el).remove();
                    }
                } catch (e) {
                    // Ignore parsing errors for existing invalid JSON-LD
                }
            });

            // Append new JSON-LD
            $('head').append(`\n    <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n    </script>\n`);
        }

        return {
            optimizedHtml: $.html(),
            jsonLd
        };
    }

    private generateJsonLd(type: string, data: any): any {
        const schema: any = {
            "@context": "https://schema.org",
            "@type": type,
            ...data
        };
        return schema;
    }

    public parseSitemap(xmlString: string): any {
        return this.xmlParser.parse(xmlString);
    }

    public buildSitemap(sitemapData: any): string {
        return this.xmlBuilder.build(sitemapData);
    }
}
