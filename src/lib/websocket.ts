export class LeaderboardWebSocket {
    private ws: WebSocket | null = null;
    private handlers: Map<string, (data: any) => void> = new Map();

    connect(url: string) {
        this.ws = new WebSocket(url);
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const handler = this.handlers.get(data.type);
            if (handler) handler(data);
        };
    }

    addHandler(type: string, handler: (data: any) => void) {
        this.handlers.set(type, handler);
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
} 