export interface ProxyConfig {
    server: string;
    username?: string;
    password?: string;
}

export class ProxyManager {
    private proxies: ProxyConfig[] = [];
    private currentIndex = 0;

    constructor(initialProxies: ProxyConfig[] = []) {
        this.proxies = initialProxies;
    }

    addProxy(proxy: ProxyConfig) {
        this.proxies.push(proxy);
    }

    getNextProxy(): ProxyConfig | null {
        if (this.proxies.length === 0) {
            return null;
        }

        const proxy = this.proxies[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
        return proxy;
    }

    getAllProxies(): ProxyConfig[] {
        return [...this.proxies];
    }

    removeProxy(serverUrl: string) {
        this.proxies = this.proxies.filter(p => p.server !== serverUrl);
        // adjust index if needed
        if (this.currentIndex >= this.proxies.length) {
            this.currentIndex = 0;
        }
    }
}
