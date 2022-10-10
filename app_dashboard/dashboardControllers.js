const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.dashboard = async (req, res) => {
    const unRegisterCard = await prisma.card.count({
        where: { card_status: "UNREGISTER" },
    });
    const registerCard = await prisma.card.count({
        where: { card_status: "REGISTER" },
    });
    const userCount = await prisma.user.count();
    const roomCount = await prisma.room.count();
    const roomRecord = await prisma.rooms_Records.count();
    const userUnPair = await prisma.user.findMany({
        include: {
            card: true,
        },
    });
    const userUnPairCount = userUnPair.filter((value) => {
        if (value.card.length === 0) return value;
    }).length;

    const data = {
        dashboard: "bg-neutral-4",
        styles: ["list.css"],
        scripts: ["/js/gatewayList.js", "/js/dashboard.js"],
        unRegisterCard,
        registerCard,
        userCount,
        userUnPairCount,
        roomCount,
        roomRecord: roomRecord < 9999999 ? roomRecord : "9999999+",
    };

    res.render("index", data);
};

exports.userPairingToDashboard = async (req, res) => {
    const cardId = req.query.cardId;

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    const data = {
        card: "bg-neutral-4",
        styles: [
            "/style/pairUser.css",
            "https://code.jquery.com/ui/1.13.1/themes/base/jquery-ui.css",
        ],
        scripts: [
            "https://code.jquery.com/jquery-3.6.0.js",
            "https://code.jquery.com/ui/1.13.1/jquery-ui.js",
            "/js/pairUser.js",
        ],
        cardId,
    };
    res.render("pair", data);
};

exports.cardList = async (req, res) => {
    const data = {
        card: "bg-neutral-4",
        styles: ["/js/splide/css/splide.min.css", "/style/cardList.css"],
        scripts: [
            "/js/splide/js/splide.min.js",
            // "/js/mountCardList.js",
            "/js/cardList.js",
        ],
    };

    res.render("list", data);
};

exports.userList = async (req, res) => {
    const data = {
        users: "bg-neutral-4",
        styles: ["/style/userList.css"],
        scripts: ["/js/userList.js"],
    };

    res.render("userList", data);
};

exports.roomList = async (req, res) => {
    const data = {
        room: "bg-neutral-4",
        styles: ["/style/userList.css"],
        scripts: ["/js/roomList.js"],
    };

    res.render("roomList", data);
};

exports.roomDetail = (req, res) => {
    const { ruid } = req.params;
    const data = {
        room: "bg-neutral-4",
        styles: ["/style/roomDetail.css"],
        scripts: ["/js/roomDetail.js"],
        ruid,
    };

    res.render("roomDetail", data);
};

exports.roomEdit = (req, res) => {
    const { ruid } = req.params;
    const data = {
        room: "bg-neutral-4",
        styles: ["/style/roomEdit.css"],
        scripts: ["/js/roomEdit.js"],
        ruid,
    };

    res.render("roomEdit", data);
};
