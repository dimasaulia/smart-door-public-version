const router = require("express").Router();
const controllers = require("./controller");
const { loginRequired } = require("../middlewares/uiMiddlewares");
router.get("/", loginRequired, controllers.profile);
module.exports = router;
