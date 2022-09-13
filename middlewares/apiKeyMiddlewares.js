const { PrismaClient } = require("@prisma/client");
const { ErrorException, resError } = require("../services/responseHandler");
const prisma = new PrismaClient();
const location = "API Key Middlewares";
const apiIDIsExist = async (req, res, next) => {
    const { id } = req.params;
    try {
        const key = await prisma.api_Key.findUnique({ where: { id } });
        if (!key)
            throw new ErrorException({
                type: "Api Key",
                detail: "Can't Find API Key",
                location,
            });
        return next();
    } catch (error) {
        return resError({
            res,
            title: error["Api Key"].detail,
            errors: `${error["Api Key"].detail} at ${error["Api Key"].location}`,
        });
    }
};

const apiValidation = async (req, res, next) => {
    const { id, key: secret } = req.query;
    try {
        if (!(id && secret))
            throw new ErrorException({
                type: "Api Key",
                detail: "Missing API ID & API Key",
                location,
            });
        return next();
    } catch (error) {
        return resError({
            res,
            title: error["Api Key"].detail,
            errors: `${error["Api Key"].detail} at ${error["Api Key"].location}`,
        });
    }
};

module.exports = { apiIDIsExist, apiValidation };
