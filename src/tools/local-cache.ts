import { SqliteStore } from "../services/sqlite-store.js";

const store = new SqliteStore();

export async function handleEcommerceLocalSqliteCache(args: any) {
    const action = args?.action;
    const key = args?.key;
    const value = args?.value;

    if (!action || !key) {
        return { isError: true, content: [{ type: "text", text: "Missing action or key" }] };
    }

    try {
        if (action === "get") {
            const result = await store.get(key);
            return {
                content: [{ type: "text", text: JSON.stringify({ status: "success", key, value: result }) }]
            };
        } else if (action === "set") {
            if (value === undefined) {
                 return { isError: true, content: [{ type: "text", text: "Missing value for set action" }] };
            }
            await store.set(key, value);
            return {
                content: [{ type: "text", text: JSON.stringify({ status: "success", message: `Saved key '${key}'` }) }]
            };
        } else {
            return { isError: true, content: [{ type: "text", text: "Invalid action. Use 'get' or 'set'." }] };
        }
    } catch (error: any) {
        return { isError: true, content: [{ type: "text", text: error.message }] };
    }
}
