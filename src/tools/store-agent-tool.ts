import { StoreAgentLoop } from "../services/store-agent-loop.js";

const loop = new StoreAgentLoop();

export async function handleEcommerceAutonomousStoreManager(args: any) {
    const action = args?.action;

    if (action === "start") {
        const interval = args?.intervalMs || 3600000; // default 1 hour
        loop.startLoop(interval);
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", message: `Agent Loop started with interval ${interval}ms` }) }]
        };
    } else if (action === "stop") {
        loop.stopLoop();
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", message: "Agent Loop stopped" }) }]
        };
    } else if (action === "status") {
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", data: loop.getStatus() }) }]
        };
    } else if (action === "trigger_now") {
        const result = await loop.executeTick();
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", message: "Agent tick executed", result }) }]
        };
    }

    return { isError: true, content: [{ type: "text", text: "Invalid action. Use start, stop, status, or trigger_now." }] };
}
