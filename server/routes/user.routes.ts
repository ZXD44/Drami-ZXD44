import express from "express";
import { matchMaker } from "@colyseus/core";
import { prisma } from "../db";
import { logError } from "../utils/logger";

const router = express.Router();

router.post("/update-avatar", async (req, res) => {
    const { userId, avatarUrl } = req.body;
    if (!userId || !avatarUrl) return res.status(400).json({ error: "Missing data" });
    try {
        await prisma.user.update({ where: { id: userId }, data: { avatar: avatarUrl } as any });
        
        // Sync avatar in active game rooms
        try {
            const rooms = await matchMaker.query({ name: "game" });
            for (const roomData of rooms) {
                const roomInstance = matchMaker.getLocalRoomById(roomData.roomId);
                if (roomInstance) {
                    const state = roomInstance.state as any;
                    for (let [sessionId, player] of state.players.entries()) {
                        if (player.userId === userId) {
                            player.avatar = avatarUrl;
                            console.log(`[Admin] Synced avatar for user ${userId}`);
                        }
                    }
                }
            }
        } catch (e) {}

        res.json({ ok: true });
    } catch (e) { logError("Update Avatar Error", e); res.status(500).json({ error: "Internal Server Error" }); }
});

export default router;
