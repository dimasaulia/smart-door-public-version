require("dotenv").config;
const jwt = require("jsonwebtoken");
const { resError } = require("../services/responseHandler");
const { getJwtToken, getUser } = require("../services/auth");
const prisma = require("../prisma/client");

const loginRequired = (req, res, next) => {
    const token = getJwtToken(req);

    // check if token exits
    if (!token) return res.redirect("/auth/login");

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

            if (!user) return res.redirect("/auth/login");
        } else {
            return res.redirect("/auth/login");
        }
    });
};

const logoutRequired = (req, res, next) => {
    const jwtToken = getJwtToken(req);

    // check if token exits
    if (jwtToken) return res.redirect("/");
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
        if (!roles.includes(user.role.name)) {
            if (user.role.name === "ADMIN") return res.redirect("/dashboard");
            if (user.role.name === "USER") return res.redirect("/");
        }

        if (roles.includes(user.role.name)) return next();
    };
};

module.exports = { loginRequired, allowedRole, logoutRequired };
