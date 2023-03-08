const prisma = require("../prisma/client");
const { resError } = require("../services/responseHandler");

const gatewaySpotIdIsExist = async (req, res, next) => {
    try {
        const id = req.body.id || req.query.id || req.params.id;
        await prisma.gateway_Spot.findUniqueOrThrow({
            where: {
                id,
            },
        });
        return next();
    } catch (error) {
        return resError({
            res,
            title: "Cant find Gateway Spot",
            errors: error,
        });
    }
};

module.exports = { gatewaySpotIdIsExist };
