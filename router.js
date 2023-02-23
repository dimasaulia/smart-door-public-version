const express = require("express");
const router = express.Router();
const uiMiddlewares = require("./middlewares/uiMiddlewares");
const { setUser } = require("./middlewares/authMiddlewares");
const API_V1 = (route) => `/api/v1/${route}`;
const DASHBOARD = require("./app_dashboard/router");
const PROFILE = require("./app_profile/router");
const AUTH = require("./app_auth/router");
const USER = require("./app_user/router");
const ROLE_V1 = require("./api_role/v1/router");
const CARD_V1 = require("./api_card/v1/router");
const ROOM_V1 = require("./api_room/v1/router");
const ROOM_V2 = require("./api_room/v2/router");
const ROOM_RECORD_V1 = require("./api_room_record/v1/router");
const USER_V1 = require("./api_user/v1/router");
const API_KEY_V1 = require("./api_key/v1/router");
const BUILDING_V1 = require("./api_building/v1/router");

router.get("*", setUser);
router.use(API_V1("role"), ROLE_V1);
router.use(API_V1("card"), CARD_V1);
router.use(API_V1("room"), ROOM_V1);
router.use("/api/v2/room", ROOM_V2);
router.use(API_V1("room-record"), ROOM_RECORD_V1);
router.use(API_V1("user"), USER_V1);
router.use(API_V1("api-management"), API_KEY_V1);
router.use(API_V1("building"), BUILDING_V1);
router.use("/dashboard", DASHBOARD);
router.use("/auth", AUTH);
router.use("/profile", PROFILE);
router.use("/", USER);
router.get("/js.cookie.js", function (req, res) {
    res.sendFile(__dirname + "/node_modules/js-cookie/dist/js.cookie.js");
});

module.exports = router;
