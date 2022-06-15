const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.list = async (req, res) => {
    const unregisterCardList = await prisma.card.findMany({
        orderBy: {
            id: "asc",
        },
        where: {
            card_status: "UNREGISTER",
        },
    });

    const data = {
        unregisterCardList,
    };

    res.render("list", data);
};

exports.userPairingToDashboard = async (req, res) => {
    const cardNumber = req.query.card;
    const data = {
        cardNumber,
    };
    console.log(cardNumber);
    res.render("pair", data);
};
