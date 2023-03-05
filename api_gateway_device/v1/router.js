const gatewayDevice = require("./controller");
const router = require("express").Router();

router.get("/init", gatewayDevice.init);

module.exports = router;
