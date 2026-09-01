export class DomCompressor {
    compress(domString: string): any {
        if (!domString) return {};
        
        let stripped = domString
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
            .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
            .replace(/<!--[\s\S]*?-->/g, "");

        // Try to find Shopee/TikTok state JSON like __NEXT_DATA__
        let nextData = {};
        const nextMatch = domString.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
        if (nextMatch && nextMatch[1]) {
            try {
                nextData = JSON.parse(nextMatch[1]);
            } catch (e) {
                // Ignore parse errors
            }
        }

        const cleanExcerpt = stripped.substring(0, 1000).replace(/\s+/g, ' ').trim();
        return {
            title: "Compressed Page Data",
            stateData: nextData,
            cleanHtmlExcerpt: cleanExcerpt,
            originalSize: domString.length,
            compressedSize: cleanExcerpt.length + JSON.stringify(nextData).length
        };
    }
}
