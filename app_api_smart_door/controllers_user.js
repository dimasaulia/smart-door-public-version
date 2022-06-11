const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

exports.list = async (req, res) => {
    const role_list = await prisma.user.findMany({
        orderBy: {
            id: "asc",
        },
    });
    res.json(role_list);
};

exports.register = async (req, res) => {
    const username = req.body.username;
    const plaintextPassword = req.body.password;
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashPassword = bcrypt.hashSync(plaintextPassword, salt);

    try {
        const default_role = await prisma.role.findUnique({
            where: {
                name: "USER",
            },
        });
        if (default_role === null) throw "DEFAULT ROLE CANT FIND";

        const new_user = await prisma.user.create({
            data: {
                username: username,
                password: hashPassword,
                roleId: Number(default_role.id),
            },
        });

        res.status(201).json({
            status: 201,
            title: "Successfully created",
            msg: new_user,
        });
    } catch (err) {
        res.status(422).json({
            code: 422,
            msg: err,
        });
    }
};

exports.detail = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: Number(req.params.id),
            },
        });
        if (user === null) throw "User not found";
        res.json(user);
    } catch (err) {
        res.status(422).json({
            code: 422,
            msg: err,
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted_user = await prisma.user.delete({
            where: {
                id: Number(req.params.id),
            },
        });
        res.json(deleted_user);
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
        const user = await prisma.user.findUnique({
            where: {
                id: Number(req.params.id),
            },
        });

        // CEK OLD PASSWORD MATCH
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        const passCompare = bcrypt.compareSync(oldPassword, user.password);

        if (user === null) throw "User not found";
        if (!passCompare) throw "Password not match";

        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const newHashPassword = bcrypt.hashSync(newPassword, salt);

        const updatedUser = await prisma.user.update({
            where: {
                id: Number(req.params.id),
            },
            data: {
                username: req.body.name,
                password: newHashPassword,
                roleId: user.roleId,
            },
        });

        res.status(201).json({
            code: 201,
            title: "Succsessfully update",
            updatedUser,
        });
    } catch (err) {
        res.status(422).json({
            code: 422,
            msg: err,
        });
    }
};
