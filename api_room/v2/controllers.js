const { PrismaClient } = require("@prisma/client");
const {
    ErrorException,
    resError,
    resSuccess,
} = require("../../services/responseHandler");
const { random: stringGenerator } = require("@supercharge/strings");
const { hashChecker, hasher } = require("../../services/auth");
const ITEM_LIMIT = Number(process.env.ITEM_LIMIT) || 10;
const prisma = new PrismaClient();

/**
 * Fungsi yang digunakan oleh perangkat keras, fungsi nya adalah membuat perangkat
 */
exports.createDevice = async (req, res) => {
    try {
        let duid = stringGenerator(5);
        let generateDUID = true;
        while (generateDUID) {
            const ruidIsEmpty = await prisma.device.findUnique({
                where: {
                    device_id: duid,
                },
            });

            if (!ruidIsEmpty) {
                generateDUID = false;
                break;
            }

            duid = stringGenerator(5);
        }

        const newDevice = await prisma.device.create({
            data: {
                device_id: duid,
            },
        });
        return resSuccess({
            res,
            title: "Success register device",
            data: newDevice,
            code: 201,
        });
    } catch (err) {
        return resError({ res, errors: err });
    }
};

/**
 * Fungsi yang digunakan untuk menautkan perangkat dengan ruangan yang akan di buat
 */
exports.createRoom = async (req, res) => {
    const { name, duid } = req.body;
    try {
        let ruid = stringGenerator(5);
        let generateRUID = true;
        while (generateRUID) {
            const ruidIsEmpty = await prisma.room.findUnique({
                where: {
                    ruid,
                },
            });

            if (!ruidIsEmpty) {
                generateRUID = false;
                break;
            }

            ruid = stringGenerator(5);
        }

        const newRoom = await prisma.room.create({
            data: {
                ruid,
                name,
                isActive: true,
                device: {
                    connect: {
                        device_id: duid,
                    },
                },
            },
        });

        return resSuccess({
            res,
            title: "Success pairing room and device",
            data: newRoom,
        });
    } catch (error) {
        console.log(error);
        return resError({ res, errors: error });
    }
};

/**
 * Fungsi untuk menampilkan informasi suatu ruangan berdasarkan RUID (Room Unique ID)
 */
exports.detail = async (req, res) => {
    const { duid } = req.params; // stands for room unique id
    try {
        const detailRoom = await prisma.device.findUnique({
            where: {
                device_id: duid,
            },
        });

        return resSuccess({
            res,
            title: "Succes get device information",
            data: detailRoom,
        });
    } catch (err) {
        return resError({ res, errors: err, code: 422 });
    }
};

/**
 * Fungsi ini akan digunakan perangkat keras. Fungsi yang berguna untuk mengecek kartu, pin dan ruangan yang akan dimasuki user,
 */
exports.roomCheckIn = async (req, res) => {
    const { duid } = req.params;
    const {
        room: { ruid },
    } = await prisma.device.findUnique({
        where: { device_id: duid },
        select: { room: true },
    });
    // che
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

        const findedCard = room.card.find(
            (card) => card.card_number === cardNumber.replaceAll(" ", "")
        );

        const matchPin = hashChecker(pin, findedCard.pin);

        if (!matchPin)
            throw new ErrorException({
                type: "card",
                detail: "Your pin is incorrect, try again",
                location: "Room Controller",
            });

        await prisma.rooms_Records.create({
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
        await prisma.rooms_Records.create({
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
            code: 401,
        });
    }
};

/** Fungsi untuk validasi pin pintu */
exports.validatePin = async (req, res) => {
    const { duid } = req.params;
    const { pin } = req.body;
    try {
        const device = await prisma.device.findUnique({
            where: { device_id: duid },
        });

        const validate = hashChecker(pin, device.pin);
        if (!validate)
            throw new ErrorException({
                type: "room",
                detail: "Pin not match",
                location: "Room Controller",
            });

        return resSuccess({
            res,
            title: "Success to validate pin",
            data: { validate },
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed to validate pin",
            errors: error,
        });
    }
};

/** Fungsi untuk menampilkan daftar perangkat */
exports.deviceList = async (req, res) => {
    const { search, cursor } = req.query;
    let deviceList;
    try {
        if (search) {
            if (!cursor) {
                deviceList = await prisma.device.findMany({
                    where: {
                        device_id: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }

            if (cursor) {
                deviceList = await prisma.device.findMany({
                    where: {
                        device_id: {
                            contains: search,
                            mode: "insensitive",
                        },
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
                deviceList = await prisma.device.findMany({
                    orderBy: {
                        createdAt: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }
            if (cursor) {
                deviceList = await prisma.device.findMany({
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
            title: "Success listed all device",
            data: deviceList,
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed to list device",
            errors: error,
        });
    }
};

/** Fungsi untuk menghapus device */
exports.deviceDelete = async (req, res) => {
    const { duid } = req.params;
    try {
        const deviceInfo = await prisma.device.findUnique({
            where: { device_id: duid },
            select: { room: true },
        });

        if (deviceInfo?.room) {
            await prisma.device.update({
                where: { device_id: duid },
                data: { room: { update: { isActive: false } } },
            });
        }

        const device = await prisma.device.delete({
            where: { device_id: duid },
        });

        return resSuccess({
            res,
            title: "Success delete device, set room to false",
            data: { device },
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed to validate pin",
            errors: error,
        });
    }
};

/** Fungsi untuk mengubah pin device pintu */
exports.changePin = async (req, res) => {
    const { duid } = req.params;
    const { newPin } = req.body;

    try {
        const device = await prisma.device.update({
            where: { device_id: duid },
            data: {
                pin: hasher(newPin),
            },
        });

        return resSuccess({
            res,
            title: "Success change pin",
            data: device,
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed to change pin",
            errors: error,
        });
    }
};
