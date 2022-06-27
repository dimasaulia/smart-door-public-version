const express = require("express");
const router = express.Router();
const auth = require("./authControllers");

router.get("/login", auth.login);
router.get("/register", auth.register);
module.exports = router;
