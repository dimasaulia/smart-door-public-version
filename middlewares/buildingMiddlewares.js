const prisma = require("../prisma/client");
const { getUser } = require("../services/auth");
const { resError, ErrorException } = require("../services/responseHandler");

/** Fungsi untuk memastikan semua username yang dikirim melalui body terdaftar di database */
const allUsernamesExist = async (req, res, next) => {
    try {
        const { usernames } = req.body;

        const users = await prisma.user.findMany({
            where: {
                username: { in: usernames },
            },
            select: {
                username: true,
            },
        });

        const arrayOfUsers = users.map((user) => user.username);
        users.forEach((user) => arrayOfUsers.push(user.username));
        const notExistingUsers = usernames.filter(
            (user) => !arrayOfUsers.includes(user)
        );

        if (users.length !== usernames.length)
            throw `${notExistingUsers.join(", ")}, does not exist in system`;

        return next();
    } catch (error) {
        resError({
            res,
            errors: error,
            title: "One or more of username does not exist",
        });
    }
};

/** Fungsi untuk memastikan semua username yang dikirim melalui body terdaftar sebagai operator di database */
const allUsernamesIsOperator = async (req, res, next) => {
    try {
        const { usernames } = req.body;

        const users = await prisma.user.findMany({
            where: {
                username: { in: usernames },
            },
            select: {
                username: true,
                role: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        const nonOperatorUsers = users.filter(
            (user) => user.role.name !== "OPERATOR"
        );

        if (nonOperatorUsers.length > 0)
            throw `${nonOperatorUsers
                .map((user) => user.username)
                .join(", ")} is not operator`;

        return next();
    } catch (error) {
        resError({
            res,
            errors: error,
            title: "One or more of username is not Operator",
        });
    }
};

/** Fungsi untuk memastikan semua ruangan yang dikirim melalui body terdaftar di database */
const allRoomExist = async (req, res, next) => {
    try {
        const { ruids } = req.body;

        const rooms = await prisma.room.findMany({
            where: {
                ruid: { in: ruids },
            },
            select: {
                ruid: true,
            },
        });

        const arrayOfRooms = rooms.map((room) => room.ruid);
        const notExistingRooms = ruids.filter(
            (room) => !arrayOfRooms.includes(room)
        );

        if (ruids.length !== rooms.length)
            throw `${notExistingRooms.join(", ")}, does not exist in system`;

        return next();
    } catch (error) {
        resError({
            res,
            errors: error,
            title: "One or more of room id does not exist",
        });
    }
};

/** Fungsi untuk memastikan hanya operator tertentu yang bisa melihat detail ruangan */
const onlyAccessibleByLinkedOperators = async (req, res, next) => {
    try {
        const id = getUser(req);
        const ruid = req.body.ruid || req.params.ruid || req.query.ruid;

        const {
            role: { name: roleName },
        } = await prisma.user.findUnique({
            where: { id },
            select: { role: { select: { name: true } } },
        });

        if (roleName === "ADMIN" || roleName === "ADMIN TEKNIS") return next();

        const room = await prisma.room.findUnique({
            where: { ruid },
            select: { Building: { select: { operator: true } } },
        });

        const operators = room.Building.operator.map((data) => data.id);

        if (!operators.includes(id)) throw "You are not operator of this room";

        return next();
    } catch (error) {
        resError({
            res,
            errors: error,
            title: "Room only accessible by linked operators",
        });
    }
};

/** Fungsi untuk memastikan suatu ruangan telah ditautkan ke sebuah gedung */
const roomHasLinkedBuilding = async (req, res, next) => {
    try {
        const ruid = req.body.ruid || req.params.ruid || req.query.ruid;
        const room = await prisma.room.findUnique({
            where: { ruid },
            select: { Building: true },
        });
        if (room.Building === null) throw "Please link this room to Building";
        return next();
    } catch (error) {
        resError({
            res,
            errors: error,
            title: "Warning, This room not linked to any building",
        });
    }
};

/** Fungsi untuk memastikan seluruh ruangan dalam form body tidak ditautkan ke sebuah gedung */
const allRoomNotLinkedToBuilding = async (req, res, next) => {
    try {
        const { ruids } = req.body;
        const rooms = await prisma.room.findMany({
            where: {
                ruid: { in: ruids },
            },
            select: { name: true, Building: true },
        });
        const roomAlreadyHasBuilding = rooms.flatMap((room) =>
            room.Building !== null ? room : []
        );
        if (roomAlreadyHasBuilding.length > 0)
            throw `${roomAlreadyHasBuilding
                .map((room) => room.name)
                .join(", ")} already linked to a building`;
        return next();
    } catch (error) {
        resError({
            res,
            errors: error,
            title: "Warning, This room already linked a building",
        });
    }
};
module.exports = {
    allUsernamesExist,
    allUsernamesIsOperator,
    allRoomExist,
    onlyAccessibleByLinkedOperators,
    roomHasLinkedBuilding,
    allRoomNotLinkedToBuilding,
};
