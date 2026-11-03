import { prisma } from "../db";
import { logError } from "./logger";

export async function printUsers() {
    try {
        const users = await prisma.user.findMany({
            select: { username: true, email: true, role: true, level: true, exp: true, gold: true, diamonds: true, createdAt: true } as any
        });
        if (users.length > 0) {
            console.log("\n--- 🛡️ รายชื่อนักผจญภัยในระบบ ---");
            console.table(users);
            console.log("-------------------------------\n");
        } else {
            console.log("\n--- 🛡️ ยังไม่มีนักผจญภัยในระบบ ---\n");
        }
    } catch (e) { logError("Failed to fetch users for log", e); }
}
