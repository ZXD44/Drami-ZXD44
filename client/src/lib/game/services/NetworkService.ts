import { networkMsg, playerPos, gameSettings } from "$lib/game-ui";
import { getServerUrl } from "$lib/game/config";
import type { Client, Room } from "colyseus.js";

export class NetworkService {
    private client!: Client;
    private room: Room | null = null;
    private addChatMessage: (msg: string) => void;
    private cleanupFns: Array<() => void> = [];

    constructor(addChatMessage: (msg: string) => void) {
        const endpoint = getServerUrl();
        console.log("[NetworkService] Connecting to:", endpoint);
        
        // Initializing colyseus client here to simplify Game.svelte
        import("colyseus.js").then(({ Client }) => {
            this.client = new Client(endpoint);
        });

        this.addChatMessage = addChatMessage;
    }

    public async connect(options: any = {}) {
        try {
            // Wait for client to be initialized if needed, or just import it 
            if (!this.client) {
                const { Client } = await import("colyseus.js");
                const endpoint = getServerUrl();
                this.client = new Client(endpoint);
            }
            this.room = await this.client.joinOrCreate("game", options);
            this.setupListeners();
            return this.room;
        } catch (error) {
            console.error("[NetworkService] Connection failed:", error);
            throw error;
        }
    }

    private setupListeners() {
        if (!this.room) return;

        this.room.onLeave((code: number) => {
            console.log("[NetworkService] Left room with code:", code);
            if (code === 4403) {
                alert("คุณถูกระงับการใช้งานหรือถูกเตะออกจากเซิร์ฟเวอร์");
                localStorage.removeItem("drami_token");
                localStorage.removeItem("drami_user");
                window.location.href = '/';
            }
        });

        const unsubNetwork = networkMsg.subscribe(msg => {
            if (!msg || !this.room) return;
            this.room.send(msg.type, msg.data);
            networkMsg.set(null);
        });
        this.cleanupFns.push(unsubNetwork);
    }

    public getRoom() {
        return this.room;
    }

    public send(type: string, data: any) {
        this.room?.send(type, data);
    }

    public disconnect() {
        this.room?.leave();
        this.cleanupFns.forEach(fn => fn());
    }
}
