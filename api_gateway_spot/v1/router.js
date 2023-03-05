const gatewaySpot = require("./controller");
const router = require("express").Router();

router.get("/list", gatewaySpot.list);

module.exports = router;
