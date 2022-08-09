const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");

const user = require("./controllers_user");
const room = require("./controllers_room");
const { formChacker } = require("../middlewares/formMiddleware");
const {
    loginRequired,
    allowedRole,
    defaultRoleIsExist,
    userIsNotExist,
    emailIsNotExist,
    notCurrentUser,
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

// USER ROUTER
router.get("/user/logout", user.logout);
router.get(
    "/user/detail/:id",
    loginRequired,
    allowedRole("ADMIN"),
    user.detail
);
router.get("/user/search", loginRequired, allowedRole("ADMIN"), user.search);
router.get(
    "/user/search/all",
    loginRequired,
    allowedRole("ADMIN"),
    user.userSearch
);
router.get(
    "/user/search/all/showmore",
    loginRequired,
    allowedRole("ADMIN"),
    user.userSearchMore
);
router.post(
    "/user/register",
    body("username").notEmpty(),
    body("email").isEmail().trim(),
    body("password").isLength({ min: "8" }),
    formChacker,
    userIsNotExist,
    emailIsNotExist,
    user.register
);
router.post(
    "/user/login",
    body("username").notEmpty(),
    body("password").isLength({ min: "8" }),
    formChacker,
    defaultRoleIsExist,
    user.login
);
router.post("/user/update", loginRequired, allowedRole("ADMIN"), user.update);
router.delete(
    "/user/delete/:id",
    loginRequired,
    allowedRole("ADMIN"),
    userIsExist,
    notCurrentUser,
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
