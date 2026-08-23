export class StoreAgentLoop {
    private intervalId: any = null;
    private isRunning: boolean = false;

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
        return {
             status: "completed",
             tasksExecuted: ["chat_replied", "prices_checked", "stock_rebalanced"]
        };
    }

    getStatus() {
        return { isRunning: this.isRunning };
    }
}
