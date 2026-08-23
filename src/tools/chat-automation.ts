export async function handleEcommerceAutoReplyChat(args: any) {
    const platform = args?.platform;
    const action = args?.action;

    if (!platform || !action) {
         return { isError: true, content: [{ type: "text", text: "Missing platform or action" }] };
    }

    if (action === "fetch_unread") {
         return {
             content: [{
                 type: "text",
                 text: JSON.stringify({
                     status: "success",
                     messages: [
                         { id: "M1", sender: "UserA", text: "มีของไหมครับ", timestamp: new Date().toISOString() }
                     ]
                 })
             }]
         };
    } else if (action === "reply") {
         const messageId = args?.messageId;
         const replyText = args?.replyText;

         if (!messageId || !replyText) {
              return { isError: true, content: [{ type: "text", text: "Missing messageId or replyText" }] };
         }

         return {
              content: [{ type: "text", text: JSON.stringify({ status: "success", message: `Replied to ${messageId} on ${platform}` }) }]
         };
    }

    return { isError: true, content: [{ type: "text", text: "Invalid action. Use fetch_unread or reply." }] };
}
