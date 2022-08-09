const express = require("express");
const router = express.Router();

const { setUser } = require("./middlewares/authMiddlewares");
const API_V1 = (route) => `/api/v1/${route}`;
const DASHBOARD = require("./app_dashboard/router");
const AUTH = require("./app_auth/router");
const USER = require("./app_user/router");
const ROLE_V1 = require("./api_role/v1/router");

router.use(API_V1("role"), ROLE_V1);
router.use("/dashboard", DASHBOARD);
router.use("/auth", AUTH);
router.use("/", USER);
router.get("*", setUser);
router.get("/js.cookie.js", function (req, res) {
    res.sendFile(__dirname + "/node_modules/js-cookie/dist/js.cookie.js");
});

module.exports = router;
