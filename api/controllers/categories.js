const mongoose = require("mongoose");
require("dotenv").config();

const FoodCategory = require("../models/category");
const Food = require("../models/food");
const normalizeString = require("../middlewares/normalize-string");

exports.get_all = (req, res, next) => {
    FoodCategory.find()
        .select("_id name foodnumber")
        .exec()
        .then((categories) => {
            const response = {
                message: "Lấy danh sách foodcategory thành công",
                status: "Success",
                error: "",
                count: categories.length,
                categories: categories.map((category) => {
                    return {
                        _id: category._id,
                        name: category.name,
                        foodnumber: category.foodnumber,
                    };
                }),
            };
            res.status(200).json(response);
        })
        .catch((err) => {
            res.status(500).json({
                message: "Có lỗi khi lấy danh sách danh mục sản phẩm",
                status: "Failed",
                error: err.message,
                count: 0,
                categories: [],
            });
        });
};

exports.create_category = async (req, res, next) => {
    console.log(req.body)
    if (!req.body.name) {
        return res.status(400).json({
            message: "Có lỗi khi tạo mới danh mục",
            status: "Failed",
            error: "Missing name",
            category: {},
        });
    }
    
    let newName = normalizeString.normalizeString(req.body.name);

    try {
        const category = await FoodCategory.findOne({
            name: newName,
        }).exec();

        if (category) {
            return res.status(409).json({
                message: "Có lỗi khi tạo mới danh mục",
                status: "Failed",
                error: "Danh mục đã tồn tại",
                category: {},
            });
        }
        const newFoodCategory = new FoodCategory({
            _id: new mongoose.Types.ObjectId(),
            name: newName,
        });

        const result = await newFoodCategory.save();

        if (result) {
            res.status(201).json({
                message: "Tạo mới danh mục thành công",
                status: "Success",
                error: "",
                category: {
                    _id: result._id,
                    name: result.name,
                    foodnumber: result.foodnumber,
                },
            });
        } else {
            res.status(500).json({
                message: "Có lỗi khi tạo mới danh mục",
                status: "Failed",
                error: "Có lỗi khi tạo mới danh mục",
                category: {},
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Có lỗi khi tạo mới danh mục",
            status: "Failed",
            error: err.message,
            category: {},
        });
    }
};

exports.get_category = (req, res, next) => {
    FoodCategory.findById(req.params._id)
        .exec()
        .then((foodcategory) => {
            if (!foodcategory) {
                res.status(404).json({
                    message: "Không tìm thấy danh mục",
                    status: "Failed",
                    error: "Không tìm thấy danh mục",
                    category: {},
                });
            } else {
                res.status(200).json({
                    message: "Lấy danh mục thành công",
                    status: "Success",
                    error: "",
                    category: {
                        _id: foodcategory._id,
                        name: foodcategory.name,
                        foodnumber: foodcategory.foodnumber,
                    },
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: "Có lỗi khi lấy danh mục",
                status: "Failed",
                error: err.message,
                category: {},
            });
        });
};

exports.update_category = async (req, res, next) => {
    if (!req.body._id) {
        return res.status(400).json({
            message: "Có lỗi khi cập nhật danh mục",
            status: "Failed",
            error: "Id không xác định",
            category: {},
        });
    }

    const result = await FoodCategory.findById(req.body._id).exec();

    if (!result) {
        return res.status(404).json({
            message: "Có lỗi khi cập nhật danh mục",
            status: "Failed",
            error: "Không tìm thấy FoodCategory",
            category: {},
        });
    } else {
        result.name = req.body.name ? req.body.name : result.name;

        const updatedCategory = await result.save();
        if (updatedCategory) {
            return res.status(200).json({
                message: "Cập nhật danh mục thành công",
                status: "Success",
                error: "",
                category: {
                    _id: updatedCategory._id,
                    name: updatedCategory.name,
                    foodnumber: updatedCategory.foodnumber,
                },
            });
        }
    }
};

exports.delete_category = async (req, res, next) => {
    if (!req.params._id) {
        return res.status(400).json({
            message: "Có lỗi khi xoá danh mục",
            status: "Failed",
            error: "Id category không xác định",
            category: {},
        });
    }

    try {
        const result = await FoodCategory.findById(req.params._id).exec();

        if (!result) {
            return res.status(404).json({
                message: "Có lỗi khi xoá danh mục",
                status: "Failed",
                error: "Không tìm thấy danh mục",
                category: {},
            });
        } else {
            // da tim thay danh muc

            // xoa danh sach food thuoc danh muc
            const deleteFoodListResult = await Food.deleteMany({
                category: req.params._id,
            }).exec();

            if (deleteFoodListResult) {
                const deleteCategoryResult =
                    await FoodCategory.findOneAndDelete({
                        _id: req.params._id,
                    }).exec();

                if (deleteCategoryResult) {
                    return res.status(200).json({
                        message: "Xoá danh mục thành công",
                        status: "Success",
                        error: "",
                        category: {
                            _id: deleteCategoryResult._id,
                            name: deleteCategoryResult.name,
                            foodnumber: deleteCategoryResult.foodnumber,
                        },
                    });
                }
                else {
                    return res.status(500).json({
                        message: "Có lỗi khi xoá danh mục",
                        status: "Failed",
                        error: "Có lỗi khi xoá danh mục",
                        category: {},
                    });
                }
            } else {
                return res.status(500).json({
                    message: "Có lỗi khi xoá danh mục",
                    status: "Failed",
                    error: "Có lỗi khi xoá danh mục",
                    category: {},
                });
            }
        }
    } catch (err) {
        return res.status(500).json({
            message: "Có lỗi khi xoá danh mục",
            status: "Failed",
            error: err.message,
            category: {},
        });
    }
};
