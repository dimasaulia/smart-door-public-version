const prisma = require("../../prisma/client");
const { getUser, hasher } = require("../../services/auth");
const { resSuccess, resError } = require("../../services/responseHandler");
const ITEM_LIMIT = Number(process.env.CARD_ITEM_LIMIT) || 10;
// const ITEM_LIMIT = 5;

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

        return resSuccess({
            res,
            title: "Success listed unregister card",
            data: cardList,
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
                    include: {
                        user: true,
                    },
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
                    include: {
                        user: true,
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
                    include: {
                        user: true,
                    },
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
                    include: {
                        user: true,
                    },
                });
            }
        }

        return resSuccess({
            res,
            title: "Success listed register card",
            data: cardList,
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
    const { pin, cardNumber, isTwoStepAuth = true } = req.body;

    try {
        const registeredCard = await prisma.card.create({
            data: {
                card_number: cardNumber.replaceAll(" ", ""),
                pin: hasher(pin),
                isTwoStepAuth,
            },
        });

        req.app.io.emit("newRegisteredCard", registeredCard.card_number);

        return resSuccess({
            res,
            title: "Successfully registered card",
            data: registeredCard,
        });
    } catch (err) {
        return resError({
            res,
            title:
                err.code === "P2002"
                    ? "Card number has been registered"
                    : "Something Wrong",
            errors: err,
        });
    }
};

exports.detail = async (req, res) => {
    try {
        const { cardNumber: card_number } = req.params;
        const cardDetail = await prisma.card.findUnique({
            where: { card_number },
        });
        return resSuccess({ res, data: cardDetail });
    } catch (err) {
        return resError({
            res,
            errors: err,
            title: "Failed get card information",
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
                isTwoStepAuth: true,
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
                    isSuccess: true,
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
                    isSuccess: true,
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
    const { cardName: card_name, cardType: type, isTwoStepAuth } = req.body;
    try {
        const card = await prisma.card.update({
            where: {
                card_number,
            },
            data: {
                card_name,
                type,
                isTwoStepAuth: isTwoStepAuth == "true" ? true : false,
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
                pin: hasher(newPin),
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

/** Mengubah status two factor auth pada kartu */
exports.changeAuthType = async (req, res) => {
    const { cardNumber } = req.params;
    try {
        const { isTwoStepAuth: authType } = await prisma.card.findUnique({
            where: { card_number: cardNumber },
        });

        const auth = await prisma.card.update({
            where: {
                card_number: cardNumber,
            },
            data: {
                isTwoStepAuth: !authType,
            },
        });

        return resSuccess({
            res,
            title: `Succes change card authentication mode`,
            data: auth,
        });
    } catch (error) {
        return resError({
            res,
            title: error,
            errors: error,
        });
    }
};

/** Menghapus kartu yang sudah terdafatr */
exports.delete = async (req, res) => {
    const { cardNumber: card_number } = req.params;
    try {
        const card = await prisma.card.delete({ where: { card_number } });
        return resSuccess({ res, data: card, title: "Success delete card" });
    } catch (error) {
        return resError({
            res,
            title: error,
            errors: error,
        });
    }
};

/** Melepaskan tautan user dan kartu */
exports.unpairUserToCard = async (req, res) => {
    try {
        const { cardNumber } = req.body;
        const card = await prisma.card.update({
            where: { card_number: cardNumber },
            data: {
                user: {
                    disconnect: true,
                },
                card_status: "UNREGISTER",
            },
        });
        return resSuccess({ res, title: "Success unpair card", data: card });
    } catch (error) {
        return resError({ res, errors: error, title: "Failed unpair card" });
    }
};

/** Fungsi untuk mencari kartu user berdasarkan username */
exports.autocomplate = async (req, res) => {
    try {
        const search = req.query.term;
        const arrayOfCard = [];
        const data = await prisma.card.findMany({
            where: {
                user: {
                    username: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            select: {
                user: {
                    select: {
                        username: true,
                    },
                },
                card_number: true,
                card_name: true,
            },
        });
        data.forEach((d) => {
            arrayOfCard.push({
                value: `${d.card_number}`,
                label: `${d.card_name}@${d.user.username}`,
            });
        });
        return res.status(200).json(arrayOfCard);
    } catch (error) {
        return resError({ res, errors: error, title: "Failed get card list" });
    }
};

/** Fungsi Untuk Menambahkan Kartu Akses oleh Admin */
exports.addAccessCardToRoom = async (req, res) => {
    try {
        const { ruid, cardNumber } = req.body;
        const data = await prisma.card.update({
            where: {
                card_number: cardNumber,
            },
            data: {
                room: {
                    connect: {
                        ruid,
                    },
                },
            },
            select: {
                card_name: true,
                card_number: true,
                id: true,
                user: {
                    select: {
                        username: true,
                    },
                },
            },
        });
        return resSuccess({
            res,
            title: "Success pair room to card",
            data,
        });
    } catch (error) {
        return resError({
            res,
            errors: error,
            title: "Failed pair card to room",
        });
    }
};
