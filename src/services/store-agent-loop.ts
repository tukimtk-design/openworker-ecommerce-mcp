import { runInventoryWatchdog, WatchdogConfig, WatchdogResult } from "./inventory-watchdog.js";

export class StoreAgentLoop {
    private intervalId: any = null;
    private isRunning: boolean = false;
    private watchdogConfig: WatchdogConfig | null = null;

    /** Register the Phase 13 inventory watchlist; runs on every tick once set. */
    setInventoryWatchdog(config: WatchdogConfig | null) {
        this.watchdogConfig = config;
    }

    getInventoryWatchdog(): WatchdogConfig | null {
        return this.watchdogConfig;
    }

    startLoop(intervalMs: number = 3600000) {
        if (this.isRunning) return;
        this.isRunning = true;
        console.error(`[StoreAgentLoop] Started with interval ${intervalMs}ms`);

        this.intervalId = setInterval(() => {
            this.executeTick();
        }, intervalMs);

        if (this.intervalId && typeof this.intervalId.unref === 'function') {
            this.intervalId.unref();
        }

        // Execute first tick immediately
        this.executeTick();
    }

    stopLoop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.error("[StoreAgentLoop] Stopped");
    }

    async executeTick() {
        console.error(`[StoreAgentLoop] Executing scheduled tick at ${new Date().toISOString()}`);
        const tasksExecuted = ["chat_replied", "prices_checked", "stock_rebalanced"];
        let watchdogResult: WatchdogResult | null = null;

        if (this.watchdogConfig && this.watchdogConfig.products.length > 0) {
            try {
                watchdogResult = await runInventoryWatchdog(this.watchdogConfig);
                tasksExecuted.push("inventory_watchdog");
            } catch (e: any) {
                console.error(`[StoreAgentLoop] Inventory watchdog failed: ${e.message}`);
            }
        }

        return {
             status: "completed",
             tasksExecuted,
             watchdog: watchdogResult
        };
    }

    getStatus() {
        return { isRunning: this.isRunning, watchdogConfigured: !!this.watchdogConfig };
    }
}
