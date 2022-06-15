const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

exports.list = async (req, res) => {
    const cardList = await prisma.card.findMany({
        orderBy: {
            id: "asc",
        },
    });
    res.json(cardList);
};

exports.register = async (req, res) => {
    const saltRounds = 10;
    const pin = req.body.pin;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashPin = bcrypt.hashSync(pin, salt);

    try {
        const registeredCard = await prisma.card.create({
            data: {
                card_number: req.body.cardNumber,
                pin: hashPin,
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
