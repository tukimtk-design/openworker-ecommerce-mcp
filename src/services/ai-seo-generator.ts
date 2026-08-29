export interface ProductDetails {
    productName: string;
    category?: string;
    price?: number;
    currency?: string;
    brand?: string;
    features?: string[];
}

export interface SeoGeneratedContent {
    title: string;
    description: string;
    entityData: any;
}

export class AiSeoGenerator {
    private apiUrl: string;
    private apiKey: string;

    constructor(apiUrl?: string, apiKey?: string) {
        this.apiUrl = apiUrl || 'https://api.okmd.example.com/v1/generate';
        this.apiKey = apiKey || 'demo-key';
    }

    public async generateSeoContent(details: ProductDetails): Promise<SeoGeneratedContent> {
        // Build the prompt for the AI
        const prompt = `Generate an SEO optimized title, a compelling meta description (under 160 characters), and JSON-LD entity data for a product with the following details:
Name: ${details.productName}
Category: ${details.category || 'N/A'}
Brand: ${details.brand || 'N/A'}
Price: ${details.price || 'N/A'} ${details.currency || ''}
Features: ${(details.features || []).join(', ')}

Respond in valid JSON format:
{
  "title": "Optimized Title",
  "description": "Optimized Description",
  "entityData": { /* schema.org Product data */ }
}`;

        try {
            // Simulated AI Call for demonstration purposes
            // In production, uncomment the fetch logic

            /*
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({ prompt, response_format: 'json' })
            });

            if (!response.ok) {
                throw new Error(`AI API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data as SeoGeneratedContent;
            */

            // Simulated response
            return {
                title: `Buy ${details.productName} | Best Price Online`,
                description: `Discover the best deals on ${details.productName}. ${details.features ? details.features[0] : 'High quality'} guaranteed. Shop now!`,
                entityData: {
                    name: details.productName,
                    description: `Discover the best deals on ${details.productName}.`,
                    brand: {
                        "@type": "Brand",
                        "name": details.brand || "Generic"
                    },
                    offers: {
                        "@type": "Offer",
                        "priceCurrency": details.currency || "THB",
                        "price": details.price || 0,
                        "availability": "https://schema.org/InStock"
                    }
                }
            };
        } catch (error) {
            console.error("Failed to generate SEO content", error);
            throw error;
        }
    }
}
