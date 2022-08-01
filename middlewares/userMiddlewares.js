const { PrismaClient } = require("@prisma/client");
const { resError } = require("../services/responseHandler");
const prisma = new PrismaClient();

const userIsExist = async (req, res, next) => {
    const uuid = req.params.id;
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: uuid,
            },
        });

        if (!user) throw "Can't find the user";
        next();
    } catch (error) {
        return resError({ res, title: error });
    }
};

const usernameIsExist = async (req, res, next) => {
    const username = req.body.username;
    try {
        const user = await prisma.user.findUnique({
            where: {
                username,
            },
        });

        if (!user) throw "Can't find the username";
        next();
    } catch (error) {
        return resError({ res, title: error });
    }
};

module.exports = { userIsExist, usernameIsExist };
