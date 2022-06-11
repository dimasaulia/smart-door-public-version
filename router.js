const express = require("express");
const router = express.Router();

const API_V1 = require("./app_api_smart_door/router");

router.use("/api/v1", API_V1);

module.exports = router;
