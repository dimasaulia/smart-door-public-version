const prisma = require("../prisma/client");
const { ErrorException, resError } = require("../services/responseHandler");
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
            title: "Cant find API",
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
        const { secret: serverSideSecret } = await prisma.api_Key.findUnique({
            where: { id },
        });
        if (!(serverSideSecret === secret))
            throw new ErrorException({
                type: "Api Key",
                detail: "API ID and/or API Key not match",
                location,
            });
        return next();
    } catch (error) {
        return resError({
            res,
            title: "Cant find the api",
        });
    }
};

const apiJWTValidation = async (req, res, next) => {
    try {
        console.log("apiJWTValidation");
        return next();
    } catch (error) {}
};

module.exports = { apiIDIsExist, apiValidation, apiJWTValidation };
