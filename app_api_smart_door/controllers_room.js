const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const { resError, resSuccess } = require("../services/error");
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
                id: "asc",
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
        res.status(202).json({
            title: "successfully deleted the room",
            msg: deletedRoom,
        });
    } catch (err) {
        res.status(500).json({
            title: "Something wrong",
            msg: err,
        });
    }
};

exports.pairRoomToCard = async (req, res) => {
    const { roomId, cardNumber } = req.body;
    try {
        const updatedRoom = await prisma.room.update({
            where: {
                ruid: roomId,
            },
            data: {
                card: {
                    connect: {
                        card_number: cardNumber,
                    },
                },
            },
        });
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
            (card) => card.card_number === cardNumber
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
