const router = require("express").Router();
const room = require("./controllers_room");
const { body, query, param } = require("express-validator");
const { formChacker } = require("../../middlewares/formMiddleware");
const {
    loginRequired,
    allowedRole,
} = require("../../middlewares/authMiddlewares");
const {
    cardIsExist,
    cardIsPair,
    isUserCard,
    isNewPinMatch,
    isTwoStepAuth,
} = require("../../middlewares/cardMiddlewares");
const {
    roomIsExist,
    roomRequestNotExist,
    roomAccessNotExist,
    isRoomTurePin,
    cardIsHaveAccess,
    roomIsActive,
    deviceIsExist,
    deviceNotPair,
    roomIsPair,
} = require("../../middlewares/roomMiddlewares");
const {
    requestIsExist,
} = require("../../middlewares/requestAccessMiddlewares");
const { apiValidation } = require("../../middlewares/apiKeyMiddlewares");

// ROOM ROUTER
router.get(
    "/list",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    room.list
);
router.get(
    "/accaptable-user/:ruid",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    roomIsExist,
    room.accaptableUser
);
router.get(
    "/requestUser/:ruid",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    roomIsExist,
    room.requestRoomByUser
);
router.get("/u/list", loginRequired, allowedRole("USER"), room.activeRoomList);
router.get(
    "/u/accesable/:cardNumber",
    loginRequired,
    cardIsExist,
    allowedRole("USER"),
    room.userAccessableRoom
);
router.get(
    "/detail/:ruid",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    roomIsExist,
    room.detail
);
router.post(
    "/u/request",
    query("cardNumber").notEmpty(),
    query("ruid").notEmpty(),
    formChacker,
    loginRequired,
    allowedRole("USER"),
    cardIsExist,
    isUserCard,
    roomIsPair,
    roomIsActive,
    roomRequestNotExist,
    roomAccessNotExist,
    room.roomRequest
);
router.post(
    "/update/:ruid",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    roomIsExist,
    deviceIsExist,
    deviceNotPair,
    room.update
);
router.delete(
    "/delete/:ruid",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    roomIsExist,
    room.delete
);
router.post(
    "/pair",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    query("ruid").notEmpty(),
    query("cardNumber").notEmpty(),
    query("requestId").notEmpty(),
    formChacker,
    cardIsExist,
    cardIsPair,
    roomIsExist,
    roomIsActive,
    requestIsExist,
    roomAccessNotExist,
    room.pairRoomToCard
);
router.post("/get-or-create", room.getOrCreateRoom); //HW API
router.get(
    "/logs/:ruid",
    loginRequired,
    allowedRole("ADMIN", "ADMIN TEKNIS"),
    roomIsExist,
    room.logs
);
router.post(
    "/validate/:ruid",
    body("pin").isLength({ min: "6", max: "6" }).notEmpty(),
    formChacker,
    roomIsExist,
    room.validatePin
); // HW OLD API
router.post(
    "/check-in/:ruid",
    param("ruid").notEmpty(),
    body("cardNumber").notEmpty(),
    formChacker,
    roomIsExist,
    cardIsExist,
    cardIsPair,
    cardIsHaveAccess,
    isTwoStepAuth,
    room.roomCheckIn
); //HW OLD API

module.exports = router;
