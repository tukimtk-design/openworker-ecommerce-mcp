import * as cheerio from "cheerio";

export interface PrunedSchema {
  headings: {
    level: string;
    text: string;
  }[];
  metaTags: {
    name?: string;
    property?: string;
    content?: string;
    rel?: string;
    href?: string;
  }[];
  jsonLd: any[];
  images: {
    src?: string;
    alt?: string;
  }[];
}

export class DomTokenPruner {
  /**
   * Compresses an HTML string by extracting only SEO and structural elements
   * while discarding scripts, styles, SVGs, comments, classes, and presentation tags.
   */
  public prune(htmlString: string): PrunedSchema {
    if (!htmlString) {
      return {
        headings: [],
        metaTags: [],
        jsonLd: [],
        images: []
      };
    }

    const $ = cheerio.load(htmlString);

    // Arrays to collect extracted data
    const headings: PrunedSchema['headings'] = [];
    const metaTags: PrunedSchema['metaTags'] = [];
    const jsonLd: PrunedSchema['jsonLd'] = [];
    const images: PrunedSchema['images'] = [];

    // 1. Extract Headings (h1-h6)
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const text = $(el).text().trim();
      // Use el.name for the tag name in Cheerio
      const tagName = (el as any).name || (el as any).tagName;
      if (text && tagName) {
        headings.push({
          level: tagName.toLowerCase(),
          text
        });
      }
    });

    // 2. Extract Meta tags (title, description, keywords, canonical)
    // First, grab the actual <title> tag
    const titleText = $('title').text().trim();
    if (titleText) {
      metaTags.push({
        name: 'title',
        content: titleText
      });
    }

    // Grab relevant meta tags
    $('meta').each((_, el) => {
      const name = $(el).attr('name');
      const property = $(el).attr('property');
      const content = $(el).attr('content');

      if (content && (name === 'description' || name === 'keywords' || (property && property.startsWith('og:')) || name === 'title')) {
        const tag: any = { content };
        if (name) tag.name = name;
        if (property) tag.property = property;
        metaTags.push(tag);
      }
    });

    // Grab canonical link
    $('link[rel="canonical"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        metaTags.push({
          rel: 'canonical',
          href
        });
      }
    });

    // 3. Extract JSON-LD
    $('script[type="application/ld+json"]').each((_, el) => {
      const scriptContent = $(el).html();
      if (scriptContent) {
        try {
          const parsed = JSON.parse(scriptContent);
          jsonLd.push(parsed);
        } catch (e) {
          // Ignore invalid JSON-LD
        }
      }
    });

    // 4. Extract Images (src, alt)
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt') || '';

      if (src) {
        images.push({
          src,
          alt
        });
      }
    });

    return {
      headings,
      metaTags,
      jsonLd,
      images
    };
  }
}
