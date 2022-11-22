const express = require("express");
const router = express.Router();
const dashboard = require("./dashboardControllers");
const { loginRequired, allowedRole } = require("../middlewares/uiMiddlewares");

router.get("/", loginRequired, allowedRole("ADMIN"), dashboard.dashboard);
router.get(
    "/card/list",
    loginRequired,
    allowedRole("ADMIN"),
    dashboard.cardList
);
router.get(
    "/card/pair",
    loginRequired,
    allowedRole("ADMIN"),
    dashboard.userPairingToDashboard
);
router.get(
    "/user/list",
    loginRequired,
    allowedRole("ADMIN"),
    dashboard.userList
);

// ROOM
router.get(
    "/room/list",
    loginRequired,
    allowedRole("ADMIN"),
    dashboard.roomList
);

router.get(
    "/room/detail/:ruid",
    loginRequired,
    allowedRole("ADMIN"),
    dashboard.roomDetail
);

router.get(
    "/room/edit/:ruid",
    loginRequired,
    allowedRole("ADMIN"),
    dashboard.roomEdit
);

// API
router.get(
    "/api",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    dashboard.apiList
);

// HARDWARE

router.get(
    "/hardware",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    dashboard.hardware
);

module.exports = router;
