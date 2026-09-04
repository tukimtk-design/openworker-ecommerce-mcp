import { DomTokenPruner } from "../services/seo/dom-token-pruner.js";

const pruner = new DomTokenPruner();

export async function handleEcommerceDomTokenPruner(args: any) {
  const htmlString = args?.htmlString;

  if (!htmlString) {
    return {
      isError: true,
      content: [{ type: "text", text: "Missing htmlString parameter" }]
    };
  }

  try {
    const result = pruner.prune(htmlString);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            message: "DOM Successfully Pruned",
            data: result
          })
        }
      ]
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: error.message }]
    };
  }
}
