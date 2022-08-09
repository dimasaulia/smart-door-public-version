const router = require("express").Router();
const role = require("./controllers_role");
const {
    loginRequired,
    allowedRole,
} = require("../middlewares/authMiddlewares");
const {
    roleIDIsExist,
    roleNameIsNotExist,
} = require("../middlewares/roleMiddlewares");

// ROLE ROUTER
router.get("/list", loginRequired, allowedRole("ADMIN"), role.list);
router.get(
    "/detail/:roleId",
    loginRequired,
    allowedRole("ADMIN"),
    roleIDIsExist,
    role.detail
);
router.post(
    "/create",
    loginRequired,
    allowedRole("ADMIN"),
    roleNameIsNotExist,
    role.create
);
router.post(
    "/delete/:roleId",
    loginRequired,
    allowedRole("ADMIN"),
    roleIDIsExist,
    role.delete
);
router.post(
    "/update/:roleId",
    loginRequired,
    allowedRole("ADMIN"),
    roleIDIsExist,
    roleNameIsNotExist,
    role.update
);

module.exports = router;
