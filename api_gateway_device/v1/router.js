const { body } = require("express-validator");
const {
    loginRequired,
    allowedRole,
} = require("../../middlewares/authMiddlewares");
const { formChacker } = require("../../middlewares/formMiddleware");
const {
    gatewayShortIdIsExist,
    gatewayDeviceIsLinked,
    gatewayDeviceIsNotLinked,
} = require("../../middlewares/gatewayDeviceMiddlewares");
const gatewayDevice = require("./controller");
const { apiJWTValidation } = require("../../middlewares/apiKeyMiddlewares");
const { deviceIsExist } = require("../../middlewares/roomMiddlewares");
const router = require("express").Router();

router.post("/h/init", apiJWTValidation, gatewayDevice.createGatewayDevice); //HW
router.get(
    "/list",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    gatewayDevice.list
);
router.get(
    "/general-information",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    gatewayDevice.generalInformation
);
router.get(
    "/detail/:gatewayShortId",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    gatewayShortIdIsExist,
    gatewayDevice.detail
);
router.post(
    "/h/update-online-time/:gatewayShortId",
    apiJWTValidation,
    gatewayShortIdIsExist,
    gatewayDevice.updateOnline
); //HW
router.get(
    "/autocomplate",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    gatewayDevice.autocomplate
);
router.get(
    "/access-card-for-gateway/:gatewayShortId",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    gatewayShortIdIsExist,
    gatewayDevice.accessCardForGateway
);
router.get(
    "/h/access-card-for-gateway/:gatewayShortId",
    gatewayShortIdIsExist,
    gatewayDevice.accessCardForGateway
);
router.post(
    "/h/initialize-new-node",
    apiJWTValidation,
    body("gatewayShortId")
        .notEmpty()
        .withMessage("Gateway Short Id is Requried"),
    formChacker,
    gatewayShortIdIsExist,
    gatewayDeviceIsLinked,
    gatewayDevice.gatewayInitializeNode
); //HW
router.post(
    "/h/node-online-update",
    apiJWTValidation,
    body("duid").notEmpty().withMessage("Device Unique ID (DUID) is Requried"),
    formChacker,
    deviceIsExist,
    gatewayDevice.gatewayNodeOnlineUpdate
); //HW
router.delete(
    "/delete/",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    gatewayShortIdIsExist,
    gatewayDeviceIsNotLinked,
    gatewayDevice.deleteGateway
);

module.exports = router;
