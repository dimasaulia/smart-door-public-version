const prisma = require("../../prisma/client");
const { resSuccess, resError } = require("../../services/responseHandler");
const ITEM_LIMIT = Number(process.env.CARD_ITEM_LIMIT) || 10;

exports.init = async (req, res) => {
    try {
        return resSuccess({
            res,
            title: "Success initialize hardware",
            data: [],
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed to initialize device",
            errors: error,
        });
    }
};
