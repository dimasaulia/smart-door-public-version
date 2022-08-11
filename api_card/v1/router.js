const router = require("express").Router();
const {
    loginRequired,
    allowedRole,
} = require("../../middlewares/authMiddlewares");
const {
    cardIsExist,
    isUserCard,
} = require("../../middlewares/cardMiddlewares");
const { body } = require("express-validator");
const { formChacker } = require("../../middlewares/formMiddleware");
const card = require("./controllers_card");

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
    card.cardRegistration
); // HW API

module.exports = router;
