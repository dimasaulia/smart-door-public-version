const express = require("express");
const router = express.Router();

const API_V1 = require("./app_api_smart_door/router");
const DASHBOARD = require("./app_dashboard/router");
const AUTH = require("./app_auth/router");
const USER = require("./app_user/router");

router.use("/api/v1", API_V1);
router.use("/dashboard", DASHBOARD);
router.use("/auth", AUTH);
router.use("/", USER);
router.get("/js.cookie.js", function (req, res) {
    res.sendFile(__dirname + "/node_modules/js-cookie/dist/js.cookie.js");
});

module.exports = router;
