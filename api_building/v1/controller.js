const prisma = require("../../prisma/client");
const { resSuccess, resError } = require("../../services/responseHandler");

exports.create = async (req, res) => {
    try {
        const { name, usernames, ruids } = req.body;
        const building = await prisma.building.create({
            data: {
                name,
                rooms: {
                    connect: ruids.map((ruid) => ({ ruid: ruid })),
                },
                operator: {
                    connect: usernames.map((user) => ({ username: user })),
                },
            },
        });
        return resSuccess({ res, code: 201, data: building });
    } catch (error) {
        console.log(error);
        return resError({ res, title: "Cant create Building", errors: error });
    }
};
