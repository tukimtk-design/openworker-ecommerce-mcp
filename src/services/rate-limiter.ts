// Phase 14 Task 14.1: Token-bucket rate limiter + jittered delays.
// Keeps competitor scanning polite: at most `capacity` bursts, refilling at
// `refillPerMinute`, with randomized waits to avoid bot-pattern timing.

export class TokenBucketLimiter {
    private tokens: number;
    private lastRefillAt: number;

    constructor(private capacity: number, private refillPerMinute: number) {
        this.capacity = Math.max(1, capacity);
        this.refillPerMinute = Math.max(1, refillPerMinute);
        this.tokens = this.capacity;
        this.lastRefillAt = Date.now();
    }

    private refill(): void {
        const now = Date.now();
        const elapsedMinutes = (now - this.lastRefillAt) / 60000;
        if (elapsedMinutes > 0) {
            this.tokens = Math.min(this.capacity, this.tokens + elapsedMinutes * this.refillPerMinute);
            this.lastRefillAt = now;
        }
    }

    /** Milliseconds to wait before the next slot is available. */
    msUntilToken(): number {
        this.refill();
        if (this.tokens >= 1) return 0;
        const deficit = 1 - this.tokens;
        return Math.ceil((deficit / this.refillPerMinute) * 60000);
    }

    /** Take one token if available. */
    tryAcquire(): boolean {
        this.refill();
        if (this.tokens >= 1) {
            this.tokens -= 1;
            return true;
        }
        return false;
    }

    /** Wait for a token, then take it. */
    async acquire(): Promise<void> {
        let wait = this.msUntilToken();
        while (wait > 0) {
            await new Promise(r => setTimeout(r, Math.min(wait, 1000)));
            wait = this.msUntilToken();
        }
        this.tryAcquire();
    }

    get availableTokens(): number {
        this.refill();
        return Math.floor(this.tokens);
    }
}

export function jitteredDelayMs(minMs: number, maxMs: number): number {
    return Math.floor(minMs + Math.random() * Math.max(0, maxMs - minMs));
}

export async function sleep(ms: number): Promise<void> {
    if (ms > 0) await new Promise(r => setTimeout(r, ms));
}
