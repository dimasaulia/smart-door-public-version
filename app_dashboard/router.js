const express = require("express");
const router = express.Router();
const controllers = require("./controllers");

router.get("/list", controllers.list);
router.get("/pair", controllers.userPairingToDashboard);

module.exports = router;
