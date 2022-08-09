const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const user = require("./controllers_user");
const { formChacker } = require("../../middlewares/formMiddleware");
const {
    loginRequired,
    allowedRole,
    defaultRoleIsExist,
    userIsNotExist,
    emailIsNotExist,
    notCurrentUser,
} = require("../../middlewares/authMiddlewares");
const {
    cardIsExist,
    cardNotPair,
} = require("../../middlewares/cardMiddlewares");
const {
    userIsExist,
    usernameIsExist,
} = require("../../middlewares/userMiddlewares");

// USER ROUTER
router.get("/logout", user.logout);
router.get("/detail/:id", loginRequired, allowedRole("ADMIN"), user.detail);
router.get("/search", loginRequired, allowedRole("ADMIN"), user.search);
router.get("/search/all", loginRequired, allowedRole("ADMIN"), user.userSearch);
router.get(
    "/search/all/showmore",
    loginRequired,
    allowedRole("ADMIN"),
    user.userSearchMore
);
router.post(
    "/register",
    body("username").notEmpty(),
    body("email").isEmail().trim(),
    body("password").isLength({ min: "8" }),
    formChacker,
    userIsNotExist,
    emailIsNotExist,
    user.register
);
router.post(
    "/login",
    body("username").notEmpty(),
    body("password").isLength({ min: "8" }),
    formChacker,
    defaultRoleIsExist,
    user.login
);
router.post("/update", loginRequired, allowedRole("ADMIN"), user.update);
router.delete(
    "/delete/:id",
    loginRequired,
    allowedRole("ADMIN"),
    userIsExist,
    notCurrentUser,
    user.delete
);
router.post(
    "/pair",
    loginRequired,
    allowedRole("ADMIN"),
    cardIsExist,
    usernameIsExist,
    cardNotPair,
    user.pairUserToCard
);
module.exports = router;
