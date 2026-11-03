import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("123456", 10);
    const user = await prisma.user.upsert({
        where: { username: "ZirconX" },
        update: {
            password: hashedPassword,
            role: "admin",
            isBanned: false
        },
        create: {
            username: "ZirconX",
            email: "admin@drami.online",
            password: hashedPassword,
            role: "admin",
            level: 1,
            gold: 100,
            diamonds: 100
        }
    });
    console.log("Seed admin success:", user.username);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
