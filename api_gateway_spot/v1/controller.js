const prisma = require("../../prisma/client");
const { resSuccess, resError } = require("../../services/responseHandler");
const ITEM_LIMIT = Number(process.env.CARD_ITEM_LIMIT) || 10;

exports.list = async (req, res) => {
    try {
        return resSuccess({
            res,
            title: "Success get gateway list",
            data: [],
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed to get gateway list",
            errors: error,
        });
    }
};
