const { PrismaClient } = require("@prisma/client");
const { hashChecker } = require("../services/auth");
const { resError, ErrorException } = require("../services/responseHandler");
const prisma = new PrismaClient();

const roomIsExist = async (req, res, next) => {
    const duid = req.params.duid || req.body.duid || req.query.duid;
    const ruid = req.params.ruid || req.body.ruid || req.query.ruid;
    try {
        if (duid) {
            const device = await prisma.device.findUnique({
                where: {
                    device_id: duid,
                },
                include: { room: true },
            });
            if (!device?.room) throw "Can't find the room by the device id";
            if (device?.room) return next();
        }

        if (ruid) {
            const room = await prisma.room.findUnique({
                where: {
                    ruid,
                },
            });
            if (!room) throw "Can't find the room by the room id";
            if (room) return next();
        }
    } catch (error) {
        return resError({
            res,
            title: error,
            errors: error,
        });
    }
};

const deviceIsExist = async (req, res, next) => {
    const duid = req.params.duid || req.body.duid || req.query.duid;
    try {
        const device = await prisma.device.findUnique({
            where: {
                device_id: duid,
            },
        });

        if (!device) throw "Can't find the device";
        if (device) return next();
    } catch (error) {
        return resError({
            res,
            title: error,
            errors: error,
        });
    }
};

const deviceNotPair = async (req, res, next) => {
    const duid = req.params.duid || req.body.duid || req.query.duid;
    try {
        const device = await prisma.device.findUnique({
            where: {
                device_id: duid,
            },
            select: { room: true },
        });

        if (device?.room) throw "The device already pair";
        if (!device?.room) return next();
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
        const matchPin = hashChecker(oldPin, pin);

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

const cardIsHaveAccess = async (req, res, next) => {
    const { cardNumber } = req.body;
    const { duid } = req.params;

    try {
        const {
            room: { ruid },
        } = await prisma.device.findUnique({
            where: { device_id: duid },
            select: { room: true },
        });
        console.log("RUID ", ruid);
        const room = await prisma.room.findUnique({
            where: {
                ruid,
            },
            include: {
                card: {
                    select: {
                        card_number: true,
                        pin: true,
                        userId: true,
                    },
                },
            },
        });

        // check card can access the room
        const findedCard = room.card.find(
            (card) => card.card_number === cardNumber.replaceAll(" ", "")
        );

        if (!findedCard)
            throw new ErrorException({
                type: "card",
                detail: "You can't access this room",
                location: "Room Middleware",
            });

        return next();
    } catch (error) {
        return resError({
            res,
            title: `${error.card.type} error at ${error.card.location}`,
            errors: error.card.detail,
        });
    }
};

const roomIsActive = async (req, res, next) => {
    const ruid = req.params.ruid || req.body.ruid || req.query.ruid;
    try {
        const room = await prisma.room.findUnique({
            where: {
                ruid,
            },
        });

        if (!room.isActive) throw "Room not activate yet";
        return next();
    } catch (error) {
        return resError({
            res,
            title: error,
            errors: "Room not activate yet",
        });
    }
};

module.exports = {
    roomIsActive,
    roomIsExist,
    roomRequestNotExist,
    roomAccessNotExist,
    isRoomTurePin,
    cardIsHaveAccess,
    deviceIsExist,
    deviceNotPair,
};
