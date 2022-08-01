const { PrismaClient } = require("@prisma/client");
const { user, role } = require("./superAdmin");
const prisma = new PrismaClient();

async function main() {
    for (let r of role) {
        const { name } = r;
        console.log(name);
        await prisma.role.create({
            data: {
                name,
            },
        });
    }

    for (let u of user) {
        const { username, email, password, role } = u;
        console.log(username, email, password, role);
        await prisma.user.create({
            data: {
                role: {
                    connect: {
                        name: role,
                    },
                },
                username,
                email,
                password,
                profil: {
                    create: {
                        full_name: username,
                    },
                },
            },
        });
    }
}

main()
    .catch((e) => {
        console.log(e);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
