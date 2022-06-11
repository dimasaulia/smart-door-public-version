const express = require("express");
const router = express.Router();
const role = require("./controllers_role");

// ROLE ROUTER
router.get("/list", role.list);
router.get("/detail/:id", role.detail);
router.post("/create", role.create);
router.post("/delete/:id", role.delete);
router.post("/update/:id", role.update);

module.exports = router;
