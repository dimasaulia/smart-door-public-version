if (process.env.NODE_ENV !== "PRODUCTION") require("dotenv").config();
const jwt = require("jsonwebtoken");
const { resError, ErrorException } = require("../services/responseHandler");
const {
    getJwtToken,
    getUser,
    verifyJwt,
    urlDecrypter,
    hashChecker,
} = require("../services/auth");
const prisma = require("../prisma/client");

const loginRequired = (req, res, next) => {
    const jwtToken = getJwtToken(req);

    // check if token exits
    if (!jwtToken)
        return resError({
            res,
            title: "Login Requires! Please Login",
            code: 401,
        });

    // verify token
    jwt.verify(jwtToken, process.env.SECRET, async (err, decode) => {
        if (!err) {
            // find user
            const user = await prisma.user.findUnique({
                where: {
                    id: decode.id,
                },
                select: {
                    id: true,
                    username: true,
                },
            });
            if (user) return next();

            if (!user)
                return resError({
                    res,
                    title: "Cant find the user",
                    code: 401,
                });
        } else {
            return resError({
                res,
                title: "Token is not valid",
                code: 401,
            });
        }
    });
};

const logoutRequired = (req, res, next) => {
    const jwtToken = getJwtToken(req);

    // check if token exits
    if (jwtToken)
        return resError({
            res,
            title: "Logout Requires! Please Logout First",
        });
    next();
};

const allowedRole = (...roles) => {
    return async (req, res, next) => {
        const user = await prisma.user.findUnique({
            where: {
                id: getUser(req),
            },
            select: {
                role: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        if (!roles.includes(user.role.name))
            return resError({
                res,
                title: `${user.role.name} not allow to perform this action`,
                code: 401,
            });

        if (roles.includes(user.role.name)) return next();
    };
};

const setUser = async (req, res, next) => {
    try {
        const uuid = getUser(req);
        const user = await prisma.user.findUnique({
            where: {
                id: uuid,
            },
            select: {
                username: true,
            },
        });
        res.locals.user = user.username;
        req.user = user.username;
        next();
    } catch (error) {
        res.locals.user = "";
        next();
    }
};

const defaultRoleIsExist = async (req, res, next) => {
    try {
        const defaultRole = await prisma.role.findUnique({
            where: {
                name: "USER",
            },
        });
        if (defaultRole === null) throw "DEFAULT ROLE CANT FIND";
        return next();
    } catch (errors) {
        return resError({
            res,
            title: "Internal Server Cant Find The Default Role",
            errors,
        });
    }
};

const adminRoleIsExist = async (req, res, next) => {
    try {
        const defaultRole = await prisma.role.findUnique({
            where: {
                name: "ADMIN",
            },
        });
        if (defaultRole === null) throw "ADMIN ROLE CANT FIND";
        return next();
    } catch (errors) {
        return resError({
            res,
            title: "Internal Server Cant Find The Default Role",
            errors,
        });
    }
};

const userIsExist = async (req, res, next) => {
    try {
        const { username } = req.body;
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
                location: "Auth Midlleware",
            });

        return next();
    } catch (errors) {
        return resError({ res, title: "Something Wrong", errors });
    }
};

const emailIsExist = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email,
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
                type: "email",
                detail: "Cant find the user",
                location: "Auth Midlleware",
            });

        return next();
    } catch (errors) {
        return resError({ res, title: "Something Wrong", errors });
    }
};

const userIsNotExist = async (req, res, next) => {
    try {
        const { username } = req.body;
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
        if (user)
            throw new ErrorException({
                type: "username",
                detail: "User already exist or register",
                location: "Auth Midlleware",
            });

        return next();
    } catch (errors) {
        return resError({ res, title: "Something Wrong", errors });
    }
};

const emailIsNotExist = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email,
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
        if (user)
            throw new ErrorException({
                type: "email",
                detail: "Email already exist or register",
                location: "Auth Midlleware",
            });

        return next();
    } catch (errors) {
        return resError({ res, title: "Something Wrong", errors });
    }
};

const notCurrentUser = async (req, res, next) => {
    const deletedUser = req.params.id;
    const token = getUser(req);
    if (deletedUser !== token) return next();
    return resError({
        res,
        errors: "Cannot modify active user",
    });
};

const urlTokenIsValid = async (req, res, next) => {
    try {
        const { token } = req.query;
        const data = verifyJwt(urlDecrypter(token.replaceAll("#", "=")));
        if (!(data?.uuid && data?.token)) throw "(Mid): Your token is Invalid";
        return next();
    } catch (error) {
        return resError({
            res,
            errors: error,
        });
    }
};

const urlTokenNotExpired = async (req, res, next) => {
    const { token } = req.query;
    try {
        const data = verifyJwt(urlDecrypter(token.replaceAll("#", "=")));
        const cloudToken = await prisma.token.findUnique({
            where: { userId: data.uuid },
        });

        if (new Date() > cloudToken.expiredAt) {
            throw new ErrorException({
                type: "token",
                detail: "Your token is expireds",
                location: "User Controller",
            });
        }
        return next();
    } catch (error) {
        return resError({
            res,
            errors: error,
        });
    }
};

/** Fungsi yang akan mencegah user untuk melakukan request baru ketika token masih aktif */
const urlTokenIsNotActive = async (req, res, next) => {
    try {
        let cloudToken;
        if (getUser(req)) {
            cloudToken = await prisma.token.findUnique({
                where: { userId: getUser(req) },
            });
        } else {
            const { email } = req.body;
            const { id } = await prisma.user.findUnique({ where: { email } });
            cloudToken = await prisma.token.findUnique({
                where: { userId: id },
            });
        }

        if (!cloudToken) return next();

        if (new Date() < cloudToken.expiredAt) {
            throw new ErrorException({
                type: "token",
                detail: "Your token is still valid",
                location: "Auth Middlewares",
            });
        }
        return next();
    } catch (error) {
        return resError({
            res,
            errors: error,
        });
    }
};

/** Memastikan halaman hanya bisa diakses oleh user yang belum terverifikasi */
const userNotVerify = async (req, res, next) => {
    try {
        const { isVerified } = await prisma.user.findUnique({
            where: { id: getUser(req) },
        });
        if (isVerified) throw "Your email already verified";
        return next();
    } catch (error) {
        return resError({
            res,
            errors: error,
        });
    }
};

const userIsVerify = async (req, res, next) => {
    try {
        const { isVerified } = await prisma.user.findUnique({
            where: { id: getUser(req) },
        });
        if (!isVerified) throw "Your email not verified";
        return next();
    } catch (error) {
        return resError({
            res,
            errors: error,
        });
    }
};

const urlTokenIsMatch = async (req, res, next) => {
    const { token } = req.query;
    try {
        const data = verifyJwt(urlDecrypter(token.replaceAll("#", "=")));
        const cloudToken = await prisma.token.findUnique({
            where: { userId: data.uuid },
        });

        // Check if user still have the token
        if (!cloudToken)
            throw new ErrorException({
                type: "token",
                detail: "You dont have any token",
                location: "Auth Middleware",
            });

        // INFO: Match the token
        const isTokenMatch = hashChecker(data?.token, cloudToken?.token);
        if (!isTokenMatch) {
            throw new ErrorException({
                type: "token",
                detail: "Your token is not match",
                location: "Auth Middleware",
            });
        }
        return next();
    } catch (error) {
        return resError({
            res,
            errors: error,
        });
    }
};

module.exports = {
    loginRequired,
    allowedRole,
    setUser,
    defaultRoleIsExist,
    adminRoleIsExist,
    userIsExist,
    logoutRequired,
    userIsNotExist,
    emailIsNotExist,
    notCurrentUser,
    urlTokenIsValid,
    urlTokenNotExpired,
    urlTokenIsNotActive,
    userIsVerify,
    userNotVerify,
    emailIsExist,
    urlTokenIsMatch,
};
