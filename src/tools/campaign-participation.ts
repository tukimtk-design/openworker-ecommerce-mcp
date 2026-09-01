export async function handleEcommerceCampaignParticipation(args: any) {
    const platform = args?.platform;
    const campaignId = args?.campaignId;
    const products = args?.products || [];

    if (!platform || !campaignId) {
        return { isError: true, content: [{ type: "text", text: "Missing platform or campaignId" }] };
    }

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    status: "success",
                    message: `Auto-enrolled ${products.length} products into Campaign ${campaignId} on ${platform}`,
                    enrolledProducts: products
                })
            }
        ]
    };
}
