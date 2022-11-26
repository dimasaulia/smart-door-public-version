const express = require("express");
const router = express.Router();
const auth = require("./authControllers");

router.get("/login", auth.login);
router.get("/register", auth.register);
router.get("/forget", auth.forget);
module.exports = router;
