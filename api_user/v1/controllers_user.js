const prisma = require("../../prisma/client");
const {
    setAuthCookie,
    getUser,
    hasher,
    createJwtToken,
    verifyJwt,
    hashChecker,
} = require("../../services/auth");
const { ErrorException } = require("../../services/responseHandler");
const { resError, resSuccess } = require("../../services/responseHandler");
const { random: stringGenerator } = require("@supercharge/strings");
const { sendEmail, urlTokenGenerator } = require("../../services/mailing");
const { days } = require("../../services/timeformater");
const ITEM_LIMIT = Number(process.env.CARD_ITEM_LIMIT) || 10;
const FS = require("fs");

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
        const auth = hashChecker(password, user.password);
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
                passwordUpdatedAt: new Date(Date.now() - 1000),
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
        const passCompare = hashChecker(oldPassword, user.password);

        if (user === null) throw "User not found";
        if (!passCompare) throw "Password not match";

        const updatedUser = await prisma.user.update({
            where: {
                id: getUser(req),
            },
            data: {
                password: hasher(newPassword),
                passwordUpdatedAt: new Date(Date.now() - 1000),
            },
        });

        setAuthCookie({ res, uuid: user.id }); //update cookies

        return resSuccess({ res, code: 201, body: updatedUser });
    } catch (err) {
        return resError({ res, title: "Failed update password", errors: err });
    }
};

exports.profileUpdate = async (req, res) => {
    try {
        const { email, full_name, username } = req.body;
        const id = getUser(req);
        const currentData = await prisma.user.findUnique({
            where: { id },
        });

        // if user try change username
        if (username != currentData.username) {
            const checkUser = await prisma.user.findUnique({
                where: { username },
            });
            // if username already exist throw error
            if (checkUser)
                throw new ErrorException({
                    type: "username",
                    detail: "User already exist or register",
                });
        }

        // if user try change email
        if (email != currentData.email) {
            const checkUser = await prisma.user.findUnique({
                where: { email },
            });
            // if email already exist throw error
            if (checkUser)
                throw new ErrorException({
                    type: "email",
                    detail: "Email already exist or register",
                });
        }

        const newData = await prisma.user.update({
            where: {
                id,
            },
            data: {
                username,
                email,
                isVerified:
                    email === currentData.email
                        ? currentData.isVerified
                        : false,
                profil: {
                    update: {
                        full_name,
                    },
                },
                updatedAt: new Date(Date.now() - 1000),
            },
        });
        return resSuccess({
            res,
            title: "Success update your profile",
            data: newData,
        });
    } catch (err) {
        return resError({ res, errors: err, title: "Failed update profile" });
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

    return resSuccess({ res, title: "Success pair card" });
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
        take: 15,
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
        const token = stringGenerator(24);
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
            "api/v1/user/email-verifying/",
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
    const { token } = req.query;
    try {
        const data = verifyJwt(token);

        // INFO: If all data valid or success
        verificationSuccess = await prisma.user.update({
            where: { id: data.uuid },
            data: { isVerified: true },
        });

        await prisma.token.delete({
            where: { userId: data.uuid },
        });

        // return resSuccess({
        //     res,
        //     title: "Email successfully verified",
        //     data: verificationSuccess,
        // });
        return res.redirect("/profile");
    } catch (error) {
        return resError({ res, errors: error });
    }
};

exports.sendResetPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const { id: uuid } = await prisma.user.findUnique({ where: { email } });
        const token = stringGenerator(24);
        const secret = createJwtToken({ uuid, token }, 60 * 5);
        const expiredAt = new Date(new Date().getTime() + 5 * 60000);
        const cloudToken = await prisma.token.findUnique({
            where: { userId: uuid },
        });

        // If not exist then create
        if (!cloudToken) {
            await prisma.token.create({
                data: {
                    userId: uuid,
                    token: hasher(token),
                    expiredAt,
                },
            });
        } else {
            await prisma.token.update({
                where: {
                    id: cloudToken.id,
                },
                data: {
                    token: hasher(token),
                    expiredAt,
                },
            });
        }

        const url = urlTokenGenerator(req, "auth/reset", secret);
        await sendEmail(
            email,
            "Reset password",
            `Reset your password via the following link ${url}, your token active until ${days(
                expiredAt
            )}`
        );

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
        const { uuid, token: urlToken } = verifyJwt(token);
        const newPass = await prisma.user.update({
            where: { id: uuid },

            data: {
                password: hasher(password),
                passwordUpdatedAt: new Date(Date.now() - 1000),
            },
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
        return resError({ res, errors: error });
    }
};

exports.profileAvatarUpdate = async (req, res) => {
    try {
        const id = getUser(req);
        const profil = await prisma.profil.findUnique({
            where: { userId: id },
        });
        const update = await prisma.profil.update({
            where: { userId: id },
            data: {
                photo: `${String(req.file.path)
                    .replaceAll("\\", "/")
                    .replace("public", "")}`,
            },
        });
        if (profil.photo) {
            try {
                FS.unlink(`./public/${profil.photo}`, (err) => {
                    if (err) throw err;
                });
            } catch (error) {}
        }
        return resSuccess({
            res,
            title: "success update your profile",
            data: update,
        });
    } catch (error) {
        console.log(error);
        return resError({
            res,
            errors: error,
            title: "Failed update your profile picture",
        });
    }
};
