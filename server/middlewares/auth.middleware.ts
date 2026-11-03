import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "drami_secret_key";

export const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || (user as any).role !== "admin") return res.status(403).json({ error: "Forbidden" });
        (req as any).adminUser = user;
        next();
    } catch (e) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};
