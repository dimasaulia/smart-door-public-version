const express = require("express");
const router = express.Router();
const auth = require("./authControllers");
const {
    urlTokenIsValid,
    urlTokenIsMatch,
} = require("../middlewares/authMiddlewares");
const { formChacker } = require("../middlewares/formMiddleware");
const { body, query } = require("express-validator");
const { logoutRequired } = require("../middlewares/uiMiddlewares");
router.get("/login", logoutRequired, auth.login);
router.get("/register", logoutRequired, auth.register);
router.get("/forget", logoutRequired, auth.forget);
router.get(
    "/reset",
    logoutRequired,
    query("token").notEmpty().withMessage("Can't find token from your url"),
    formChacker,
    urlTokenIsValid,
    urlTokenIsMatch,
    auth.reset
);
module.exports = router;
