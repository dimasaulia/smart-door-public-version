const resError = ({
    res,
    title = "Failed execute task",
    errors,
    code = 400,
}) => {
    return res.status(code).json({
        success: false,
        message: title,
        data: {
            errors,
        },
    });
};

const resSuccess = ({
    res,
    title = "Successfully execute task",
    data,
    code = 200,
}) => {
    return res.status(code).json({
        success: true,
        message: title,
        data,
    });
};

function ErrorException({ type, detail, location = "not specified" }) {
    this[`${type}`] = { type, detail, location };
}

module.exports = { resError, resSuccess, ErrorException };
