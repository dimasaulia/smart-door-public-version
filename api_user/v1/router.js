const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");

const user = require("./controllers_user");
const { formChacker } = require("../../middlewares/formMiddleware");
const {
    loginRequired,
    allowedRole,
    defaultRoleIsExist,
    userIsNotExist,
    emailIsNotExist,
    notCurrentUser,
    adminRoleIsExist,
    urlTokenIsValid,
    urlTokenIsNotActive,
    userNotVerify,
    logoutRequired,
    emailIsExist,
    urlTokenIsMatch,
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
router.get("/list", loginRequired, allowedRole("ADMIN"), user.list);
router.post(
    "/register",
    body("username").notEmpty(),
    body("email").isEmail().withMessage("Please enter valid email").trim(),
    body("password")
        .isStrongPassword()
        .withMessage(
            "Password must have at least 8 characters, have a combination of numbers, uppercase, lowercase letters and unique characters"
        ),
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
router.post(
    "/set-admin/:id",
    loginRequired,
    allowedRole("ADMIN"),
    userIsExist,
    adminRoleIsExist,
    notCurrentUser,
    user.setAdminRole
);

router.post(
    "/set-user/:id",
    loginRequired,
    allowedRole("ADMIN"),
    userIsExist,
    defaultRoleIsExist,
    notCurrentUser,
    user.setUserRole
);
router.get(
    "/email-send-verification/",
    loginRequired,
    userNotVerify,
    urlTokenIsNotActive,
    user.emailVerification
);
router.get(
    "/email-verifying/",
    loginRequired,
    query("token").notEmpty(),
    formChacker,
    userNotVerify,
    urlTokenIsValid,
    urlTokenIsMatch,
    user.verifyingEmail
);
router.post(
    "/send-reset-password/",
    logoutRequired,
    body("email").notEmpty().isEmail(),
    formChacker,
    emailIsExist,
    urlTokenIsNotActive,
    user.sendResetPassword
);
router.post(
    "/reset-password/",
    logoutRequired,
    query("token").notEmpty().withMessage("Can't find token from your url"),
    body("password")
        .isStrongPassword()
        .withMessage(
            "Password must have at least 8 characters, have a combination of numbers, uppercase, lowercase letters and unique characters"
        ),
    formChacker,
    urlTokenIsValid,
    urlTokenIsMatch,
    user.resetPassword
);
module.exports = router;
