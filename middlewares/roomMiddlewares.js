const { PrismaClient } = require("@prisma/client");
const { isTruePassword } = require("../services/auth");
const { resError, ErrorException } = require("../services/responseHandler");
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

const roomAccessNotExist = async (req, res, next) => {
    try {
        const { ruid, cardNumber: card_number } = req.query;
        const request = await prisma.room.findMany({
            where: {
                ruid,
                card: {
                    some: { card_number },
                },
            },
        });
        if (request.length > 0) throw "Cant create room request";
        return next();
    } catch (error) {
        return resError({
            res,
            title: "Your card already have access",
            errors: error,
        });
    }
};

const isRoomTurePin = async (req, res, next) => {
    const { oldPin } = req.body;
    const { ruid } = req.params;

    try {
        const { pin } = await prisma.room.findUnique({
            where: {
                ruid,
            },
        });
        const matchPin = isTruePassword(oldPin, pin);

        if (!matchPin)
            throw new ErrorException({
                type: "room",
                detail: "Your pin is incorrect, try again",
                location: "Room Middelware",
            });
        return next();
    } catch (error) {
        return resError({
            res,
            title: `${error.room.type} error at ${error.room.location}`,
            errors: error.room.detail,
        });
    }
};

module.exports = {
    roomIsExist,
    roomRequestNotExist,
    roomAccessNotExist,
    isRoomTurePin,
};
