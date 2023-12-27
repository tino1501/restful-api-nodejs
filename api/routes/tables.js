const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/check-authorization");

const TableController = require("../controllers/tables");

router.get("/", TableController.get_all);

router.get("/:_id", TableController.get_table);

router.post("/", TableController.create_table);

router.patch("/:_id", TableController.update_table);

router.put("/chuyenban", TableController.chuyenban);

router.delete("/:_id", checkAuth, TableController.delete_table);

module.exports = router;
