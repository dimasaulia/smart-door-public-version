const express = require("express");
const router = express.Router();
const role = require("./controllers_role");
const user = require("./controllers_user");
const card = require("./controllers_card");
const room = require("./controllers_room");

// ROLE ROUTER
router.get("/role/list", role.list);
router.get("/role/detail/:id", role.detail);
router.post("/role/create", role.create);
router.post("/role/delete/:id", role.delete);
router.post("/role/update/:id", role.update);

// USER ROUTER
router.get("/user/list", user.list);
router.get("/user/detail/:id", user.detail);
router.post("/user/register", user.register);
router.post("/user/update", user.update);
router.post("/user/delete/:id", user.delete);
router.post("/user/pair", user.pairUserToCard);
router.get("/user/search", user.search);

// CARD ROUTER
router.get("/card/list", card.list);
router.get("/card/detail/:cardNumber", card.detail);
router.post("/card/register", card.register);
router.post("/card/validate", card.validateCard);

// ROOM ROUTER
router.get("/room/list", room.list);
router.get("/room/detail/:ruid", room.detail);
router.post("/room/get-or-create", room.getOrCreateRoom);
router.post("/room/update/:ruid", room.update);
router.post("/room/delete/:ruid", room.delete);

module.exports = router;
