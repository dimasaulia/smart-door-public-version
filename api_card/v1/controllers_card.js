const { PrismaClient } = require("@prisma/client");
const { getUser, encryptPassword } = require("../../services/auth");
const { resSuccess, resError } = require("../../services/responseHandler");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const ITEM_LIMIT = Number(process.env.CARD_ITEM_LIMIT) || 1;

exports.listOfUnRegisterCard = async (req, res) => {
    let cardList;
    const { search, cursor } = req.query;
    try {
        if (search) {
            if (!cursor) {
                cardList = await prisma.card.findMany({
                    where: {
                        card_number: {
                            contains: search,
                            mode: "insensitive",
                        },
                        card_status: "UNREGISTER",
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }

            if (cursor) {
                cardList = await prisma.card.findMany({
                    where: {
                        card_number: {
                            contains: search,
                            mode: "insensitive",
                        },
                        card_status: "UNREGISTER",
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    take: ITEM_LIMIT,
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                });
            }
        }

        if (!search) {
            if (!cursor) {
                cardList = await prisma.card.findMany({
                    where: {
                        card_status: "UNREGISTER",
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }
            if (cursor) {
                cardList = await prisma.card.findMany({
                    where: {
                        card_status: "UNREGISTER",
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    take: ITEM_LIMIT,
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                });
            }
        }
        const numberOfCard = cardList.length;
        const cardSection = Math.ceil(numberOfCard / 6);
        return resSuccess({
            res,
            title: "Success listed unregister card",
            data: { numberOfCard, cardSection, cardList },
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed listed unregister card",
            errors: error,
        });
    }
};

exports.listOfRegisterCard = async (req, res) => {
    let cardList;
    const { search, cursor } = req.query;
    try {
        if (search) {
            if (!cursor) {
                cardList = await prisma.card.findMany({
                    where: {
                        card_number: {
                            contains: search,
                            mode: "insensitive",
                        },
                        card_status: "REGISTER",
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }

            if (cursor) {
                cardList = await prisma.card.findMany({
                    where: {
                        card_number: {
                            contains: search,
                            mode: "insensitive",
                        },
                        card_status: "REGISTER",
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    take: ITEM_LIMIT,
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                });
            }
        }

        if (!search) {
            if (!cursor) {
                cardList = await prisma.card.findMany({
                    where: {
                        card_status: "REGISTER",
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }
            if (cursor) {
                cardList = await prisma.card.findMany({
                    where: {
                        card_status: "REGISTER",
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    take: ITEM_LIMIT,
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                });
            }
        }
        const numberOfCard = cardList.length;
        const cardSection = Math.ceil(numberOfCard / 6);
        return resSuccess({
            res,
            title: "Success listed register card",
            data: { numberOfCard, cardSection, cardList },
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed listed register card",
            errors: error,
        });
    }
};

/**
 * Controller untuk meregistrasi kartu (menambahkan kartu ke database)
 */
exports.cardRegistration = async (req, res) => {
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

exports.detail = async (req, res) => {
    const { cardNumber: card_number } = req.params;

    try {
        const card = await prisma.card.findUnique({
            where: {
                card_number,
            },
        });

        res.status(200).json({ code: 200, msg: card });
    } catch (err) {
        res.status(500).json({
            code: 500,
            title: err,
        });
    }
};

/**
 * Menampilkan daftar kartu berdasarkan user yang sedang login
 */
exports.userCards = async (req, res) => {
    try {
        const uuid = getUser(req);
        const { search, cursor } = req.query;
        let cardList;

        if (search) {
            if (!cursor) {
                cardList = await prisma.card.findMany({
                    where: {
                        card_name: {
                            contains: search,
                            mode: "insensitive",
                        },
                        userId: uuid,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }

            if (cursor) {
                cardList = await prisma.card.findMany({
                    where: {
                        card_name: {
                            contains: search,
                            mode: "insensitive",
                        },
                        userId: uuid,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    take: ITEM_LIMIT,
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                });
            }
        }

        if (!search) {
            if (!cursor) {
                cardList = await prisma.card.findMany({
                    where: {
                        userId: uuid,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }
            if (cursor) {
                cardList = await prisma.card.findMany({
                    where: {
                        userId: uuid,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    take: ITEM_LIMIT,
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                });
            }
        }

        return resSuccess({
            res,
            title: "Success get user's cards list",
            data: cardList,
        });
    } catch (error) {
        return resError({
            res,
            title: "Cant get user's cards list",
            errors: error,
        });
    }
};

/** Menampilkan informasi mendetail tentang kartu user */
exports.userCardsDetail = async (req, res) => {
    try {
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
    } catch (error) {
        return resError({
            res,
            title: "Cant get detail cards",
            errors: error,
        });
    }
};

/** Menampilkan daftar ruangan yang pernah di kunjungi */
exports.userCardLogs = async (req, res) => {
    const { cardNumber: card_number } = req.params;
    const { cursor } = req.query;
    let cardLogs;
    try {
        if (!cursor) {
            cardLogs = await prisma.rooms_Records.findMany({
                where: {
                    Card: {
                        card_number,
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: ITEM_LIMIT,
                select: {
                    id: true,
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
        }

        if (cursor) {
            cardLogs = await prisma.rooms_Records.findMany({
                where: {
                    Card: {
                        card_number,
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: ITEM_LIMIT,
                skip: 1,
                cursor: {
                    id: cursor,
                },
                select: {
                    id: true,
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
        }

        return resSuccess({
            res,
            title: "Success listed data",
            data: cardLogs,
        });
    } catch (error) {
        return resError({
            res,
            title: "Cant get user's cards logs",
            errors: error,
        });
    }
};

/** Memperbaharui informasi kartu */
exports.update = async (req, res) => {
    const { cardNumber: card_number } = req.params;
    const { cardName: card_name, cardType: type } = req.body;
    try {
        const card = await prisma.card.update({
            where: {
                card_number,
            },
            data: {
                card_name,
                type,
            },
        });
        return resSuccess({
            res,
            title: "Success update card info",
            data: card,
        });
    } catch (error) {
        return resError({
            res,
            title: "Cant get user's cards logs",
            errors: error,
        });
    }
};

//** Memperbaharui pin kartu */
exports.changePin = async (req, res) => {
    const { cardNumber: card_number } = req.params;
    const { newPin } = req.body;
    try {
        const card = await prisma.card.update({
            where: { card_number },
            data: {
                pin: encryptPassword(newPin),
            },
        });

        return resSuccess({
            res,
            title: "Success change pin",
            data: card,
        });
    } catch (error) {
        return resError({
            res,
            title: "Cant get user's cards logs",
            errors: error,
        });
    }
};
