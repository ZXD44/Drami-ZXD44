import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { logError } from "../utils/logger";
import { tempBans } from "../store/tempBans";
import { printUsers } from "../utils/debug";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "drami_secret_key";

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    try {
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) return res.status(400).json({ error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" });
        const validEmail = email && email.trim() !== "" ? email.trim() : null;
        if (validEmail) {
            const existingEmail = await prisma.user.findUnique({ where: { email: validEmail } });
            if (existingEmail) return res.status(400).json({ error: "อีเมลนี้ถูกใช้งานแล้ว" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { username, email: validEmail, password: hashedPassword }
        });
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
        await printUsers();
        res.status(201).json({ 
            ok: true, token, 
            user: { id: user.id, username: user.username, role: (user as any).role, avatar: (user as any).avatar } 
        });
    } catch (e) {
        logError("Register Error", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });

        // Check if banned
        if ((user as any).isBanned) {
            return res.status(403).json({ error: "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ" });
        }

        // Check if Temp Banned (Anti-Cheat)
        const banExpiry = tempBans.get(user.id);
        if (banExpiry && Date.now() < banExpiry) {
            const remaining = Math.ceil((banExpiry - Date.now()) / 1000);
            return res.status(403).json({ error: `🚨 บัญชีถูกระงับชั่วคราวจากการพยายามดัดแปลงข้อมูล (รอ ${remaining} วินาที)` });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ 
            ok: true, token, 
            user: { id: user.id, username: user.username, role: (user as any).role, avatar: (user as any).avatar } 
        });
    } catch (e) {
        logError("Login Error", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
