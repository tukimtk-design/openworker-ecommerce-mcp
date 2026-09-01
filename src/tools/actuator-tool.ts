import { ActuatorRouter, ActuatorRouteOptions } from "../services/actuator-router.js";

const router = new ActuatorRouter();

export async function handleEcommerceActuatorRouter(args: any) {
  const platform = args?.platform || "SHOPEE";
  const action = args?.action;
  const payload = args?.payload || {};
  const availableChannels = args?.availableChannels;
  const dryRun = args?.dryRun || false;

  if (!action) {
    return { isError: true, content: [{ type: "text", text: "Missing action parameter for actuator router" }] };
  }

  const options: ActuatorRouteOptions = {
    platform,
    action,
    payload,
    availableChannels,
    dryRun,
  };

  const result = router.routeAndExecute(options);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
