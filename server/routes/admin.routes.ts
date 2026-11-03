import express from "express";
import bcrypt from "bcryptjs";
import { matchMaker } from "@colyseus/core";
import { prisma } from "../db";
import { requireAdmin } from "../middlewares/auth.middleware";
import { GameRoom } from "../rooms/GameRoom";

const router = express.Router();

router.get("/users", requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { 
                id: true, 
                username: true, 
                email: true, 
                role: true, 
                level: true, 
                gold: true, 
                diamonds: true,
                exp: true,
                avatar: true,
                isBanned: true,
                createdAt: true 
            } as any,
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (e) { res.status(500).json({ error: "Cannot fetch users" }); }
});

router.put("/users/:id", requireAdmin, async (req, res) => {
    try {
        const id = req.params.id as string;
        const { role, level, gold, diamonds, exp, email, password } = req.body;
        
        let updateData: any = {
            role,
            level: isNaN(Number(level)) ? undefined : Number(level),
            gold: isNaN(Number(gold)) ? undefined : Number(gold),
            diamonds: isNaN(Number(diamonds)) ? undefined : Number(diamonds),
            exp: isNaN(Number(exp)) ? undefined : Number(exp),
            email
        };

        // Aggressive Update: Change password if provided
        if (password && password.trim().length > 0) {
            updateData.password = await bcrypt.hash(password, 10);
            console.log(`[Admin] Forced password reset for user ID: ${id}`);
        }

        await prisma.user.update({
            where: { id },
            data: updateData
        });

        // Real-time update: Sync with active game rooms
        try {
            const rooms = await matchMaker.query({ name: "game" });
            for (const roomData of rooms) {
                const roomInstance = matchMaker.getLocalRoomById(roomData.roomId);
                if (roomInstance) {
                    const state = roomInstance.state as any; // GameState
                    if (state && state.players) {
                        for (let [sessionId, player] of state.players.entries()) {
                            if (player.userId === id) {
                                if (level !== undefined && !isNaN(Number(level))) player.level = Number(level);
                                if (gold !== undefined && !isNaN(Number(gold))) player.gold = Number(gold);
                                if (diamonds !== undefined && !isNaN(Number(diamonds))) player.diamonds = Number(diamonds);
                                if (exp !== undefined && !isNaN(Number(exp))) player.exp = Number(exp);
                                if (role !== undefined) player.role = role;
                                console.log(`[Admin] Synced stats/role for user ${id} in room ${roomData.roomId}`);
                            }
                        }
                    }
                }
            }
        } catch (syncErr) {
            console.error("[Admin] Failed to sync real-time stats:", syncErr);
        }

        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: "Cannot update user" }); }
});

router.delete("/users/:id", requireAdmin, async (req, res) => {
    try {
        const id = req.params.id as string;
        
        // Find current status
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้" });

        const newBanStatus = !(user as any).isBanned;

        // Toggle ban status
        await prisma.user.update({
            where: { id },
            data: { isBanned: newBanStatus } as any
        });

        // If newly banned, kick from active sessions
        if (newBanStatus) {
            try {
                const rooms = await matchMaker.query({ name: "game" });
                for (const roomData of rooms) {
                    const roomInstance = matchMaker.getLocalRoomById(roomData.roomId);
                    if (roomInstance) {
                        const clients = roomInstance.clients;
                        const state = roomInstance.state as any;
                        for (let client of clients) {
                            const player = state.players.get(client.sessionId);
                            if (player && player.userId === id) {
                                console.log(`[Admin] Kicking banned user ${id} from room ${roomData.roomId}`);
                                client.leave(4403); // Status code for banned/kicked
                            }
                        }
                    }
                }
            } catch (syncErr) {
                console.error("[Admin] Failed to kick user from sessions:", syncErr);
            }
        }

        res.json({ ok: true, isBanned: newBanStatus });
    } catch (e) { res.status(500).json({ error: "Cannot toggle ban state" }); }
});

router.get("/stats", requireAdmin, async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalGold = await prisma.user.aggregate({ _sum: { gold: true } });
        const totalDiamonds = await prisma.user.aggregate({ _sum: { diamonds: true } });
        const avgLevel = await prisma.user.aggregate({ _avg: { level: true } });
        res.json({
            totalUsers,
            totalGold: totalGold._sum.gold || 0,
            totalDiamonds: totalDiamonds._sum.diamonds || 0,
            avgLevel: Math.round(avgLevel._avg.level || 0)
        });
    } catch (e) { res.status(500).json({ error: "Stats failed" }); }
});

router.post("/set-spawn", requireAdmin, async (req, res) => {
    const { userId, x, y } = req.body;
    try {
        const targetX = Math.round(Number(x));
        const targetY = Math.round(Number(y));
        
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { spawnX: targetX, spawnY: targetY } as any
            });
        }

        res.json({ ok: true, spawnX: targetX, spawnY: targetY });
    } catch (e) {
        res.status(500).json({ error: "Failed to update spawn" });
    }
});

router.post("/reload-all", requireAdmin, async (req, res) => {
    try {
        GameRoom.activeRooms.forEach(room => {
            room.broadcast("force_reload", { 
                reason: "แอดมินสั่งรีเฟรชหน้าเว็บของผู้เล่นทุกคนเพื่ออัปเดตระบบ" 
            });
        });
        console.log(`[Admin] Forced global reload sent to ${GameRoom.activeRooms.length} rooms`);
        res.json({ ok: true });
    } catch (e) {
        console.error("Reload-all failed:", e);
        res.status(500).json({ error: "Reload failed" });
    }
});

router.post("/broadcast", requireAdmin, async (req, res) => {
    const { message } = req.body;
    try {
        // Direct broadcast via our activeRooms registry for reliability
        GameRoom.activeRooms.forEach(room => {
            room.broadcast("chat", { 
                sessionId: "SERVER", 
                message: `📢 [ประกาศ] ${message}` 
            });
        });
        
        console.log(`[Admin] Global broadcast sent to ${GameRoom.activeRooms.length} rooms: ${message}`);
        res.json({ ok: true });
    } catch (e) { 
        console.error("Broadcast failed:", e);
        res.status(500).json({ error: "Broadcast failed" }); 
    }
});

router.get("/items", requireAdmin, async (req, res) => {
    try {
        const items = await prisma.item.findMany();
        res.json(items);
    } catch (e) { res.status(500).json({ error: "Failed to fetch items" }); }
});

router.post("/give-item", requireAdmin, async (req, res) => {
    const { userId, itemId, amount } = req.body;
    try {
        await prisma.inventory.create({ data: { userId, itemId, amount: Number(amount) || 1 } });
        
        // Notify user about item receipt in real-time
        try {
            const rooms = await matchMaker.query({ name: "game" });
            for (const roomData of rooms) {
                const roomInstance = matchMaker.getLocalRoomById(roomData.roomId);
                if (roomInstance) {
                    const clients = roomInstance.clients;
                    for (let client of clients) {
                        const state = roomInstance.state as any;
                        const player = state.players.get(client.sessionId);
                        if (player && player.userId === userId) {
                            client.send("chat", { 
                                sessionId: "Server", 
                                message: `[SYSTEM] คุณได้รับไอเทมใหม่! กรุณาตรวจสอบหน้าต่างกระเป๋าเดินทาง` 
                            });
                            client.send("inventory_update", { itemId, amount });
                        }
                    }
                }
            }
        } catch (e) {}

        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: "Failed to give item" }); }
});

export default router;
