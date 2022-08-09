const router = require("express").Router();
const {
    loginRequired,
    allowedRole,
} = require("../../middlewares/authMiddlewares");
const { cardIsExist } = require("../../middlewares/cardMiddlewares");
const { body } = require("express-validator");
const { formChacker } = require("../../middlewares/formMiddleware");
const card = require("./controllers_card");

// CARD ROUTER
router.get(
    "/u/available",
    loginRequired,
    allowedRole("USER"),
    card.userCards // ! Will cause error in user ui
);
router.get(
    "/u/:cardNumber",
    loginRequired,
    allowedRole("USER"),
    cardIsExist,
    card.userCardsDetail // ! Will cause error in user ui
);
router.get(
    "/u/logs/:cardNumber",
    loginRequired,
    allowedRole("USER"),
    cardIsExist,
    card.userCardLogs // ! Will cause error in user ui
);
router.get("/available", loginRequired, allowedRole("ADMIN"), card.list);
router.get(
    "/unavailable",
    loginRequired,
    allowedRole("ADMIN"),
    card.registeredCards
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
    card.register
); // HW API
router.post("/validate", card.validateCard); // HW API

module.exports = router;
