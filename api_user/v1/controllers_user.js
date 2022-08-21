const { PrismaClient } = require("@prisma/client");
const {
    setAuthCookie,
    getUser,
    encryptPassword,
} = require("../../services/auth");
const { ErrorException } = require("../../services/responseHandler");
const { resError, resSuccess } = require("../../services/responseHandler");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const ITEM_LIMIT = Number(process.env.CARD_ITEM_LIMIT) || 10;

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
        if (user === null)
            throw new ErrorException({
                type: "username",
                detail: "Cant find the user",
            });

        // compare user and password
        const auth = bcrypt.compareSync(password, user.password);
        // give response if password not match
        if (!auth)
            throw new ErrorException({
                type: "password",
                detail: "Username and Password didn't match",
            });

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
        return resError({ res, title: "Gagal Login", errors: err, code: 401 });
    }
};

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: encryptPassword(password),
                role: { connect: { name: "USER" } },
                profil: {
                    create: {
                        full_name: username,
                    },
                },
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

module.exports.logout = (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/auth/login");
};

exports.detail = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.params.id,
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
                id: req.params.id,
            },
        });
        return resSuccess({
            res,
            title: "Success delete user",
            data: deletedUser,
        });
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
                id: getUser(req),
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
                id: getUser(req),
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
    const username = req.body.username;
    const cardNumber = req.body.cardNumber;
    const user = await prisma.user.update({
        where: {
            username,
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
            role: {
                name: "USER",
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

exports.list = async (req, res) => {
    try {
        const { search, cursor } = req.query;
        let userList;

        if (search) {
            if (!cursor) {
                userList = await prisma.user.findMany({
                    where: {
                        username: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    orderBy: {
                        username: "asc",
                    },
                    take: ITEM_LIMIT,
                    include: {
                        profil: true,
                        role: true,
                    },
                });
            }

            if (cursor) {
                userList = await prisma.user.findMany({
                    where: {
                        username: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    take: ITEM_LIMIT,
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                    include: {
                        profil: true,
                        role: true,
                    },
                });
            }
        }

        if (!search) {
            if (!cursor) {
                userList = await prisma.user.findMany({
                    orderBy: {
                        username: "asc",
                    },
                    take: ITEM_LIMIT,
                    include: {
                        profil: true,
                        role: true,
                    },
                });
            }
            if (cursor) {
                userList = await prisma.user.findMany({
                    orderBy: {
                        username: "asc",
                    },
                    take: ITEM_LIMIT,
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                    include: {
                        profil: true,
                        role: true,
                    },
                });
            }
        }

        return resSuccess({
            res,
            title: "Success get user list",
            data: userList,
        });
    } catch (error) {
        return resError({
            res,
            title: "Cant get user list",
            errors: error,
        });
    }
};

exports.setAdminRole = async (req, res) => {
    const uuid = req.params.id;
    try {
        const updatedUser = await prisma.user.update({
            where: {
                id: uuid,
            },
            data: {
                role: {
                    connect: {
                        name: "ADMIN",
                    },
                },
            },
            include: {
                role: true,
            },
        });
        return resSuccess({
            res,
            title: "Success update user role",
            data: updatedUser,
        });
    } catch (error) {
        return resError({
            res,
            title: "Cant update user role",
            errors: error,
        });
    }
};

exports.setUserRole = async (req, res) => {
    const uuid = req.params.id;
    try {
        const updatedUser = await prisma.user.update({
            where: {
                id: uuid,
            },
            data: {
                role: {
                    connect: {
                        name: "USER",
                    },
                },
            },
            include: {
                role: true,
            },
        });
        return resSuccess({
            res,
            title: `Success updat user role to ${updatedUser.role.name}`,
            data: updatedUser,
        });
    } catch (error) {
        return resError({
            res,
            title: "Cant update user role",
            errors: error,
        });
    }
};