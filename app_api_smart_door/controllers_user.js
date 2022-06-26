const { PrismaClient } = require("@prisma/client");
const { setAuthCookie } = require("../services/auth");
const { resError, resSuccess } = require("../services/error");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const saltRounds = 10;

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // try find the user
        const user = await prisma.user.findUnique({
            where: {
                username,
            },
            select: {
                id: true,
                username: true,
                password: true,
                email: true,
                role: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        // give response if cant find the user
        if (user === null) throw "Username not match";
        // compare user and password
        const auth = bcrypt.compareSync(password, user.password);
        // give response if password not match
        if (!auth) throw "Username and password didn't match";

        setAuthCookie({ res, uuid: user.id });
        return resSuccess({
            res,
            title: "Berhasil login",
            data: {
                username: user.username,
                email: user.email,
                id: user.id,
                role: user.role.name,
            },
        });
    } catch (err) {
        return resError({ res, title: "Gagal Login", errors: err });
    }
};

exports.register = async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const plaintextPassword = req.body.password;
    const hashPassword = bcrypt.hashSync(
        plaintextPassword,
        bcrypt.genSaltSync(saltRounds)
    );

    try {
        const defaultRole = await prisma.role.findUnique({
            where: {
                name: "USER",
            },
        });
        if (defaultRole === null) throw "DEFAULT ROLE CANT FIND";

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashPassword,
                roleId: Number(defaultRole.id),
            },
            select: {
                id: true,
                username: true,
                email: true,
                roleId: true,
            },
        });

        setAuthCookie({ res, uuid: newUser.id });

        return resSuccess({ res, title: "Berhasil regsitrasi", data: newUser });
    } catch (err) {
        return resError({ res, title: "Gagal merigistrasi user", errors: err });
    }
};

exports.list = async (req, res) => {
    const roleList = await prisma.user.findMany({
        orderBy: {
            id: "asc",
        },
    });
    res.json(roleList);
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
        const deletedUser = await prisma.user.delete({
            where: {
                id: Number(req.params.id),
            },
        });
        res.json(deletedUser);
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
                username: req.body.username,
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
                id: Number(user.id),
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

exports.pairUserToCard = async (req, res) => {
    const userId = req.body.userId;
    const cardNumber = req.body.cardNumber;
    const user = await prisma.user.update({
        where: {
            username: userId,
        },
        data: {
            card: {
                connect: {
                    card_number: cardNumber,
                },
                update: {
                    where: {
                        card_number: cardNumber,
                    },
                    data: {
                        card_status: "REGISTER",
                    },
                },
            },
        },
    });

    setTimeout(() => res.json(user), 1500);
};

exports.search = async (req, res) => {
    const searchArg = req.query.term;
    const results = [];
    const searchResult = await prisma.user.findMany({
        where: {
            username: {
                contains: searchArg,
            },
        },
        select: {
            username: true,
            id: true,
        },
    });

    searchResult.forEach((user) => {
        let { username, id } = user;
        results.push({ value: username, label: username });
    });

    res.status(200).json(results);
};
