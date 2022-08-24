const { PrismaClient } = require("@prisma/client");
const { resError, ErrorException } = require("../services/responseHandler");
const { getUser, hashChecker } = require("../services/auth");
const prisma = new PrismaClient();

const cardIsExist = async (req, res, next) => {
    const cardNumber =
        req.body.cardNumber || req.params.cardNumber || req.query.cardNumber;
    try {
        const card = await prisma.card.findUnique({
            where: {
                card_number: cardNumber.replaceAll(" ", ""),
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
    const cardNumber = req.body.cardNumber || req.query.cardNumber;
    try {
        const card = await prisma.card.findUnique({
            where: {
                card_number: cardNumber.replaceAll(" ", ""),
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

const cardNotPair = async (req, res, next) => {
    const cardNumber = req.body.cardNumber;
    try {
        const card = await prisma.card.findUnique({
            where: {
                card_number: cardNumber.replaceAll(" ", ""),
            },
        });
        if (card.card_status === "REGISTER") throw "Card already pair";
        return next();
    } catch (error) {
        return resError({
            res,
            title: error,
            errors: error,
        });
    }
};

const isUserCard = async (req, res, next) => {
    const cardNumber =
        req.body.cardNumber || req.params.cardNumber || req.query.cardNumber;

    const userId = getUser(req);
    try {
        const card = await prisma.card.findUnique({
            where: {
                card_number: cardNumber.replaceAll(" ", ""),
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

const isTurePin = async (req, res, next) => {
    const { oldPin } = req.body;
    const { cardNumber: card_number } = req.params;

    try {
        const { pin } = await prisma.card.findUnique({
            where: {
                card_number,
            },
        });
        const matchPin = hashChecker(oldPin, pin);

        if (!matchPin)
            throw new ErrorException({
                type: "card",
                detail: "Your pin is incorrect, try again",
                location: "Card Middelware",
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

const isNewPinMatch = (req, res, next) => {
    try {
        const { confirmNewPin, newPin } = req.body;
        if (confirmNewPin !== newPin) {
            throw new ErrorException({
                type: "card",
                detail: "Your new pin is not match, try again",
                location: "Card Middelware",
            });
        }
        return next();
    } catch (error) {
        return resError({
            res,
            title: `${error.card.type} error at ${error.card.location}`,
            errors: error.card.detail,
        });
    }
};

module.exports = {
    cardIsExist,
    cardIsPair,
    isUserCard,
    cardNotPair,
    isTurePin,
    isNewPinMatch,
};
