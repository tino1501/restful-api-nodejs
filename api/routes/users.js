const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/check-authorization");

const UserController = require("../controllers/users");

router.get("/", UserController.get_all);

router.get("/:username", UserController.get_user);

router.post("/signup", UserController.user_signup);

router.post("/login", UserController.user_signin);

router.delete("/:userId", checkAuth, UserController.user_delete);

module.exports = router;
