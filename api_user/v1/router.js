const express = require("express");
const router = express.Router();
const multer = require("multer");
const { body, query } = require("express-validator");
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/storage/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(
            null,
            `${file.fieldname}-${String(file.originalname)
                .split(".")[0]
                .replaceAll(" ", "-")}-${uniqueSuffix}.${extension}`
        );
    },
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2500000, // +- 2MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg|PNG|JPG|JPEG)$/)) {
            // upload only png and jpg format
            return cb(new Error("Please upload a Image"));
        }
        cb(undefined, true);
    },
});
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
router.get(
    "/search",
    loginRequired,
    allowedRole("ADMIN", "OPERATOR"),
    user.search
);
router.get("/list", loginRequired, allowedRole("ADMIN", "OPERATOR"), user.list);
router.post(
    "/register",
    body("username")
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("Username minimal 3 character")
        .not()
        .contains(" ")
        .withMessage("Username can't contain space"),
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
router.post(
    "/update",
    loginRequired,
    body("oldPassword").notEmpty(),
    body("newPassword")
        .isStrongPassword()
        .withMessage(
            "Password must have at least 8 characters, have a combination of numbers, uppercase, lowercase letters and unique characters"
        ),
    formChacker,
    user.update
);
router.post(
    "/profile/update",
    loginRequired,
    body("username").notEmpty().withMessage("Name required"),
    body("email").notEmpty().isEmail().withMessage("Email required"),
    body("full_name").notEmpty().withMessage("Full name required"),
    formChacker,
    user.profileUpdate
);
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
    allowedRole("ADMIN", "OPERATOR"),
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
router.post(
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
router.post(
    "/profile/picture/update",
    upload.single("avatar"),
    user.profileAvatarUpdate
);
module.exports = router;
