const router = require("express").Router();
const room = require("./controllers");
const { apiValidation } = require("../../middlewares/apiKeyMiddlewares");
const { param, body } = require("express-validator");
const {
    cardIsExist,
    cardIsPair,
    isTwoStepAuth,
} = require("../../middlewares/cardMiddlewares");
const {
    roomIsExist,
    cardIsHaveAccess,
} = require("../../middlewares/roomMiddlewares");
const { formChacker } = require("../../middlewares/formMiddleware");

router.post("/h/init", apiValidation, room.createRoom); //HW API
router.get("/h/detail/:ruid", apiValidation, roomIsExist, room.detail);
router.post(
    "/h/check-in/:ruid",
    apiValidation,
    param("ruid").notEmpty(),
    body("cardNumber").notEmpty(),
    formChacker,
    roomIsExist,
    cardIsExist,
    cardIsPair,
    cardIsHaveAccess,
    isTwoStepAuth,
    room.roomCheckIn
); //HW ID
router.post(
    "/h/validate/:ruid",
    apiValidation,
    body("pin").isLength({ min: "6", max: "6" }).notEmpty(),
    formChacker,
    roomIsExist,
    room.validatePin
); // HW NEW API
module.exports = router;
