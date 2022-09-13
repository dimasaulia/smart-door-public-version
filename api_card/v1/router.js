const router = require("express").Router();
const {
    loginRequired,
    allowedRole,
} = require("../../middlewares/authMiddlewares");
const {
    cardIsExist,
    isUserCard,
    isTurePin,
    isNewPinMatch,
} = require("../../middlewares/cardMiddlewares");
const { body, param } = require("express-validator");
const { formChacker } = require("../../middlewares/formMiddleware");
const card = require("./controllers_card");
const { apiValidation } = require("../../middlewares/apiKeyMiddlewares");

// CARD ROUTER
router.get("/u/available", loginRequired, allowedRole("USER"), card.userCards);
router.get(
    "/u/:cardNumber",
    loginRequired,
    allowedRole("USER"),
    cardIsExist,
    isUserCard,
    card.userCardsDetail
);
router.get(
    "/u/logs/:cardNumber",
    loginRequired,
    allowedRole("USER"),
    cardIsExist,
    isUserCard,
    card.userCardLogs
);
router.get(
    "/available",
    loginRequired,
    allowedRole("ADMIN"),
    card.listOfUnRegisterCard // ! Will cause error in user ui
);
router.get(
    "/unavailable",
    loginRequired,
    allowedRole("ADMIN"),
    card.listOfRegisterCard // ! Will cause error in user ui
);
router.get(
    "/detail/:cardNumber",
    loginRequired,
    allowedRole("ADMIN"),
    card.detail
);
router.post(
    "/register",
    body("cardNumber").notEmpty(),
    body("pin").notEmpty().isLength(6),
    formChacker,
    apiValidation,
    card.cardRegistration
); // HW API
router.post(
    "/update/:cardNumber",
    loginRequired,
    allowedRole("USER"),
    param("cardNumber").notEmpty(),
    body("cardName").notEmpty(),
    body("cardType").notEmpty(),
    body("isTwoStepAuth").notEmpty(),
    formChacker,
    cardIsExist,
    isUserCard,
    card.update
);
router.post(
    "/change-pin/:cardNumber",
    loginRequired,
    allowedRole("USER"),
    param("cardNumber").notEmpty(),
    body("newPin").notEmpty().isNumeric().isLength({ min: "6", max: "6" }),
    body("confirmNewPin")
        .notEmpty()
        .isNumeric()
        .isLength({ min: "6", max: "6" }),
    body("oldPin").notEmpty().isNumeric().isLength({ min: "6", max: "6" }),
    formChacker,
    cardIsExist,
    isUserCard,
    isNewPinMatch,
    isTurePin,
    card.changePin
);
router.post(
    "/change-auth-mode/:cardNumber",
    loginRequired,
    allowedRole("USER"),
    body("oldPin").notEmpty().isNumeric().isLength({ min: "6", max: "6" }),
    formChacker,
    cardIsExist,
    isUserCard,
    isTurePin,
    card.changeAuthType
);
module.exports = router;
