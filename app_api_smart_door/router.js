const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
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
} = require("../middlewares/cardMiddlewares");
const { roomIsExist } = require("../middlewares/roomMiddlewares");

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
router.post(
    "/user/delete/:id",
    loginRequired,
    allowedRole("ADMIN"),
    user.delete
);
router.post(
    "/user/pair",
    loginRequired,
    allowedRole("ADMIN"),
    user.pairUserToCard
);

// CARD ROUTER
router.get(
    "/u/card/available",
    loginRequired,
    allowedRole("USER"),
    card.userCards
);
router.get("/card/available", loginRequired, allowedRole("ADMIN"), card.list);
router.get(
    "/card/detail/:cardNumber",
    loginRequired,
    allowedRole("ADMIN"),
    card.detail
);
router.post("/card/register", card.register); // HW API
router.post("/card/validate", card.validateCard); // HW API

// ROOM ROUTER
router.get("/room/list", loginRequired, allowedRole("ADMIN"), room.list);
router.get(
    "/room/detail/:ruid",
    loginRequired,
    allowedRole("ADMIN"),
    room.detail
);
router.post(
    "/u/room/request",
    body("cardNumber").notEmpty(),
    body("ruid").notEmpty(),
    formChacker,
    loginRequired,
    allowedRole("USER"),
    cardIsExist,
    isUserCard,
    roomIsExist,
    room.roomRequest
);
router.post(
    "/room/get-or-create",
    loginRequired,
    allowedRole("ADMIN"),
    room.getOrCreateRoom
); //HW API
router.post(
    "/room/update/:ruid",
    loginRequired,
    allowedRole("ADMIN"),
    room.update
);
router.post(
    "/room/delete/:ruid",
    loginRequired,
    allowedRole("ADMIN"),
    room.delete
);
router.post(
    "/room/pair",
    loginRequired,
    allowedRole("ADMIN"),
    body("roomId").notEmpty(),
    body("cardNumber").notEmpty(),
    cardIsExist,
    cardIsPair,
    formChacker,
    room.pairRoomToCard
);
router.post("/room/check-in/:ruid", roomIsExist, cardIsExist, room.roomCheckIn);

module.exports = router;
