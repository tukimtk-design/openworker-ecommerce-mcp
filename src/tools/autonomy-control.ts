import { SqliteStore } from "../services/sqlite-store.js";

const store = new SqliteStore();

export interface AutonomyMandate {
  maxPriceChangePercent: number;
  dailyAdBudgetCap: number;
  maxSkusPerBatch: number;
  isKillSwitchActive: boolean;
  isDryRun: boolean;
}

const DEFAULT_MANDATE: AutonomyMandate = {
  maxPriceChangePercent: 15,
  dailyAdBudgetCap: 500,
  maxSkusPerBatch: 20,
  isKillSwitchActive: false,
  isDryRun: true, // Default to dry-run safe mode
};

export async function handleEcommerceAutonomyControl(args: any) {
  const action = args?.action;

  if (!action) {
    return { isError: true, content: [{ type: "text", text: "Missing action in autonomy control" }] };
  }

  const raw = await store.get("system:autonomy_mandate");
  let mandate: AutonomyMandate = raw ? JSON.parse(raw) : { ...DEFAULT_MANDATE };

  if (action === "get_status") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            mandate,
          }),
        },
      ],
    };
  }

  if (action === "set_mandate") {
    if (args?.maxPriceChangePercent !== undefined) mandate.maxPriceChangePercent = Number(args.maxPriceChangePercent);
    if (args?.dailyAdBudgetCap !== undefined) mandate.dailyAdBudgetCap = Number(args.dailyAdBudgetCap);
    if (args?.maxSkusPerBatch !== undefined) mandate.maxSkusPerBatch = Number(args.maxSkusPerBatch);
    if (args?.isDryRun !== undefined) mandate.isDryRun = Boolean(args.isDryRun);

    await store.set("system:autonomy_mandate", JSON.stringify(mandate));
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            message: "Autonomy mandate updated",
            mandate,
          }),
        },
      ],
    };
  }

  if (action === "kill_switch") {
    const activate = Boolean(args?.activate !== undefined ? args.activate : true);
    mandate.isKillSwitchActive = activate;
    await store.set("system:autonomy_mandate", JSON.stringify(mandate));
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            message: activate ? "🛑 EMERGENCY KILL-SWITCH ACTIVATED: All autonomous operations halted." : "✅ KILL-SWITCH DEACTIVATED: Operations resumed.",
            isKillSwitchActive: mandate.isKillSwitchActive,
          }),
        },
      ],
    };
  }

  if (action === "set_dry_run") {
    mandate.isDryRun = Boolean(args?.dryRun !== undefined ? args.dryRun : true);
    await store.set("system:autonomy_mandate", JSON.stringify(mandate));
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            message: mandate.isDryRun ? "Dry-run mode ENABLED (Simulate only, no live changes)." : "Live Execution ENABLED.",
            isDryRun: mandate.isDryRun,
          }),
        },
      ],
    };
  }

  return { isError: true, content: [{ type: "text", text: `Unknown action ${action}` }] };
}
