import { HybridExecutor } from "../services/hybrid-executor.js";

const executor = new HybridExecutor();

export async function handleEcommerceHybridExecutor(args: any) {
    const taskDetails = args?.taskDetails;

    if (!taskDetails) {
        return { isError: true, content: [{ type: "text", text: "Missing taskDetails" }] };
    }

    try {
        const result = await executor.executeTask(taskDetails);
        return {
            content: [{ type: "text", text: JSON.stringify(result) }]
        };
    } catch (error: any) {
        return { isError: true, content: [{ type: "text", text: error.message }] };
    }
}
