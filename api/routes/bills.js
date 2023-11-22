const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/check-authorization");

const BillController = require("../controllers/bills");

router.get("/date/", BillController.get_billamount_by_month);

// router.get("/getprice_of_month/", BillController.get_total_price_by_day);

router.get("/", BillController.get_all);

router.get("/:billId/billinfo", BillController.get_billinfo);

router.get("/:billId", BillController.get_bill);

router.post("/", BillController.create_bill);

router.patch("/:billId", BillController.update_bill);

router.delete("/:billId", checkAuth, BillController.delete_bill);

module.exports = router;
