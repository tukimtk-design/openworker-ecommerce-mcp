import { CognitionRouter } from "../services/cognition-router.js";

const router = new CognitionRouter();

export async function handleEcommerceCognitionRouter(args: any) {
  const intent = args?.intent;
  const payload = args?.payload || {};

  if (!intent) {
    return { isError: true, content: [{ type: "text", text: "Missing intent in cognition router" }] };
  }

  const classification = router.classifyTask(intent, payload);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          status: "success",
          classification,
        }),
      },
    ],
  };
}
