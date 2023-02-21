const express = require("express");
const router = express.Router();
const dashboard = require("./dashboardControllers");
const {
    loginRequired,
    allowedRole,
    accountIsVerified,
} = require("../middlewares/uiMiddlewares");

router.get(
    "/",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS", "OPERATOR"),
    accountIsVerified,
    dashboard.dashboard
);
router.get(
    "/card/list",
    loginRequired,
    allowedRole("ADMIN", "OPERATOR"),
    accountIsVerified,
    dashboard.cardList
);
router.get(
    "/card/pair",
    loginRequired,
    allowedRole("ADMIN", "OPERATOR"),
    accountIsVerified,
    dashboard.userPairingToDashboard
);
router.get(
    "/card/scan",
    loginRequired,
    allowedRole("ADMIN", "OPERATOR"),
    accountIsVerified,
    dashboard.scanCard
);
router.get(
    "/user/list",
    loginRequired,
    allowedRole("ADMIN", "OPERATOR"),
    accountIsVerified,
    dashboard.userList
);
router.get(
    "/user/edit/:username",
    loginRequired,
    allowedRole("ADMIN"),
    accountIsVerified,
    dashboard.userEdit
);
// ROOM
router.get(
    "/room/list",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS", "OPERATOR"),
    accountIsVerified,
    dashboard.roomList
);

router.get(
    "/room/create",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    accountIsVerified,
    dashboard.createroom
);

router.get(
    "/room/detail/:ruid",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS", "OPERATOR"),
    accountIsVerified,
    dashboard.roomDetail
);

router.get(
    "/room/edit/:ruid",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    accountIsVerified,
    dashboard.roomEdit
);

// API
router.get(
    "/api",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    accountIsVerified,
    dashboard.apiList
);

// HARDWARE

router.get(
    "/hardware",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    accountIsVerified,
    dashboard.hardware
);

module.exports = router;
