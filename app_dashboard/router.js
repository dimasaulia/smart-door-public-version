const express = require("express");
const router = express.Router();
const dashboard = require("./dashboardControllers");
const { loginRequired, allowedRole } = require("../middlewares/uiMiddlewares");

router.get(
    "/",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS", "OPERATOR"),
    dashboard.dashboard
);
router.get(
    "/card/list",
    loginRequired,
    allowedRole("ADMIN", "OPERATOR"),
    dashboard.cardList
);
router.get(
    "/card/pair",
    loginRequired,
    allowedRole("ADMIN", "OPERATOR"),
    dashboard.userPairingToDashboard
);
router.get(
    "/user/list",
    loginRequired,
    allowedRole("ADMIN", "OPERATOR"),
    dashboard.userList
);
router.get(
    "/card/scan",
    loginRequired,
    allowedRole("ADMIN", "OPERATOR"),
    dashboard.scanCard
);

// ROOM
router.get(
    "/room/list",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS", "OPERATOR"),
    dashboard.roomList
);

router.get(
    "/room/create",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    dashboard.createroom
);

router.get(
    "/room/detail/:ruid",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS", "OPERATOR"),
    dashboard.roomDetail
);

router.get(
    "/room/edit/:ruid",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
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
