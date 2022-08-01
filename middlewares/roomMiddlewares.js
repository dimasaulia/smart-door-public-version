const { PrismaClient } = require("@prisma/client");
const { resError } = require("../services/responseHandler");
const prisma = new PrismaClient();

const roomIsExist = async (req, res, next) => {
    const ruid = req.params.ruid || req.body.ruid || req.query.ruid;
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
            title: error,
            errors: error,
        });
    }
};

const roomRequestNotExist = async (req, res, next) => {
    try {
        const { ruid, cardNumber: card_number } = req.query;
        const request = await prisma.room_Request.findMany({
            where: {
                room: {
                    is: {
                        ruid,
                    },
                },
                card: {
                    is: {
                        card_number,
                    },
                },
            },
        });
        if (request.length > 0) throw "Cant create room request";
        return next();
    } catch (error) {
        return resError({
            res,
            title: "Request sudah ada!",
            errors: error,
        });
    }
};

module.exports = { roomIsExist, roomRequestNotExist };
