const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.list = async (req, res) => {
    const role_list = await prisma.user.findMany({
        orderBy: {
            id: "asc",
        },
    });
    res.json(role_list);
};
