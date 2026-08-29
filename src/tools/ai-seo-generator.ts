import { AiSeoGenerator, ProductDetails } from "../services/ai-seo-generator.js";

const aiSeoGenerator = new AiSeoGenerator();

export async function handleEcommerceAiSeoGenerator(args: any) {
    const { productName, category, price, currency, brand, features } = args;

    if (!productName) {
        return { isError: true, content: [{ type: "text", text: "Missing productName parameter" }] };
    }

    try {
        const details: ProductDetails = {
            productName,
            category,
            price,
            currency,
            brand,
            features
        };

        const result = await aiSeoGenerator.generateSeoContent(details);

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    status: "success",
                    message: "AI SEO Content Generated Successfully",
                    data: result
                })
            }]
        };
    } catch (error: any) {
        return { isError: true, content: [{ type: "text", text: error.message }] };
    }
}
