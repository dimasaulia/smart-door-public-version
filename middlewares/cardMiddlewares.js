const { PrismaClient } = require("@prisma/client");
const { resError } = require("../services/error");
const { getUser } = require("../services/auth");
const prisma = new PrismaClient();

const cardIsExist = async (req, res, next) => {
    const cardNumber = req.body.cardNumber;
    try {
        const card = await prisma.card.findUnique({
            where: {
                card_number: cardNumber,
            },
        });
        if (!card) throw "Cant find card number";
        return next();
    } catch (error) {
        return resError({
            res,
            title: "Cant find card",
            errors: error,
        });
    }
};

const cardIsPair = async (req, res, next) => {
    const cardNumber = req.body.cardNumber;
    try {
        const card = await prisma.card.findUnique({
            where: {
                card_number: cardNumber,
            },
        });
        if (card.card_status === "UNREGISTER")
            throw "Card must be pair before take this action";
        return next();
    } catch (error) {
        return resError({
            res,
            title: "Cant pair card",
            errors: error,
        });
    }
};

const isUserCard = async (req, res, next) => {
    const cardNumber = req.body.cardNumber;
    const userId = getUser(req);
    try {
        const card = await prisma.card.findUnique({
            where: {
                card_number: cardNumber,
            },
            select: {
                userId: true,
            },
        });
        if (card.userId !== userId) throw "This is not your card";
        return next();
    } catch (error) {
        return resError({
            res,
            title: "You can't perform this action",
            errors: error,
        });
    }
};

module.exports = { cardIsExist, cardIsPair, isUserCard };
