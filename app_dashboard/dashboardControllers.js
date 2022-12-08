const prisma = require("../prisma/client");
const ITEM_LIMIT = Number(process.env.CARD_ITEM_LIMIT) || 10;
// const ITEM_LIMIT = 5;

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
    const cardList = await prisma.card.findMany({
        where: { card_status: "UNREGISTER" },
        orderBy: {
            createdAt: "asc",
        },
        take: ITEM_LIMIT,
    });
    const data = {
        card: "bg-neutral-4",
        styles: ["/style/cardList.css"],
        scripts: ["/js/cardList.js"],
        cardList,
        helpers: {
            days(value, options) {
                return `${Intl.DateTimeFormat("id", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                }).format(new Date(value))} WIB`;
            },
        },
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

exports.createroom = async (req, res) => {
    const hardwareList = await prisma.device.findMany({
        orderBy: { createdAt: "asc" },
        take: ITEM_LIMIT,
        where: {
            roomId: null,
        },
    });
    const data = {
        room: "bg-neutral-4",
        styles: ["/style/api.css", "/style/createroom.css"],
        scripts: ["/js/createroom.js"],
        hardwareList,
        helpers: {
            inc(value, options) {
                return parseInt(value) + 1;
            },
            days(value, options) {
                return `${Intl.DateTimeFormat("id", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                }).format(new Date(value))} WIB`;
            },
        },
    };

    res.render("createroom", data);
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

exports.roomEdit = async (req, res) => {
    const { ruid } = req.params;
    const roomDetail = await prisma.room.findUnique({
        where: { ruid },
        include: { device: true },
    });
    const hardwareList = await prisma.device.findMany({
        orderBy: { createdAt: "asc" },
        take: ITEM_LIMIT,
        where: {
            roomId: null,
        },
    });
    const data = {
        room: "bg-neutral-4",
        styles: [
            "/style/api.css",
            "/style/createroom.css",
            "/style/roomEdit.css",
        ],
        scripts: ["/js/roomupdate.js"],
        hardwareList,
        ruid,
        roomDetail,
        helpers: {
            inc(value, options) {
                return parseInt(value) + 1;
            },
            days(value, options) {
                return `${Intl.DateTimeFormat("id", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                }).format(new Date(value))} WIB`;
            },
        },
    };

    res.render("roomEdit", data);
};

exports.apiList = async (req, res) => {
    const apiListData = await prisma.api_Key.findMany({
        select: { id: true, secret: true, createdAt: true },
        orderBy: { createdAt: "asc" },
        take: ITEM_LIMIT,
    });
    const data = {
        api: "bg-neutral-4",
        styles: ["/style/api.css"],
        scripts: ["/js/api.js"],
        apiListData,
        helpers: {
            inc(value, options) {
                return parseInt(value) + 1;
            },
        },
    };
    res.render("api", data);
};

exports.hardware = async (req, res) => {
    const hardwareList = await prisma.device.findMany({
        orderBy: { createdAt: "asc" },
        take: ITEM_LIMIT,
    });
    const data = {
        hardware: "bg-neutral-4",
        styles: ["/style/api.css", "/style/hardware.css"],
        scripts: ["/js/hardware.js"],
        hardwareList,
        helpers: {
            inc(value, options) {
                return parseInt(value) + 1;
            },
            days(value, options) {
                return `${Intl.DateTimeFormat("id", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                }).format(new Date(value))} WIB`;
            },
        },
    };
    res.render("hardware", data);
};
