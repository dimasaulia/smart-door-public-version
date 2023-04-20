const prisma = require("../../prisma/client");
const { resSuccess, resError } = require("../../services/responseHandler");
const { random: stringGenerator } = require("@supercharge/strings");
const { hasher, hashChecker } = require("../../services/auth");
const ITEM_LIMIT = Number(process.env.CARD_ITEM_LIMIT) || 10;
// const ITEM_LIMIT = 5;

exports.createGatewayDevice = async (req, res) => {
    try {
        let gatewayShortId = stringGenerator(5);
        let generateID = true;
        const PIN = process.env.DEFAULT_HW_PIN;

        while (generateID) {
            const gatewayShortIdIsEmpty =
                await prisma.gateway_Device.findUnique({
                    where: {
                        gateway_short_id: gatewayShortId,
                    },
                });

            if (!gatewayShortIdIsEmpty) {
                generateID = false;
                break;
            }

            gatewayShortId = stringGenerator(5);
        }
        const gatewayDeviceData = await prisma.gateway_Device.create({
            data: {
                gateway_short_id: gatewayShortId,
                lastOnline: new Date(),
                pin: hasher(PIN),
            },
            select: {
                gateway_short_id: true,
            },
        });

        return resSuccess({
            res,
            title: "Success initialize hardwaresss",
            data: gatewayDeviceData,
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed to initialize device",
            errors: error,
        });
    }
};

exports.list = async (req, res) => {
    try {
        const { search, cursor } = req.query;
        let gatewayList;
        if (search) {
            if (!cursor) {
                gatewayList = await prisma.gateway_Device.findMany({
                    where: {
                        gateway_short_id: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    orderBy: {
                        gateway_short_id: "asc",
                    },
                    take: ITEM_LIMIT,
                    select: {
                        id: true,
                        gateway_short_id: true,
                        lastOnline: true,
                        createdAt: true,
                    },
                });
            }

            if (cursor) {
                gatewayList = await prisma.gateway_Device.findMany({
                    where: {
                        gateway_short_id: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    take: ITEM_LIMIT,
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                    orderBy: {
                        gateway_short_id: "asc",
                    },
                    select: {
                        id: true,
                        gateway_short_id: true,
                        lastOnline: true,
                        createdAt: true,
                    },
                });
            }
        }

        if (!search) {
            if (!cursor) {
                gatewayList = await prisma.gateway_Device.findMany({
                    orderBy: {
                        gateway_short_id: "asc",
                    },
                    take: ITEM_LIMIT,
                    select: {
                        id: true,
                        gateway_short_id: true,
                        lastOnline: true,
                        createdAt: true,
                    },
                });
            }
            if (cursor) {
                gatewayList = await prisma.gateway_Device.findMany({
                    orderBy: {
                        gateway_short_id: "asc",
                    },
                    take: ITEM_LIMIT,
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                    select: {
                        id: true,
                        gateway_short_id: true,
                        lastOnline: true,
                        createdAt: true,
                    },
                });
            }
        }

        return resSuccess({
            res,
            title: "Success get gateway device list",
            data: gatewayList,
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed to get gateway device list",
            errors: error,
        });
    }
};

exports.generalInformation = async (req, res) => {
    try {
        const countOfGateway = await prisma.gateway_Device.count();
        const countOfNodwWithMultiNetworkType = await prisma.device.count({
            where: { deviceType: "MULTI_NETWORK" },
        });
        const gatewayList = await prisma.gateway_Device.findMany({
            orderBy: {
                gateway_short_id: "asc",
            },
            take: ITEM_LIMIT,
            select: {
                id: true,
                gateway_short_id: true,
                lastOnline: true,
                createdAt: true,
            },
        });
        return resSuccess({
            res,
            title: "Success get gateway device general information",
            data: {
                countOfGateway,
                countOfNodwWithMultiNetworkType,
                gatewayList,
            },
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed to get gateway detail information",
            errors: error,
        });
    }
};

exports.detail = async (req, res) => {
    try {
        const { gatewayShortId } = req.params;
        const data = await prisma.gateway_Device.findUnique({
            where: {
                gateway_short_id: gatewayShortId,
            },
        });
        return resSuccess({
            res,
            title: "Success get gateway device detail information",
            data,
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed to get gateway detail information",
            errors: error,
        });
    }
};

exports.updateOnline = async (req, res) => {
    try {
        const { gatewayShortId } = req.params;
        const { lastOnline, gateway_short_id } =
            await prisma.gateway_Device.update({
                where: {
                    gateway_short_id: gatewayShortId,
                },
                data: {
                    lastOnline: new Date(),
                },
                select: {
                    lastOnline: true,
                    gateway_short_id: true,
                },
            });
        return resSuccess({
            res,
            title: "Success update last online",
            data: { lastOnline, gatewayShortId },
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed to get gateway detail information",
            errors: error,
        });
    }
};

exports.autocomplate = async (req, res) => {
    try {
        const search = req.query.term;
        const results = [];
        const searchResult = await prisma.gateway_Device.findMany({
            where: {
                gateway_short_id: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            select: {
                id: true,
                gateway_short_id: true,
            },
            take: ITEM_LIMIT,
        });

        searchResult.forEach((data) => {
            const { gateway_short_id, id } = data;
            results.push({ value: id, label: gateway_short_id });
        });

        return res.status(200).json(results);
    } catch (error) {
        return resError({
            res,
            title: "Cant get gateway device information",
            errors: error,
        });
    }
};

exports.accessCardForGateway = async (req, res) => {
    try {
        const { gatewayShortId } = req.params;
        const rooms = await prisma.gateway_Spot.findMany({
            where: {
                gatewayDevice: {
                    gateway_short_id: gatewayShortId,
                },
            },
            select: {
                nodeDevice: {
                    select: {
                        device_id: true,
                        room: {
                            select: {
                                ruid: true,
                            },
                        },
                    },
                },
            },
        });

        const ruidArray = rooms[0].nodeDevice
            .map((room) => room.room?.ruid)
            .filter((ruid) => ruid != undefined);

        const accessCard = await prisma.card.findMany({
            where: {
                room: {
                    some: {
                        ruid: { in: ruidArray },
                    },
                },
            },
            select: {
                id: true,
                card_number: true,
                pin: true,
                isTwoStepAuth: true,
                banned: true,
                card_status: true,
                room: {
                    where: {
                        ruid: {
                            in: ruidArray,
                        },
                    },
                    select: {
                        device: {
                            select: {
                                device_id: true,
                            },
                        },
                    },
                },
            },
        });

        return resSuccess({
            res,
            title: "Success get Access Card For Gateway",
            data: accessCard,
        });
    } catch (error) {
        return resError({
            res,
            title: "Cant get Access Card For This Gateway",
            errors: error,
        });
    }
};

exports.gatewayInitializeNode = async (req, res) => {
    try {
        const { gatewayShortId } = req.body;
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

        const { id: gateway_DeviceId } = await prisma.gateway_Device.findUnique(
            {
                where: { gateway_short_id: gatewayShortId },
                select: {
                    id: true,
                },
            }
        );
        const newDevice = await prisma.device.create({
            data: {
                device_id: duid,
                lastOnline: new Date(),
                deviceType: "MULTI_NETWORK",
                Gateway_Spot: {
                    connect: {
                        gateway_DeviceId,
                    },
                },
            },
        });
        return resSuccess({
            res,
            title: "Success create new node",
            data: newDevice,
        });
    } catch (error) {
        return resError({
            res,
            title: "Cant create gateway node",
            errors: error,
        });
    }
};

exports.deleteGateway = async (req, res) => {
    try {
        const { gatewayShortId } = req.body;
        const deleteGateway = await prisma.gateway_Device.delete({
            where: {
                gateway_short_id: gatewayShortId,
            },
            select: {
                gateway_short_id: true,
                id: true,
            },
        });
        return resSuccess({
            req,
            res,
            data: deleteGateway,
            title: "Success delete gateway device",
        });
    } catch (error) {
        return resError({
            res,
            title: "Cant delete gateway device",
            errors: error,
        });
    }
};
