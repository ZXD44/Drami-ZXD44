import { Room, Client } from "@colyseus/core";
import { Schema, MapSchema, type } from "@colyseus/schema";

import { connectDB, prisma } from "../db";

export class Player extends Schema {
    @type("string") userId: string = "";
    @type("string") role: string = "member";
    @type("number") x: number = 1200;
    @type("number") y: number = 900;
    @type("number") spawnX: number = 1200;
    @type("number") spawnY: number = 900;
    @type("string") username: string = "";
    @type("number") level: number = 1;
    @type("number") gold: number = 0;
    @type("number") diamonds: number = 0;
    @type("number") exp: number = 0;
    @type("string") avatar: string = "";
}

export class WorldEntity extends Schema {
    @type("string") id: string = "";
    @type("string") type: string = "monster"; // 'monster' | 'npc' | 'tree' | 'teleport'
    @type("string") name: string = "";
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") hp: number = 100;
    @type("number") maxHp: number = 100;
}

export class GameState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
    @type({ map: WorldEntity }) entities = new MapSchema<WorldEntity>();
}

export class GameRoom extends Room<any> {
    static activeRooms: GameRoom[] = [];
    maxClients = 100;

    onCreate(options: any) {
        GameRoom.activeRooms.push(this);
        this.setState(new GameState());

        // Spawn Default World NPCs & Monsters
        const defaultEntities: Array<Partial<WorldEntity>> = [
            { id: "npc_elder", type: "npc", name: "Elder Thorne", x: 1250, y: 920, hp: 100, maxHp: 100 },
            { id: "npc_guide", type: "npc", name: "Ranger Lina", x: 1350, y: 980, hp: 100, maxHp: 100 },
            { id: "mob_goblin_1", type: "monster", name: "Forest Goblin", x: 1600, y: 880, hp: 80, maxHp: 80 },
            { id: "mob_goblin_2", type: "monster", name: "Forest Goblin", x: 1750, y: 920, hp: 80, maxHp: 80 },
            { id: "tree_ancient", type: "tree", name: "Ancient Oak", x: 1100, y: 850, hp: 200, maxHp: 200 },
            { id: "teleport_citadel", type: "teleport", name: "Citadel Gate", x: 2400, y: 1800, hp: 1, maxHp: 1 },
        ];

        defaultEntities.forEach(item => {
            const ent = new WorldEntity();
            ent.id = item.id!;
            ent.type = item.type!;
            ent.name = item.name!;
            ent.x = item.x!;
            ent.y = item.y!;
            ent.hp = item.hp || 100;
            ent.maxHp = item.maxHp || 100;
            (this.state as GameState).entities.set(ent.id, ent);
        });

        this.onMessage("admin_spawn_entity", (client, data: { type: string, name: string, x: number, y: number, hp?: number }) => {
            const player = (this.state as GameState).players.get(client.sessionId);
            if (!player || player.role !== "admin") return;

            const ent = new WorldEntity();
            ent.id = `ent_${Date.now()}_${Math.floor(Math.random() * 999)}`;
            ent.type = data.type || "monster";
            ent.name = data.name || "Entity";
            ent.x = Math.round(data.x);
            ent.y = Math.round(data.y);
            ent.hp = data.hp || 100;
            ent.maxHp = data.hp || 100;

            (this.state as GameState).entities.set(ent.id, ent);
            console.log(`[Admin Spawner] ${player.username} spawned ${ent.name} (${ent.type}) at (${ent.x}, ${ent.y})`);
            client.send("chat", { sessionId: "SERVER", message: `[ระบบ] วาง ${ent.name} (${ent.type}) สำเร็จที่ (${ent.x}, ${ent.y})` });
        });

        this.onMessage("admin_remove_entity", (client, data: { id: string }) => {
            const player = (this.state as GameState).players.get(client.sessionId);
            if (!player || player.role !== "admin") return;

            const state = this.state as GameState;
            if (state.entities.has(data.id)) {
                const ent = state.entities.get(data.id);
                state.entities.delete(data.id);
                console.log(`[Admin Spawner] ${player.username} removed entity ${data.id}`);
                client.send("chat", { sessionId: "SERVER", message: `[ระบบ] ลบเอนทิตี ${ent?.name || data.id} ออกจากแผนที่แล้ว` });
            }
        });

        this.onMessage("admin_teleport_to", (client, data: { x: number, y: number }) => {
            const player = (this.state as GameState).players.get(client.sessionId);
            if (!player || player.role !== "admin") return;

            player.x = Math.round(data.x);
            player.y = Math.round(data.y);
            client.send("snapback", { x: player.x, y: player.y });
            client.send("chat", { sessionId: "SERVER", message: `[วาร์ป] เคลื่อนย้ายไปยังพิกัด (${player.x}, ${player.y})` });
        });

        this.onMessage("move", (client, data) => {
            const state = this.state as GameState;
            const player = state.players.get(client.sessionId);
            if (!player || typeof data?.x !== "number" || typeof data?.y !== "number") return;

            // Speedhack / Teleport detection (Distance limit per frame/tick)
            const dx = data.x - player.x;
            const dy = data.y - player.y;
            const distSq = dx * dx + dy * dy;
            const maxAllowedDistance = 450; // max reasonable displacement between packet updates

            if (distSq > maxAllowedDistance * maxAllowedDistance && player.role !== "admin") {
                console.warn(`[Anti-Cheat] Suspicious displacement detected for ${player.username}: distSq=${distSq}`);
                // Reject teleportation, force snapback to valid server coords
                client.send("snapback", { x: player.x, y: player.y });
                return;
            }

            player.x = data.x;
            player.y = data.y;
        });

        this.onMessage("chat", (client, message) => {
            if (typeof message !== "string" || message.trim() === "") return;
            const sanitizedMsg = message.trim().slice(0, 150); // Anti-spam & buffer overload protection
            const player = (this.state as GameState).players.get(client.sessionId);
            this.broadcast("chat", { 
                sessionId: client.sessionId, 
                username: player?.username || "Guest",
                message: sanitizedMsg 
            });
        });

        this.onMessage("cheat_detected", (client) => {
            const state = this.state as GameState;
            const player = state.players.get(client.sessionId);
            if (player && player.userId && player.role !== 'admin') {
                const { tempBans } = require("../index"); // Lazy import to avoid circular dependency
                const banDuration = 60 * 1000; // 1 minute
                tempBans.set(player.userId, Date.now() + banDuration);
                console.warn(`[Anti-Cheat] Player ${player.username} (${player.userId}) BANNED for 1 minute for tampering.`);
                client.leave(4403); // Banned status code
            }
        });

        this.onMessage("set_spawn_point", async (client, data: { x: number, y: number }) => {
            const state = this.state as GameState;
            const player = state.players.get(client.sessionId);
            if (!player || player.role !== "admin") return;

            const targetX = Math.round(data.x);
            const targetY = Math.round(data.y);

            player.spawnX = targetX;
            player.spawnY = targetY;

            if (player.userId && !player.userId.startsWith("guest-")) {
                try {
                    await prisma.user.update({
                        where: { id: player.userId },
                        data: { spawnX: targetX, spawnY: targetY } as any
                    });
                    console.log(`[Spawn] Admin ${player.username} updated spawn point to (${targetX}, ${targetY})`);
                    client.send("chat", { sessionId: "SERVER", message: `[ระบบ] บันทึกจุดเกิดของคุณสำเร็จที่ (${targetX}, ${targetY})` });
                } catch (e) {
                    console.error("[Spawn] Failed to save spawn point:", e);
                }
            }
        });

        this.onMessage("admin_reload_all", (client) => {
            const player = (this.state as GameState).players.get(client.sessionId);
            if (!player || player.role !== "admin") return;

            console.log(`[Admin] Global reload triggered by ${player.username}`);
            this.broadcast("force_reload", { reason: "เซิร์ฟเวอร์มีการอัปเดตระบบ กำลังรีโหลดหน้าเว็บของผู้เล่นทุกคน..." });
        });

        this.onMessage("sync_profile", async (client) => {
            const player = (this.state as GameState).players.get(client.sessionId);
            if (player && player.userId) {
                try {
                    const user = await prisma.user.findUnique({ where: { id: player.userId } });
                    if (user) {
                        player.role = user.role;
                        player.level = user.level;
                        player.gold = user.gold;
                        player.diamonds = (user as any).diamonds || 0;
                        player.exp = user.exp || 0;
                        player.avatar = (user as any).avatar || "";
                        console.log(`[Sync] Updated stats for ${user.username} via sync_profile`);
                    }
                } catch (e) {
                    console.error("Failed to sync profile:", e);
                }
            }
        });
    }

    async onJoin(client: Client, options: any) {
        console.log(`[Join] ${client.sessionId} - UserID: ${options.userId}, Username: ${options.username}`);
        
        const player = new Player();
        player.userId = options.userId; // Link DB ID to game state
        player.username = options.username || `Guest_${client.sessionId.slice(0, 4)}`; // Fallback
        
        // Load from DB if userId provided (and not a guest account)
        if (options.userId && !options.userId.startsWith('guest-')) {
            try {
                const user = await prisma.user.findUnique({ where: { id: options.userId } });
                if (user) {
                    player.username = user.username;
                    player.role = user.role;
                    player.level = user.level;
                    player.gold = user.gold;
                    player.diamonds = (user as any).diamonds || 0;
                    player.exp = user.exp || 0;
                    player.avatar = (user as any).avatar || "";
                    if ((user as any).spawnX) {
                        player.spawnX = (user as any).spawnX;
                        player.spawnY = (user as any).spawnY || 900;
                        player.x = player.spawnX;
                        player.y = player.spawnY;
                    }
                }
            } catch (e) {
                console.error("Failed to load user data on join:", e);
            }
        } else if (options.userId && options.userId.startsWith('guest-')) {
            // It's a guest, already set username from options above
            console.log(`[Join] Guest confirmed: ${player.username}`);
        }

        (this.state as GameState).players.set(client.sessionId, player);
    }

    onLeave(client: Client, consented?: boolean) {
        console.log(client.sessionId, "left. Consented:", consented);
        (this.state as GameState).players.delete(client.sessionId);
    }

    onDispose() {
        console.log(`[Dispose] Room ${this.roomId} disposed.`);
        GameRoom.activeRooms = GameRoom.activeRooms.filter(r => r !== this);
    }
}
