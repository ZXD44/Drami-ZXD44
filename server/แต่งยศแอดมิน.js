const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const username = "ZirconX";
    try {
        const user = await prisma.user.update({
            where: { username: username },
            data: { role: "admin" }
        });
        console.log(`✅ Success! User "${username}" is now an admin.`);
        console.log(user);
    } catch (error) {
        console.error(`❌ Error updating user "${username}":`, error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
