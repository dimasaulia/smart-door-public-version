const { PrismaClient } = require("@prisma/client");
const { resSuccess, resError } = require("../../services/responseHandler");
const prisma = new PrismaClient();
const ITEM_LIMIT = Number(process.env.ITEM_LIMIT) || 10;

exports.list = async (req, res) => {
    const { search, cursor } = req.query;
    let roleList;
    try {
        if (search) {
            if (!cursor) {
                roleList = await prisma.role.findMany({
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
                roleList = await prisma.role.findMany({
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
                roleList = await prisma.role.findMany({
                    orderBy: {
                        name: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }
            if (cursor) {
                roleList = await prisma.role.findMany({
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
            title: "Success listed all role",
            data: roleList,
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

exports.detail = async (req, res) => {
    const { roleId } = req.params;

    const role = await prisma.role.findUnique({
        where: {
            id: roleId,
        },
    });

    return resSuccess({
        res,
        title: `Success get detail of ${role.name}`,
        data: role,
    });
};

exports.create = async (req, res) => {
    try {
        const newRole = await prisma.role.create({
            data: {
                name: req.body.name.toUpperCase(),
            },
        });
        return resSuccess({
            res,
            title: `Success created role of ${newRole.name}`,
            data: newRole,
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

exports.delete = async (req, res) => {
    try {
        const { roleId } = req.params;
        const deletedRole = await prisma.role.delete({
            where: {
                id: roleId,
            },
        });
        return resSuccess({
            res,
            title: `Success deleted role of ${deletedRole.name}`,
            data: deletedRole,
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

exports.update = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { name } = req.body;

        const updatedRole = await prisma.role.update({
            where: {
                id: roleId,
            },
            data: {
                name,
            },
        });
        return resSuccess({
            res,
            title: `Success updated role of ${updatedRole.name}`,
            data: updatedRole,
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};
