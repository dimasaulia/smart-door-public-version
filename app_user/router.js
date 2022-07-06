const express = require("express");
const router = express.Router();
const user = require("./userDashboardControllers");
const { loginRequired, allowedRole } = require("../middlewares/uiMiddlewares");

router.get("/", loginRequired, allowedRole("USER"), user.home);
router.get("/card/:id", loginRequired, allowedRole("USER"), user.cardLogs);
router.get("/room/:card", loginRequired, allowedRole("USER"), user.cardRoom);

module.exports = router;
