// Phase 13 Task 13.4: Outbound notifications (LINE Messaging API / Telegram Bot).
// Credentials come from env vars; when they are missing the tool runs in dry-run
// mode (no network call) so automation stays safe in sandboxes and tests.
import { SqliteStore } from "../services/sqlite-store.js";

const store = new SqliteStore();
const NOTIFICATION_LOG_KEY = "notification_log";

interface NotifyResult {
    status: "sent" | "simulated" | "error";
    channel: string;
    detail: string;
}

async function logNotification(entry: NotifyResult & { message: string; at: string }): Promise<void> {
    const stored = await store.get(NOTIFICATION_LOG_KEY);
    let log: any[] = [];
    if (stored) {
        try { log = JSON.parse(stored); } catch (e) { log = []; }
    }
    log.push(entry);
    await store.set(NOTIFICATION_LOG_KEY, JSON.stringify(log.slice(-200)));
}

async function sendLine(message: string, targetId?: string): Promise<NotifyResult> {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) {
        return { status: "simulated", channel: "line", detail: "LINE_CHANNEL_ACCESS_TOKEN not set — dry-run (no message sent)" };
    }
    const to = targetId || process.env.LINE_TARGET_ID;
    if (!to) {
        return { status: "error", channel: "line", detail: "Missing target: provide targetId or LINE_TARGET_ID" };
    }
    try {
        const res = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ to, messages: [{ type: "text", text: message }] }),
            signal: AbortSignal.timeout(10000),
        });
        return res.ok
            ? { status: "sent", channel: "line", detail: `HTTP ${res.status}` }
            : { status: "error", channel: "line", detail: `LINE API HTTP ${res.status}` };
    } catch (e: any) {
        return { status: "error", channel: "line", detail: e.message };
    }
}

async function sendTelegram(message: string, chatId?: string): Promise<NotifyResult> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const to = chatId || process.env.TELEGRAM_CHAT_ID;
    if (!token || !to) {
        return { status: "simulated", channel: "telegram", detail: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set — dry-run (no message sent)" };
    }
    try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: to, text: message }),
            signal: AbortSignal.timeout(10000),
        });
        return res.ok
            ? { status: "sent", channel: "telegram", detail: `HTTP ${res.status}` }
            : { status: "error", channel: "telegram", detail: `Telegram API HTTP ${res.status}` };
    } catch (e: any) {
        return { status: "error", channel: "telegram", detail: e.message };
    }
}

export async function handleEcommerceSendNotification(args: any) {
    const action = args?.action || "send";

    if (action === "send") {
        const channel = args?.channel;
        const message = args?.message;
        if (channel !== "line" && channel !== "telegram") {
            return { isError: true, content: [{ type: "text", text: "channel must be 'line' or 'telegram'" }] };
        }
        if (typeof message !== "string" || message.length === 0) {
            return { isError: true, content: [{ type: "text", text: "message (string) is required" }] };
        }

        const result = channel === "line"
            ? await sendLine(message, args?.targetId)
            : await sendTelegram(message, args?.chatId);

        await logNotification({ ...result, message, at: new Date().toISOString() });

        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", notification: result }) }]
        };
    }

    if (action === "history") {
        const stored = await store.get(NOTIFICATION_LOG_KEY);
        let log: any[] = [];
        if (stored) {
            try { log = JSON.parse(stored); } catch (e) { log = []; }
        }
        const limit = args?.limit || 20;
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "success", notifications: log.slice(-limit).reverse() }) }]
        };
    }

    return { isError: true, content: [{ type: "text", text: "Invalid action. Use 'send' or 'history'." }] };
}
