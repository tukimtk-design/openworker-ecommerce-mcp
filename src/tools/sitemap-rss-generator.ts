import { SitemapRssGenerator, SitemapItem, RssItem } from "../services/sitemap-rss-generator.js";

const generator = new SitemapRssGenerator();

export async function handleEcommerceSitemapRssGenerator(args: any) {
    const { action, sitemapItems, rssChannel, rssItems } = args;

    if (action === "sitemap") {
        if (!sitemapItems || !Array.isArray(sitemapItems)) {
            return { isError: true, content: [{ type: "text", text: "Missing or invalid sitemapItems" }] };
        }

        try {
            const xml = generator.generateSitemap(sitemapItems as SitemapItem[]);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({ status: "success", data: xml })
                }]
            };
        } catch (e: any) {
             return { isError: true, content: [{ type: "text", text: e.message }] };
        }
    } else if (action === "rss") {
        if (!rssChannel || !rssItems || !Array.isArray(rssItems)) {
            return { isError: true, content: [{ type: "text", text: "Missing rssChannel or rssItems" }] };
        }

        try {
            const xml = generator.generateRss(rssChannel.title, rssChannel.description, rssChannel.link, rssItems as RssItem[]);
             return {
                content: [{
                    type: "text",
                    text: JSON.stringify({ status: "success", data: xml })
                }]
            };
        } catch (e: any) {
            return { isError: true, content: [{ type: "text", text: e.message }] };
        }
    } else {
         return { isError: true, content: [{ type: "text", text: "Invalid action. Must be 'sitemap' or 'rss'" }] };
    }
}
