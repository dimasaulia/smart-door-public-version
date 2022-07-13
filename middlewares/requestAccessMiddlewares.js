const { resError, resSuccess } = require("../services/error");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const requestIsExist = async (req, res, next) => {
    const id =
        req.body.requestId || req.params.requestId || req.query.requestId;
    try {
        const card = await prisma.room_Request.findUnique({
            where: { id: Number(id) },
        });
        if (!card) throw "Cant find room request";
        return next();
    } catch (error) {
        console.log(error);
        return resError({
            res,
            title: error,
        });
    }
};

module.exports = { requestIsExist };
