const express = require("express");
const router = express.Router();

const API_V1 = require("./app_api_smart_door/router");
const DASHBOARD = require("./app_dashboard/router");

router.use("/api/v1", API_V1);
router.use("/", DASHBOARD);
router.get("/js.cookie.js", function (req, res) {
    res.sendFile(__dirname + "/node_modules/js-cookie/dist/js.cookie.js");
});

module.exports = router;
