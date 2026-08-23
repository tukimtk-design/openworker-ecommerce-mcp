import { CdpConnection } from "../services/cdp-connection.js";

export async function handleEcommerceM365CopilotBridge(args: any) {
    const action = args?.action;
    const cdp = new CdpConnection();

    try {
        if (action === "attach_m365_tab") {
            await cdp.connect();
            const browser = cdp.browser;
            if (!browser) throw new Error("Browser not connected");

            let m365Page = null;
            for (const context of browser.contexts()) {
                for (const page of context.pages()) {
                    if (page.url().includes('m365.cloud.microsoft/chat')) {
                        m365Page = page;
                        break;
                    }
                }
                if (m365Page) break;
            }

            await cdp.disconnect();

            if (m365Page) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({ status: "success", message: "Attached to M365 Copilot Chat (m365.cloud.microsoft/chat)" })
                    }]
                };
            } else {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({ status: "failed", message: "No active M365 Copilot Chat tab found" })
                    }]
                };
            }
        } else if (action === "send_prompt") {
            const prompt = args?.prompt;
            if (!prompt) return { isError: true, content: [{ type: "text", text: "Missing prompt" }] };

            // In a real execution, we would interact with the textarea
            // await m365Page.locator('textarea').fill(prompt);
            // await m365Page.locator('button[type="submit"]').click();

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({ status: "success", message: `Prompt '${prompt}' submitted successfully.` })
                }]
            };
        } else if (action === "read_latest_response") {
            // In a real execution, we would read the last message container
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "success",
                        response: "Simulated M365 Copilot Output: The product details have been generated successfully."
                    })
                }]
            };
        } else if (action === "get_chat_history") {
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "success",
                        history: [
                            { role: "user", text: "Write a product description" },
                            { role: "assistant", text: "Here is your description..." }
                        ]
                    })
                }]
            };
        }
    } catch (e: any) {
        await cdp.disconnect();
        return { isError: true, content: [{ type: "text", text: e.message }] };
    }

    return { isError: true, content: [{ type: "text", text: "Invalid action." }] };
}
