const websocketService = {
    config: {
        url: import.meta.env.VITE_API_URL,
        reconnectInterval: 50000,
        maxRetries: 10
    },

    connect(gameCode: string, displayName: string, saveDisplayName: boolean): Promise<WebSocket> {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`${this.config.url}/games/${gameCode}?displayName=${displayName}&saveDisplayName=${saveDisplayName}`);

            // returns a promise that resolves when the connection is open
            ws.onopen = () => {
                console.log(`[WebSocket Connected] ${this.config.url}/games/${gameCode}`);
                resolve(ws);
            };

            // returns a promise that rejects when the connection fails
            ws.onerror = (error) => {
                console.error("[WebSocket Error]", error);
                reject(error);
            };
        });
    },

    async reconnect(gameCode: string, displayName: string, saveDisplayName: boolean, attempt = 1): Promise<WebSocket> {
        if (attempt > this.config.maxRetries) {
            throw new Error('Max reconnection attempts exceeded');
        }

        try {
            // Wait for the specified interval before attempting to reconnect
            console.warn(`[WebSocket Reconnect Attempt ${attempt}]`);
            await new Promise(resolve => setTimeout(resolve, this.config.reconnectInterval));
            return await this.connect(gameCode, displayName, saveDisplayName);
        } catch (error) {
            return this.reconnect(gameCode, displayName, saveDisplayName, attempt + 1);
        }
    }
};

export default websocketService;