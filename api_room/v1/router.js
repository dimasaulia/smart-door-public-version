const router = require("express").Router();
const room = require("./controllers_room");
const { body, query } = require("express-validator");
const { formChacker } = require("../../middlewares/formMiddleware");
const {
    loginRequired,
    allowedRole,
} = require("../../middlewares/authMiddlewares");
const {
    cardIsExist,
    cardIsPair,
    isUserCard,
} = require("../../middlewares/cardMiddlewares");
const {
    roomIsExist,
    roomRequestNotExist,
    roomAccessNotExist,
} = require("../../middlewares/roomMiddlewares");
const {
    requestIsExist,
} = require("../../middlewares/requestAccessMiddlewares");

// ROOM ROUTER
router.get("/list", loginRequired, allowedRole("ADMIN"), room.list);
router.get(
    "/accaptable-user/:ruid",
    loginRequired,
    allowedRole("ADMIN"),
    roomIsExist,
    room.accaptableUser
);
router.get(
    "/requestUser/:ruid",
    loginRequired,
    allowedRole("ADMIN"),
    roomIsExist,
    room.requestRoomByUser
);
router.get("/u/list", loginRequired, allowedRole("USER"), room.list);
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
    allowedRole("ADMIN"),
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
    roomIsExist,
    roomRequestNotExist,
    roomAccessNotExist,
    room.roomRequest
);
router.post("/get-or-create", room.getOrCreateRoom); //HW API
router.post("/update/:ruid", loginRequired, allowedRole("ADMIN"), room.update);
router.delete(
    "/delete/:ruid",
    loginRequired,
    allowedRole("ADMIN"),
    roomIsExist,
    room.delete
);
router.post(
    "/pair",
    loginRequired,
    allowedRole("ADMIN"),
    query("ruid").notEmpty(),
    query("cardNumber").notEmpty(),
    query("requestId").notEmpty(),
    formChacker,
    cardIsExist,
    cardIsPair,
    roomIsExist,
    requestIsExist,
    roomAccessNotExist,
    room.pairRoomToCard
);
router.post(
    "/check-in/:ruid",
    roomIsExist,
    cardIsExist,
    cardIsPair,
    room.roomCheckIn
);
router.get(
    "/logs/:ruid",
    loginRequired,
    allowedRole("ADMIN"),
    roomIsExist,
    room.logs
);

module.exports = router;
