const router = require("express").Router();
const room = require("./controllers");
const { apiValidation } = require("../../middlewares/apiKeyMiddlewares");
const { param, body } = require("express-validator");
const {
    cardIsExist,
    cardIsPair,
    isTwoStepAuth,
    isNewPinMatch,
} = require("../../middlewares/cardMiddlewares");
const {
    roomIsExist,
    cardIsHaveAccess,
    deviceIsExist,
    deviceNotPair,
    roomIsPair,
    deviceIsPair,
    isRoomTurePin,
    isDeviceTurePin,
} = require("../../middlewares/roomMiddlewares");
const { formChacker } = require("../../middlewares/formMiddleware");
const {
    loginRequired,
    allowedRole,
} = require("../../middlewares/authMiddlewares");

router.post(
    "/device/pair/",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    body("name").notEmpty().withMessage("Room Name required"),
    body("duid").notEmpty().withMessage("Device Form required"),
    deviceIsExist,
    deviceNotPair,
    formChacker,
    room.createRoom
);
router.get(
    "/device/list",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    room.deviceList
);
router.delete(
    "/device/delete/:duid",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    deviceIsExist,
    room.deviceDelete
);
router.post(
    "/device/change-pin/:duid",
    loginRequired,
    allowedRole("ADMIN"),
    param("duid").notEmpty(),
    body("newPin").notEmpty().isNumeric().isLength({ min: "6", max: "6" }),
    body("confirmNewPin")
        .notEmpty()
        .isNumeric()
        .isLength({ min: "6", max: "6" }),
    body("oldPin").notEmpty().isNumeric().isLength({ min: "6", max: "6" }),
    formChacker,
    deviceIsExist,
    isNewPinMatch,
    isDeviceTurePin,
    room.changePin
);
router.post("/h/init", apiValidation, room.createDevice); //HW API
router.get("/h/detail/:duid", apiValidation, deviceIsExist, room.detail);
router.post(
    "/h/check-in/:duid",
    apiValidation,
    param("duid").notEmpty(),
    body("cardNumber").notEmpty(),
    formChacker,
    deviceIsExist,
    deviceIsPair,
    cardIsExist,
    cardIsPair,
    cardIsHaveAccess,
    isTwoStepAuth,
    room.roomCheckIn
); //HW ID
router.post(
    "/h/validate/:duid",
    apiValidation,
    body("pin").isLength({ min: "6", max: "6" }).notEmpty(),
    formChacker,
    deviceIsExist,
    deviceIsPair,
    room.validatePin
); // HW NEW API
module.exports = router;
