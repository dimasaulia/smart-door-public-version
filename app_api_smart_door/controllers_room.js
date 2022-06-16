const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
