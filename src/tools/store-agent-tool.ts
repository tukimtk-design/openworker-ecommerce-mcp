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
    } else if (action === "configure_watchdog") {
        const products = args?.products;
        if (products !== null && !Array.isArray(products)) {
            return { isError: true, content: [{ type: "text", text: "products must be an array of {productId, currentStock, salesHistory} (or null to disable)" }] };
        }
        loop.setInventoryWatchdog(products === null ? null : {
            products,
            options: {
                useSeasonality: args?.useSeasonality === true,
                leadTimeDays: args?.leadTimeDays,
                targetCoverDays: args?.targetCoverDays,
            },
            autoCreatePo: args?.autoCreatePo !== false,
            notifyOnCritical: args?.notifyOnCritical === true,
            poNote: args?.poNote,
        });
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", message: products === null ? "Inventory watchdog disabled" : `Inventory watchdog configured with ${products.length} products` }) }]
        };
    }

    return { isError: true, content: [{ type: "text", text: "Invalid action. Use start, stop, status, trigger_now, or configure_watchdog." }] };
}
