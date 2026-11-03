import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            password: true, // This will be the hashed version
            level: true,
            createdAt: true
        }
    });
    console.log("--- 🕵️ ข้อมูลนักผจญภัยในระบบ ---");
    console.table(users);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
