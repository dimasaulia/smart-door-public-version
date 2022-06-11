const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.list = async (req, res) => {
    const role_list = await prisma.role.findMany({
        orderBy: {
            id: "asc",
        },
    });
    res.json(role_list);
};

exports.detail = async (req, res) => {
    const role = await prisma.role.findUnique({
        where: {
            id: Number(req.params.id),
        },
    });
    res.json(role);
};

exports.create = async (req, res) => {
    const new_role = await prisma.role.create({
        data: {
            name: req.body.name,
        },
    });
    res.json(new_role);
};

exports.delete = async (req, res) => {
    const deleted_role = await prisma.role.delete({
        where: {
            id: Number(req.params.id),
        },
    });
    res.json(deleted_role);
};

exports.update = async (req, res) => {
    //provide default or unupdated value
    const role = await prisma.role.findUnique({
        where: {
            id: Number(req.params.id),
        },
    });

    const updated_role = await prisma.role.update({
        where: {
            id: Number(req.params.id),
        },
        data: {
            name: req.body.name || role.name,
        },
    });
    res.json(updated_role);
};
