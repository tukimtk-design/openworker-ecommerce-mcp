import { XMLBuilder } from 'fast-xml-parser';

export interface SitemapItem {
    url: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}

export interface RssItem {
    title: string;
    description: string;
    link: string;
    pubDate?: string;
    guid?: string;
}

export class SitemapRssGenerator {
    private xmlBuilder: XMLBuilder;

    constructor() {
        this.xmlBuilder = new XMLBuilder({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            format: true
        });
    }

    public generateSitemap(items: SitemapItem[]): string {
        const urlset: any = {
            "@_xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
            url: items.map(item => ({
                loc: item.url,
                ...(item.lastmod ? { lastmod: item.lastmod } : {}),
                ...(item.changefreq ? { changefreq: item.changefreq } : {}),
                ...(item.priority !== undefined ? { priority: item.priority } : {})
            }))
        };

        const xmlString = this.xmlBuilder.build({ urlset });
        return `<?xml version="1.0" encoding="UTF-8"?>\n${xmlString}`;
    }

    public generateRss(title: string, description: string, link: string, items: RssItem[]): string {
        const rss: any = {
            "@_version": "2.0",
            channel: {
                title,
                description,
                link,
                item: items.map(item => ({
                    title: item.title,
                    description: item.description,
                    link: item.link,
                    ...(item.pubDate ? { pubDate: item.pubDate } : {}),
                    ...(item.guid ? { guid: item.guid } : {})
                }))
            }
        };

        const xmlString = this.xmlBuilder.build({ rss });
        return `<?xml version="1.0" encoding="UTF-8"?>\n${xmlString}`;
    }
}
