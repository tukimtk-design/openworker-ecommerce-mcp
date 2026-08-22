import { SqliteStore } from "../services/sqlite-store.js";
const store = new SqliteStore();

export async function handleEcommerceTokenTelemetry(args: any) {
    const action = args?.action;

    if (action === "record") {
        const input = args?.inputTokens || 0;
        const output = args?.outputTokens || 0;
        const saved = args?.savedTokens || 0;

        let tokenUsage = { inputTokens: 0, outputTokens: 0, savedTokens: 0 };
        const stored = await store.get("telemetry_global");
        if (stored) {
            tokenUsage = JSON.parse(stored);
        }

        tokenUsage.inputTokens += input;
        tokenUsage.outputTokens += output;
        tokenUsage.savedTokens += saved;

        await store.set("telemetry_global", JSON.stringify(tokenUsage));

        return {
             content: [{ type: "text", text: JSON.stringify({ status: "recorded", usage: tokenUsage }) }]
        };
    } else if (action === "get") {
        let tokenUsage = { inputTokens: 0, outputTokens: 0, savedTokens: 0 };
        const stored = await store.get("telemetry_global");
        if (stored) {
            tokenUsage = JSON.parse(stored);
        }
        return {
             content: [{ type: "text", text: JSON.stringify({ status: "success", usage: tokenUsage }) }]
        };
    }

    return { isError: true, content: [{ type: "text", text: "Invalid action. Use 'record' or 'get'." }] };
}
