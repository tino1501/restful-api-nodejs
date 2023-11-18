const express = require("express");
const router = express.Router();

const FoodCategoryController = require("../controllers/categories");

router.get("/", FoodCategoryController.get_all);

router.get("/:_id", FoodCategoryController.get_category);

router.post("/", FoodCategoryController.create_category);

router.patch("/:_id", FoodCategoryController.update_category);

router.delete("/:_id", FoodCategoryController.delete_category);

module.exports = router;
