const { ErrorException, resError } = require("../services/responseHandler");
const prisma = require("../prisma/client");

const roleIDIsExist = async (req, res, next) => {
    const { roleId } = req.params;
    try {
        const roleDetail = await prisma.role.findUnique({
            where: {
                id: roleId,
            },
        });

        if (roleDetail === null) {
            throw new ErrorException({
                type: "role",
                detail: "Role not exist",
                location: "Role Midlleware",
            });
        }

        return next();
    } catch (error) {
        return resError({ res, title: "Something Wrong", errors: error });
    }
};

const roleNameIsNotExist = async (req, res, next) => {
    const { name } = req.body;
    try {
        const roleDetail = await prisma.role.findUnique({
            where: {
                name,
            },
        });

        if (roleDetail !== null) {
            throw new ErrorException({
                type: "role",
                detail: "Role already exist",
                location: "Role Midlleware",
            });
        }

        return next();
    } catch (error) {
        return resError({ res, title: "Something Wrong", errors: error });
    }
};

module.exports = { roleIDIsExist, roleNameIsNotExist };
