const { PrismaClient } = require("@prisma/client");
const { resError } = require("../services/error");
const prisma = new PrismaClient();

const roomIsExist = async (req, res, next) => {
    const ruid = req.params.ruid || req.body.ruid;
    try {
        const room = await prisma.room.findUnique({
            where: {
                ruid,
            },
        });

        if (!room) throw "Can't find the room";
        if (room) return next();
    } catch (error) {
        return resError({
            res,
            title: "Something wrong",
            errors: error,
        });
    }
};

module.exports = { roomIsExist };
