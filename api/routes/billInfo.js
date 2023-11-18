const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/check-authorization");

const BillInfoController = require("../controllers/billinfo");

router.get("/", BillInfoController.get_all);

router.get("/:billInfoId", BillInfoController.get_billInfo);

router.post("/", BillInfoController.create_billInfo);

router.patch("/:billInfoId", BillInfoController.update_billInfo);

router.delete("/:billInfoId", checkAuth, BillInfoController.delete_billInfo);

module.exports = router;
