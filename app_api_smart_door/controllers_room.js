const { resError, resSuccess } = require("../services/responseHandler");
const { getUser } = require("../services/auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const { request } = require("express");

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
            res.status(201).json({
                title: "successfully created a room",
                msg: newRoom,
            });
            return; //stop function
        }

        res.status(200).json({
            title: "successfully find the room",
            msg: getRoom,
        });
        return; //stop function
    } catch (err) {
        res.status(500).json({
            title: "Something wrong",
            msg: err,
        });
    }
};

exports.detail = async (req, res) => {
    const ruid = req.params.ruid; // stands for room unique id
    try {
        const detailRoom = await prisma.room.findUnique({
            where: {
                ruid: ruid,
            },
        });
        if (detailRoom === null) throw "Room not found";
        res.json(detailRoom);
    } catch (err) {
        res.status(422).json({
            code: 422,
            msg: err,
        });
    }
};

exports.list = async (req, res) => {
    try {
        const roomList = await prisma.room.findMany({
            orderBy: {
                name: "asc",
            },
        });
        res.status(200).json(roomList);
    } catch (err) {
        res.status(500).json({
            title: "Something wrong",
            msg: err,
        });
    }
};

exports.update = async (req, res) => {
    const ruid = req.params.ruid; // stands for room unique id
    const roomName = req.body.roomName;
    try {
        const updatedRoom = await prisma.room.update({
            where: {
                ruid: ruid,
            },
            data: {
                name: roomName,
            },
        });

        res.status(201).json({
            title: "successfully updated the room",
            msg: updatedRoom,
        });
    } catch (err) {
        res.status(500).json({
            title: "Something wrong",
            msg: err,
        });
    }
};

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
        res.status(500).json({
            title: "Something wrong",
            msg: err,
        });
    }
};

exports.pairRoomToCard = async (req, res) => {
    console.log("updatedRoom");

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
        console.log(error);
        return resError({
            res,
            title: "Gagal memberi akses ruangan",
            errors: error,
        });
    }
};

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
        if (!findedCard) throw "You can't access this room";

        const matchPin = await bcrypt.compareSync(pin, findedCard.pin);
        if (!matchPin) throw "Your pin is incorrect, try again";

        return resSuccess({
            res,
            title: `Berhasil membuka ruangan ${room.ruid}`,
        });
    } catch (error) {
        return resError({
            res,
            title: "Gagal membuka ruangan",
            errors: error,
        });
    }
};

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
        console.log(error);
        return resError({
            res,
            title: "Gagal meminta ruangan",
            errors: error,
        });
    }
};

exports.userAccessableRoom = async (req, res) => {
    try {
        const { cardNumber: card_number } = req.params;
        const accessAbleRoom = await prisma.room.findMany({
            where: {
                card: {
                    some: {
                        card_number,
                    },
                },
            },
            select: {
                name: true,
                ruid: true,
            },
        });
        console.log(accessAbleRoom);
        return resSuccess({
            res,
            title: "Successful listed room",
            data: accessAbleRoom,
        });
    } catch (error) {
        console.log(error);
        return resError({
            res,
            title: "Gagal memuat ruangan",
            errors: error,
        });
    }
};

exports.accaptableUser = async (req, res) => {
    try {
        const { ruid } = req.params;
        const accaptableUser = await prisma.room.findMany({
            where: { ruid },
            include: {
                card: {
                    include: {
                        user: true,
                    },
                },
            },
        });
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
        console.log(error);
        return resError({
            res,
            title: "Gagal memuat user yang mimnta request",
            errors: error,
        });
    }
};
