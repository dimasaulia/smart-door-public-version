const express = require("express");
const router = express.Router();
const controllers = require("./controllers");

router.get("/", controllers.dashboard);
router.get("/list", controllers.cardList);
router.get("/pair", controllers.userPairingToDashboard);

module.exports = router;
