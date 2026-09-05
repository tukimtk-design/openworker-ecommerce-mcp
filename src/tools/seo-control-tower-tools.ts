import { SeoControlTower, Observation, Recommendation } from "../services/seo/seo-control-tower.js";
import { SeoChangeOrchestrator, ChangeRequest } from "../services/seo/seo-change-orchestrator.js";

const controlTower = new SeoControlTower();
const changeOrchestrator = new SeoChangeOrchestrator();

export async function handleEcommerceSeoControlTower(args: any) {
  const { action, observation, recommendations, limit } = args;

  try {
    if (action === "record_observation") {
      if (!observation) {
        return { isError: true, content: [{ type: "text", text: "Missing observation data" }] };
      }
      const result = controlTower.recordObservation(observation as Observation);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ status: "success", result, llmCallCount: controlTower.llmCallCount })
        }]
      };
    } else if (action === "generate_basket") {
      if (!recommendations || !Array.isArray(recommendations)) {
        return { isError: true, content: [{ type: "text", text: "Missing or invalid recommendations data" }] };
      }
      const result = controlTower.generateDailyDecisionBasket(recommendations as Recommendation[], limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ status: "success", basket: result })
        }]
      };
    } else if (action === "clear_cache") {
      controlTower.clearCache();
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ status: "success", message: "Observation cache cleared" })
        }]
      };
    } else {
        return { isError: true, content: [{ type: "text", text: "Invalid action" }] };
    }
  } catch (error: any) {
    return { isError: true, content: [{ type: "text", text: error.message }] };
  }
}

export async function handleEcommerceSeoChangeOrchestrator(args: any) {
  const { request } = args;

  if (!request) {
    return { isError: true, content: [{ type: "text", text: "Missing change request data" }] };
  }

  try {
    const result = changeOrchestrator.executeChange(request as ChangeRequest);
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ status: "success", result })
      }]
    };
  } catch (error: any) {
    return { isError: true, content: [{ type: "text", text: error.message }] };
  }
}
