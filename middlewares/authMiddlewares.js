if (process.env.NODE_ENV !== "PRODUCTION") require("dotenv").config();
const jwt = require("jsonwebtoken");
const { resError } = require("../services/error");
const { getToken, getUser } = require("../services/auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const loginRequired = (req, res, next) => {
    const token = getToken(req);

    // check if token exits
    if (!token)
        return resError({
            res,
            title: "Login Requires! Please Login",
            code: 401,
        });

    // verify token
    jwt.verify(token, process.env.SECRET, async (err, decode) => {
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

module.exports = { loginRequired, allowedRole, setUser };
