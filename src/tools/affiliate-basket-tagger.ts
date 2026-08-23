export async function handleEcommerceAffiliateBasketTagger(args: any) {
    const platform = args?.platform;
    const productId = args?.productId;
    const affiliateCode = args?.affiliateCode;

    if (!platform || !productId || !affiliateCode) {
        return { isError: true, content: [{ type: "text", text: "Missing platform, productId, or affiliateCode" }] };
    }

    const affiliateLink = `https://${platform}.com/product/${productId}?aff_id=${affiliateCode}`;
    const basketConfig = {
        platform,
        productId,
        affiliateLink,
        basketColor: platform === "tiktok" ? "yellow" : "orange", // ตะกร้าเหลือง/ส้ม
        commissionRateEstimate: "15%"
    };

    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", basketConfig }) }]
    };
}
