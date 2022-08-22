const {
    resError,
    resSuccess,
    ErrorException,
} = require("../../services/responseHandler");
const { getUser, isTruePassword } = require("../../services/auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ITEM_LIMIT = Number(process.env.ITEM_LIMIT) || 10;

/**
 * Fungsi yang digunakan oleh perangkat keras, fungsi nya adalah membuat atau menampilkan data ruangan dengan Room Unique ID yang tertanam di perangkat
 */
exports.getOrCreateRoom = async (req, res) => {
    const ruid = req.body.ruid; // stands for room unique id
    try {
        const getRoom = await prisma.room.findUnique({
            where: {
                ruid: ruid,
            },
        });

        // jika ruangan belum ada (!null berarti true)
        if (!getRoom) {
            const newRoom = await prisma.room.create({
                data: {
                    ruid: ruid,
                    name: ruid,
                },
            });
            return resSuccess({
                res,
                title: "Success created room",
                data: newRoom,
                code: 201,
            });
        }

        return resSuccess({
            res,
            title: "Succes get room information",
            data: getRoom,
        });
    } catch (err) {
        return resError({ res, errors: err });
    }
};

/**
 * Fungsi untuk menampilkan informasi suatu ruangan berdasarkan RUID (Room Unique ID)
 */
exports.detail = async (req, res) => {
    const ruid = req.params.ruid; // stands for room unique id
    try {
        const detailRoom = await prisma.room.findUnique({
            where: {
                ruid: ruid,
            },
        });

        const numberOfVisitor = await prisma.rooms_Records.count({
            where: {
                room: {
                    ruid,
                },
            },
        });
        const accaptableUser = await prisma.card.count({
            where: {
                room: {
                    some: {
                        ruid,
                    },
                },
            },
        });

        const requestUser = await prisma.room_Request.count({
            where: { room: { ruid } },
        });

        return resSuccess({
            res,
            title: "Succes get room information",
            data: { detailRoom, numberOfVisitor, accaptableUser, requestUser },
        });
    } catch (err) {
        return resError({ res, errors: err, code: 422 });
    }
};

/**
 * Fungsi untuk menampilkan daftar ruangan yang terpaginasi
 */
exports.list = async (req, res) => {
    const { search, cursor } = req.query;
    let roomList;
    try {
        if (search) {
            if (!cursor) {
                roomList = await prisma.room.findMany({
                    where: {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    orderBy: {
                        name: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }

            if (cursor) {
                roomList = await prisma.room.findMany({
                    where: {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    orderBy: {
                        name: "asc",
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
                roomList = await prisma.room.findMany({
                    orderBy: {
                        name: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }
            if (cursor) {
                roomList = await prisma.room.findMany({
                    orderBy: {
                        name: "asc",
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
            title: "Success listed all room",
            data: roomList,
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

/**
 * Fungsi untuk memperbaharui informasi suatu ruangan
 */
exports.update = async (req, res) => {
    const { ruid } = req.params; // stands for room unique id
    const { roomName } = req.body;
    try {
        const updatedRoom = await prisma.room.update({
            where: {
                ruid: ruid,
            },
            data: {
                name: roomName,
            },
        });

        return resSuccess({
            res,
            title: "Succesfully update room information",
            data: updatedRoom,
        });
    } catch (err) {
        return resError({ res, errors: err });
    }
};

/**
 * Fungsi untuk menghapus ruangan tertentu
 */
exports.delete = async (req, res) => {
    const ruid = req.params.ruid; // stands for room unique id
    try {
        const deletedRoom = await prisma.room.delete({
            where: {
                ruid: ruid,
            },
        });
        return resSuccess({
            res,
            data: deletedRoom,
            title: "Successfull delete the room",
        });
    } catch (err) {
        return resError({ res, errors: err, code: 422 });
    }
};

/**
 * Fungsi untuk menautkan ruangan dengan kartu, fungsi ini akan memberi akses kepada kartu untuk mengakses ruangan tertentu
 */
exports.pairRoomToCard = async (req, res) => {
    const { ruid, cardNumber, requestId: id } = req.query;
    try {
        const updatedRoom = await prisma.room.update({
            where: {
                ruid,
            },
            data: {
                card: {
                    connect: {
                        card_number: cardNumber,
                    },
                },
            },
        });

        await prisma.room_Request.delete({ where: { id } });
        return resSuccess({
            res,
            title: "Sukses memberi akses",
            data: updatedRoom,
        });
    } catch (error) {
        return resError({
            res,
            title: "Gagal memberi akses ruangan",
            errors: error,
        });
    }
};

/**
 * Fungsi ini akan digunakan perangkat keras. Fungsi yang berguna untuk mengecek kartu, pin dan ruangan yang akan dimasuki user,
 */
exports.roomCheckIn = async (req, res) => {
    const { ruid } = req.params;
    const { cardNumber, pin } = req.body;
    try {
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
        // if (!findedCard) throw "You can't access this room";
        if (!findedCard)
            throw new ErrorException({
                type: "card",
                detail: "You can't access this room",
                location: "Room Controller",
            });

        // const matchPin = await bcrypt.compareSync(pin, findedCard.pin);
        const matchPin = isTruePassword(pin, findedCard.pin);
        // if (!matchPin) throw "Your pin is incorrect, try again";
        if (!matchPin)
            throw new ErrorException({
                type: "card",
                detail: "Your pin is incorrect, try again",
                location: "Room Controller",
            });

        const reocrd = await prisma.rooms_Records.create({
            data: {
                Card: {
                    connect: {
                        card_number: cardNumber.replaceAll(" ", ""),
                    },
                },
                room: {
                    connect: {
                        ruid,
                    },
                },
                isSuccess: true,
            },
        });

        return resSuccess({
            res,
            title: `Success open the room (${room.ruid})`,
        });
    } catch (error) {
        const reocrd = await prisma.rooms_Records.create({
            data: {
                Card: {
                    connect: {
                        card_number: cardNumber.replaceAll(" ", ""),
                    },
                },
                room: {
                    connect: {
                        ruid,
                    },
                },
                isSuccess: false,
            },
        });
        return resError({
            res,
            title: "Failed to open the room",
            errors: error,
        });
    }
};

/**
 * Fungsi yang bertugas untuk memasukan data ke dalam request room, user akan meminta akses ke ruangan yang diinginkan
 */
exports.roomRequest = async (req, res) => {
    try {
        const { ruid, cardNumber: card_number } = req.query;
        const request = await prisma.room_Request.create({
            data: {
                room: {
                    connect: {
                        ruid,
                    },
                },
                card: {
                    connect: {
                        card_number,
                    },
                },
            },
        });
        return resSuccess({
            res,
            title: "Success request room access",
            data: request,
        });
    } catch (error) {
        return resError({
            res,
            title: "Gagal meminta ruangan",
            errors: error,
        });
    }
};

/**
 * Fungsi yang akan menampilkan data ruangan yang bisa diakses oleh user, fungsi ini sudah terpaginasi
 */
exports.userAccessableRoom = async (req, res) => {
    const { search, cursor } = req.query;
    const { cardNumber: card_number } = req.params;
    let roomList;
    try {
        if (search) {
            if (!cursor) {
                roomList = await prisma.room.findMany({
                    where: {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                        card: {
                            some: {
                                card_number,
                            },
                        },
                    },
                    orderBy: {
                        name: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }

            if (cursor) {
                roomList = await prisma.room.findMany({
                    where: {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                        card: {
                            some: {
                                card_number,
                            },
                        },
                    },
                    orderBy: {
                        name: "asc",
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
                roomList = await prisma.room.findMany({
                    where: {
                        card: {
                            some: {
                                card_number,
                            },
                        },
                    },
                    select: {
                        id: true,
                        name: true,
                        ruid: true,
                    },
                    orderBy: {
                        name: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }
            if (cursor) {
                roomList = await prisma.room.findMany({
                    where: {
                        card: {
                            some: {
                                card_number,
                            },
                        },
                    },
                    select: {
                        id: true,
                        name: true,
                        ruid: true,
                    },
                    orderBy: {
                        name: "asc",
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
            title: "Success listed all room",
            data: roomList,
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

/** Fungsi yang akan menampilkan daftar user yang memiliki akses ke suatu ruangan */
exports.accaptableUser = async (req, res) => {
    const { ruid } = req.params;
    const { cursor } = req.query;
    let accaptableUser;
    try {
        if (!cursor) {
            accaptableUser = await prisma.card.findMany({
                where: {
                    room: {
                        some: {
                            ruid,
                        },
                    },
                },
                orderBy: {
                    updatedAt: "desc",
                },
                take: ITEM_LIMIT,
                include: {
                    user: true,
                },
            });
        }

        if (cursor) {
            accaptableUser = await prisma.card.findMany({
                where: {
                    room: {
                        some: {
                            ruid,
                        },
                    },
                },
                orderBy: {
                    updatedAt: "desc",
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
        return resSuccess({
            res,
            title: "Succes listed accaptable user",
            data: accaptableUser,
        });
    } catch (error) {
        return resError({
            res,
            title: "Gagal memuat user yang diizinkan",
            errors: error,
        });
    }
};

/** Fungsi yang akan menampilkan daftar user yang meminta akses ke suatu ruangan */
exports.requestRoomByUser = async (req, res) => {
    try {
        const { ruid } = req.params;
        const requestUser = await prisma.room_Request.findMany({
            where: {
                room: {
                    is: {
                        ruid,
                    },
                },
            },
            include: {
                card: {
                    include: {
                        user: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
            },
        });
        return resSuccess({
            res,
            title: "Success listed request user",
            data: requestUser,
        });
    } catch (error) {
        return resError({
            res,
            title: "Gagal memuat user yang mimnta request",
            errors: error,
        });
    }
};

/** Fungsi untuk menampilkan informasi (log) ruangan*/
exports.logs = async (req, res) => {
    // INFO: This function need update to have search functionality
    const { ruid } = req.params;
    const { cursor } = req.query;
    let room;
    try {
        if (!cursor) {
            room = await prisma.rooms_Records.findMany({
                where: {
                    room: {
                        ruid,
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    Card: {
                        include: {
                            user: true,
                        },
                    },
                },
                take: ITEM_LIMIT,
            });
        }

        if (cursor) {
            room = await prisma.rooms_Records.findMany({
                where: {
                    room: {
                        ruid,
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
                include: {
                    Card: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
        }
        return resSuccess({
            res,
            title: "Success listed room logs",
            data: room,
        });
    } catch (error) {
        console.log(error);
        return resError({
            res,
            title: "Gagal memuat user yang mimnta request",
            errors: error,
        });
    }
};
