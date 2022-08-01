const { validationResult } = require("express-validator");
const { resError } = require("../services/responseHandler");

const formChacker = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    if (!errors.isEmpty()) {
        return resError({
            res,
            title: "Something wrong",
            errors: errors.errors,
            code: 403,
        });
    }
};

module.exports = { formChacker };
