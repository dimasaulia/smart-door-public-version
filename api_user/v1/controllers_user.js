const { PrismaClient } = require("@prisma/client");
const {
    setAuthCookie,
    getUser,
    hasher,
    createJwtToken,
    encrypter,
    decrypter,
    urlEncrypter,
    urlDecrypter,
    verifyJwt,
    hashChecker,
} = require("../../services/auth");
const { ErrorException } = require("../../services/responseHandler");
const { resError, resSuccess } = require("../../services/responseHandler");
const { random: stringGenerato } = require("@supercharge/strings");
const bcrypt = require("bcrypt");
const { sendEmail, urlTokenGenerator } = require("../../services/mailing");
const e = require("express");
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
                password: hasher(password),
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

exports.emailVerification = async (req, res) => {
    try {
        const cloudToken = await prisma.token.findUnique({
            where: { userId: getUser(req) },
            include: { user: true },
        });

        const { email, id: uuid } = await prisma.user.findUnique({
            where: { id: getUser(req) },
        });
        const token = stringGenerator(64);
        const secret = createJwtToken({ uuid, token }, 60 * 5);

        // If not exist then create
        if (!cloudToken) {
            const { id: uuid, email } = await prisma.user.findUnique({
                where: { id: getUser(req) },
            });

            userEmail = email;

            await prisma.token.create({
                data: {
                    userId: uuid,
                    token: hasher(token),
                    expiredAt: new Date(new Date().getTime() + 5 * 60000),
                },
            });
        } else {
            if (new Date() > cloudToken?.expiredAt) {
                await prisma.token.update({
                    where: {
                        id: cloudToken.id,
                    },
                    data: {
                        token: hasher(token),
                        expiredAt: new Date(new Date().getTime() + 5 * 60000),
                    },
                });
            }
        }

        const url = urlTokenGenerator(
            req,
            "/api/v1/user/email-verifying/",
            secret
        );

        await sendEmail(email, "Email Verification", url);

        return resSuccess({
            res,
            title: "We send verification url to your email",
            data: [],
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

exports.verifyingEmail = async (req, res) => {
    let verificationSuccess;
    try {
        const data = verifyJwt(urlDecrypter(token.replaceAll("#", "=")));

        // INFO: If all data valid or success
        verificationSuccess = await prisma.user.update({
            where: { id: data.uuid },
            data: { isVerified: true },
        });

        await prisma.token.delete({
            where: { userId: data.uuid },
        });

        return resSuccess({
            res,
            title: "Email successfully verified",
            data: verificationSuccess,
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

exports.sendResetPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const { id: uuid } = await prisma.user.findUnique({ where: { email } });
        const token = stringGenerator(32);
        const secret = createJwtToken({ uuid, token }, 60 * 5);

        const cloudToken = await prisma.token.findUnique({
            where: { userId: uuid },
        });

        // If not exist then create
        if (!cloudToken) {
            await prisma.token.create({
                data: {
                    userId: uuid,
                    token: hasher(token),
                    expiredAt: new Date(new Date().getTime() + 5 * 60000),
                },
            });
        } else {
            await prisma.token.update({
                where: {
                    id: cloudToken.id,
                },
                data: {
                    token: hasher(token),
                    expiredAt: new Date(new Date().getTime() + 5 * 60000),
                },
            });
        }

        const url = urlTokenGenerator(
            req,
            "/api/v1/user/reset-password/",
            secret
        );
        await sendEmail(email, "Reset password", url);

        return resSuccess({
            res,
            title: "Success send reset link to your mail",
            data: url,
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

exports.resetPassword = async (req, res) => {
    const { password } = req.body;
    const { token } = req.query;
    try {
        const { uuid, token: urlToken } = verifyJwt(
            urlDecrypter(token.replaceAll("#", "="))
        );
        const newPass = await prisma.user.update({
            where: { id: uuid },
            data: { password: hasher(password) },
        });

        await prisma.token.delete({
            where: { userId: uuid },
        });

        return resSuccess({
            res,
            title: "Success reset your password",
            data: newPass,
        });
    } catch (error) {
        console.log(error);
        return resError({ res, errors: error });
    }
};
