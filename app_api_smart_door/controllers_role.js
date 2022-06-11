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
    try {
        const role = await prisma.role.findUnique({
            where: {
                id: Number(req.params.id),
            },
        });
        if (role === null) throw "Role not found";
        res.json(role);
    } catch (err) {
        res.status(422).json({
            code: 422,
            msg: err,
        });
    }
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
    try {
        const deleted_role = await prisma.role.delete({
            where: {
                id: Number(req.params.id),
            },
        });
        res.json(deleted_role);
    } catch (err) {
        res.status(422).json({
            code: 422,
            title: err.meta.cause || null,
            msg: err,
        });
    }
};

exports.update = async (req, res) => {
    try {
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

        if (role === null) throw "Role not found";
        res.json(updated_role);
    } catch (err) {
        res.status(422).json({
            code: 422,
            msg: err,
        });
    }
};
