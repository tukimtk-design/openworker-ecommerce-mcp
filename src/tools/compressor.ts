import { DomCompressor } from "../services/dom-compressor.js";

const compressor = new DomCompressor();

export async function handleEcommerceContextCompressor(args: any) {
    const domString = args?.domString;

    if (!domString) {
        return { isError: true, content: [{ type: "text", text: "Missing domString" }] };
    }

    try {
        const compressed = compressor.compress(domString);
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", data: compressed }) }]
        };
    } catch (error: any) {
        return { isError: true, content: [{ type: "text", text: error.message }] };
    }
}
