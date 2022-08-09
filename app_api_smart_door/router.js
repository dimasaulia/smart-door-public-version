const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");

const user = require("./controllers_user");
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
module.exports = router;
