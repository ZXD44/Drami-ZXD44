import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function connectDB() {
    try {
        await prisma.$connect();
        console.log("[DB] Prisma (SQLite) connected.");
        return true;
    } catch (e) {
        console.error("[DB] Prisma connection error:", e);
        return false;
    }
}

export async function connectRedis() {
    // Redis is currently disabled for local testing
}
