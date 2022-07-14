const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const role = require("./controllers_role");
const user = require("./controllers_user");
const card = require("./controllers_card");
const room = require("./controllers_room");
const { formChacker } = require("../middlewares/formMiddleware");
const {
    loginRequired,
    allowedRole,
} = require("../middlewares/authMiddlewares");
const {
    cardIsExist,
    cardIsPair,
    isUserCard,
    cardNotPair,
} = require("../middlewares/cardMiddlewares");
const {
    roomIsExist,
    roomRequestNotExist,
} = require("../middlewares/roomMiddlewares");
const {
    userIsExist,
    usernameIsExist,
} = require("../middlewares/userMiddlewares");
const { requestIsExist } = require("../middlewares/requestAccessMiddlewares");

// ROLE ROUTER
router.get("/role/list", loginRequired, allowedRole("ADMIN"), role.list);
router.get(
    "/role/detail/:id",
    loginRequired,
    allowedRole("ADMIN"),
    role.detail
);
router.post("/role/create", loginRequired, allowedRole("ADMIN"), role.create);
router.post(
    "/role/delete/:id",
    loginRequired,
    allowedRole("ADMIN"),
    role.delete
);
router.post(
    "/role/update/:id",
    loginRequired,
    allowedRole("ADMIN"),
    role.update
);

// USER ROUTER
router.get("/user/logout", user.logout);
router.get("/user/list", loginRequired, allowedRole("ADMIN"), user.list);
router.get(
    "/user/detail/:id",
    loginRequired,
    allowedRole("ADMIN"),
    user.detail
);
router.get("/user/search", loginRequired, allowedRole("ADMIN"), user.search);
router.post(
    "/user/register",
    body("username").notEmpty(),
    body("email").isEmail().trim(),
    body("password").isLength({ min: "8" }),
    formChacker,
    user.register
);
router.post(
    "/user/login",
    body("username").notEmpty(),
    body("password").isLength({ min: "8" }),
    formChacker,
    user.login
);
router.post("/user/update", loginRequired, allowedRole("ADMIN"), user.update);
router.delete(
    "/user/delete/:id",
    loginRequired,
    allowedRole("ADMIN"),
    userIsExist,
    user.delete
);
router.post(
    "/user/pair",
    loginRequired,
    allowedRole("ADMIN"),
    cardIsExist,
    usernameIsExist,
    cardNotPair,
    user.pairUserToCard
);

// CARD ROUTER
router.get(
    "/u/card/available",
    loginRequired,
    allowedRole("USER"),
    card.userCards
);
router.get(
    "/u/card/:cardNumber",
    loginRequired,
    allowedRole("USER"),
    cardIsExist,
    card.userCardsDetail
);
router.get(
    "/u/card/logs/:cardNumber",
    loginRequired,
    allowedRole("USER"),
    cardIsExist,
    card.userCardLogs
);
router.get("/card/available", loginRequired, allowedRole("ADMIN"), card.list);
router.get(
    "/card/unavailable",
    loginRequired,
    allowedRole("ADMIN"),
    card.registeredCards
);
router.get(
    "/card/detail/:cardNumber",
    loginRequired,
    allowedRole("ADMIN"),
    card.detail
);
router.post(
    "/card/register",
    body("cardNumber").notEmpty(),
    body("pin").notEmpty().isLength(6),
    formChacker,
    card.register
); // HW API
router.post("/card/validate", card.validateCard); // HW API

// ROOM ROUTER
router.get("/room/list", loginRequired, allowedRole("ADMIN"), room.list);
router.get(
    "/room/accaptableUser/:ruid",
    loginRequired,
    allowedRole("ADMIN"),
    roomIsExist,
    room.accaptableUser
);
router.get(
    "/room/requestUser/:ruid",
    loginRequired,
    allowedRole("ADMIN"),
    roomIsExist,
    room.requestRoomByUser
);
router.get("/u/room/list", loginRequired, allowedRole("USER"), room.list);
router.get(
    "/u/room/accesable/:cardNumber",
    loginRequired,
    cardIsExist,
    allowedRole("USER"),
    room.userAccessableRoom
);
router.get(
    "/room/detail/:ruid",
    loginRequired,
    allowedRole("ADMIN"),
    roomIsExist,
    room.detail
);
router.post(
    "/u/room/request",
    query("cardNumber").notEmpty(),
    query("ruid").notEmpty(),
    formChacker,
    loginRequired,
    allowedRole("USER"),
    cardIsExist,
    isUserCard,
    roomIsExist,
    roomRequestNotExist,
    room.roomRequest
);
router.post("/room/get-or-create", room.getOrCreateRoom); //HW API
router.post(
    "/room/update/:ruid",
    loginRequired,
    allowedRole("ADMIN"),
    room.update
);
router.delete(
    "/room/delete/:ruid",
    loginRequired,
    allowedRole("ADMIN"),
    roomIsExist,
    room.delete
);
router.post(
    "/room/pair",
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
    room.pairRoomToCard
);
router.post(
    "/room/check-in/:ruid",
    roomIsExist,
    cardIsExist,
    cardIsPair,
    room.roomCheckIn
);

module.exports = router;
