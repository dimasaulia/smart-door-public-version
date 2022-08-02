const { PrismaClient } = require("@prisma/client");
const { getUser, encryptPassword } = require("../services/auth");
const { resSuccess, resError } = require("../services/responseHandler");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

exports.list = async (req, res) => {
    const numberOfCard = await prisma.card.count({
        where: {
            card_status: "UNREGISTER",
        },
    });
    const cardSection = Math.ceil(numberOfCard / 6);
    const cardList = await prisma.card.findMany({
        orderBy: {
            createdAt: "desc",
        },
        where: {
            card_status: "UNREGISTER",
        },
    });

    res.json({ cardList, numberOfCard, cardSection });
};

exports.registeredCards = async (req, res) => {
    const numberOfCard = await prisma.card.count({
        where: {
            card_status: "REGISTER",
        },
    });
    const cardSection = Math.ceil(numberOfCard / 6);
    const cardList = await prisma.card.findMany({
        orderBy: {
            id: "asc",
        },
        where: {
            card_status: "REGISTER",
        },
    });

    res.json({ cardList, numberOfCard, cardSection });
};

exports.register = async (req, res) => {
    const { pin, cardNumber } = req.body;

    try {
        const registeredCard = await prisma.card.create({
            data: {
                card_number: cardNumber.replaceAll(" ", ""),
                pin: encryptPassword(pin),
            },
        });

        req.app.io.emit("newRegisteredCard", registeredCard.card_number);

        res.status(201).json({
            code: 201,
            title: "Succsesfully created",
            msg: registeredCard,
        });
    } catch (err) {
        res.status(500).json({
            code: 500,
            title:
                err.code === "P2002"
                    ? "Card number has been registered"
                    : "Something Wrong",
            msg: err,
        });
    }
};

exports.validateCard = async (req, res) => {
    const cardNumber = req.body.cardNumber;
    const pin = req.body.pin;

    try {
        const card = await prisma.card.findUnique({
            where: {
                card_number: cardNumber,
            },
        });

        if (card === null) throw "Card not registered";
        const cardPinCompare = bcrypt.compareSync(pin, card.pin);

        res.status(200).json({ code: 200, msg: { itMatched: cardPinCompare } });
    } catch (err) {
        res.status(500).json({
            code: 500,
            title: err,
        });
    }
};

exports.detail = async (req, res) => {
    try {
        const card = await prisma.card.findUnique({
            where: {
                card_number: req.params.cardNumber,
            },
        });

        if (card === null) throw "Card not registered";

        res.status(200).json({ code: 200, msg: card });
    } catch (err) {
        res.status(500).json({
            code: 500,
            title: err,
        });
    }
};

exports.userCards = async (req, res) => {
    try {
        const uuid = getUser(req);
        const cards = await prisma.card.findMany({
            where: {
                userId: uuid,
            },
        });
        return resSuccess({
            res,
            title: "Success get user's cards list",
            data: cards,
        });
    } catch (error) {
        return resError({
            res,
            title: "Cant get user's cards list",
            errors: error,
        });
    }
};

exports.userCardsDetail = async (req, res) => {
    const { cardNumber: card_number } = req.params;
    const userCardDetail = await prisma.card.findUnique({
        where: {
            card_number,
        },
        select: {
            card_name: true,
            card_number: true,
            type: true,
        },
    });
    const data = {
        info: userCardDetail,
    };
    return resSuccess({ res, title: "Success get card detail", data });
};

exports.userCardLogs = async (req, res) => {
    const { cardNumber: card_number } = req.params;
    const data = await prisma.rooms_Records.findMany({
        where: {
            Card: {
                card_number,
            },
        },
        select: {
            Card: {
                select: {
                    card_name: true,
                },
            },
            room: {
                select: {
                    name: true,
                },
            },
            createdAt: true,
        },
    });
    return resSuccess({ res, title: "Success listed data", data });
};
