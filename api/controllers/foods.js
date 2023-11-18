const mongoose = require("mongoose");
require("dotenv").config();

const Food = require("../models/food");
const FoodCategory = require("../models/category");
const checkValidObjectId = require("../middlewares/check-valid-objectid");
const normalizeString = require("../middlewares/normalize-string");

exports.get_all = (req, res, next) => {
    Food.find()
        .select(
            "_id name price discount description soLuongTon imgUrl category status"
        )
        .populate("category", "_id name foodnumber")
        .exec()
        .then((foods) => {
            const response = {
                message: "Lấy danh sách food thành công",
                status: "Success",
                error: "",
                count: foods.length,
                foods: foods.map((food) => {
                    return {
                        _id: food._id,
                        name: food.name,
                        price: food.price,
                        discount: food.discount,
                        description: food.description,
                        soLuongTon: food.soLuongTon,
                        imgUrl: food.imgUrl,
                        status: food.status,
                        category: food.category,
                    };
                }),
            };
            res.status(200).json(response);
        })
        .catch((err) => {
            res.status(500).json({
                message: "Có lỗi khi lấy danh sách food",
                status: "Failed",
                error: err.message,
                count: 0,
                foods: [],
            });
        });
};

exports.get_food = (req, res, next) => {
    Food.findById(req.params._id)
        .select(
            "_id name price discount description soLuongTon imgUrl category status"
        )
        .populate("category", "_id name foodnumber")
        .exec()
        .then((food) => {
            if (!food) {
                return res.status(404).json({
                    message: "Khong tim thay mon an",
                    status: "Failed",
                    error: "Food not found",
                    food: {},
                });
            } else {
                res.status(200).json({
                    message: "Lay mon an thanh cong",
                    status: "Success",
                    error: "",
                    food: food,
                });
            }
        })
        .catch((err) => {
            // console.log(err);
            res.status(500).json({
                message: "Có lỗi khi lấy food info",
                status: "Failed",
                error: err.message,
                food: {},
            });
        });
};

exports.create_food = async (req, res, next) => {
    console.log(req.body);
    console.log(req.file);

    if (!req.body.name) {
        return res.status(400).json({
            message: "Không thể thêm món",
            status: "Failed",
            error: "Chưa nhập tên món ăn",
            food: {},
        });
    }

    if (!req.body.price) {
        return res.status(400).json({
            message: "Không thể thêm món",
            status: "Failed",
            error: "Chưa nhập giá món ăn",
            food: {},
        });
    }

    if (!req.body.soLuongTon) {
        return res.status(400).json({
            message: "Không thể thêm món",
            status: "Failed",
            error: "Chưa nhập số lượng tồn món ăn",
            food: {},
        });
    }

    if (!req.body.category) {
        return res.status(400).json({
            message: "Không thể thêm món",
            status: "Failed",
            error: "Chưa chọn danh mục món ăn",
            food: {},
        });
    }

    let categoryID = normalizeString.normalizeString(req.body.category);
    let name = normalizeString.normalizeString(req.body.name);
    let price = normalizeString.normalizeInt(req.body.price);
    let description = normalizeString.normalizeString(req.body.description);
    let soLuongTon = normalizeString.normalizeInt(req.body.soLuongTon);

    // let categoryID = req.body.category;
    // let name = req.body.name;
    // let price = req.body.price;
    // let description = req.body.description;
    // let soLuongTon = req.body.soLuongTon;

    try {
        if (checkValidObjectId.isValidObjectId(categoryID) === false) {
            res.status(400).json({
                message: "Không thể thêm món",
                status: "Failed",
                error: "Loại món ăn không hợp lệ" + categoryID,
                food: {},
            });
            return;
        }

        const food = await Food.findOne({ name: req.body.name }).exec();

        if (food) {
            return res.status(409).json({
                message: "Không thể thêm món",
                status: "Failed",
                error: "Món ăn đã tồn tại",
                food: {},
            });
        } else {
            const category = await FoodCategory.findById(categoryID).exec();

            if (!category) {
                return res.status(404).json({
                    message: "Không thể thêm món",
                    status: "Failed",
                    error: "Không tìm thấy danh mục món",
                    food: {},
                });
            }

            const newFood = new Food({
                _id: new mongoose.Types.ObjectId(),
                name: name,
                price: price,
                discount: 0,
                description: description,
                soLuongTon: soLuongTon,
                imgUrl: req.file ? req.file.path : "",
                category: category,
            });

            const result = await newFood.save();

            if (!result) {
                // throw new Error("Thêm món ăn thất bại");
                return res.status(500).json({
                    message: "Thêm món ăn thất bại",
                    status: "Failed",
                    error: "Thêm món ăn thất bại",
                    food: {},
                });
            } else {
                category.foodnumber += 1;
                const saveCategoryResult = await category.save();

                if (!saveCategoryResult) {
                    return res.status(500).json({
                        message: "Thêm món ăn thất bại",
                        status: "Failed",
                        error: "Thêm món ăn thất bại",
                        food: {},
                    });
                } else {
                    res.status(201).json({
                        message: "Thêm món ăn thành công",
                        status: "Success",
                        error: "",
                        food: {
                            _id: result._id,
                            name: result.name,
                            price: result.price,
                            discount: result.discount,
                            description: result.description,
                            soLuongTon: result.soLuongTon,
                            imgUrl: result.imgUrl,
                            category: {
                                _id: category._id,
                                name: category.name,
                                foodnumber: category.foodnumber,
                            },
                        },
                    });
                }
            }
        }
    } catch (err) {
        console.log(err);
        // Tùy chỉnh xử lý lỗi ở đây, ví dụ: trả về phản hồi lỗi
        res.status(500).json({
            message: "Lỗi trong quá trình xử lý yêu cầu",
            status: "Failed",
            error: err.message,
            food: {},
        });
    }
};

// exports.foods_create_food = (req, res, next) => {
//     Food.findOne({ name: req.body.name })
//         .then((result) => {
//             if (result) {
//                 res.status(409).json({
//                     message: "Không thể thêm món",
//                     desc: "Món ăn đã tồn tại",
//                     status: "Failed",
//                 });
//             } else {
//                 const newFood = new Food({
//                     _id: new mongoose.Types.ObjectId(),
//                     name: req.body.name,
//                     price: req.body.price,
//                     discount: req.body.discount,
//                     description: req.body.description,
//                     soLuongTon: req.body.soLuongTon,
//                     imgUrl: req.body.imgUrl,
//                     status: req.body.status,
//                     category: req.body.categoryID,
//                 });
//                 return newFood.save();
//             }
//         })
//         .then((food) => {
//             if (!food) {
//                 return Promise.reject({
//                     message: "Thêm món ăn thất bại",
//                     status: "Failed",
//                 });
//             }
//             res.status(201).json({
//                 message: "Thêm món ăn thành công",
//                 status: "Success",
//                 createdFood: {
//                     _id: food._id,
//                     name: food.name,
//                     price: food.price,
//                     discount: food.discount,
//                     description: food.description,
//                     soLuongTon: food.soLuongTon,
//                     imgUrl: food.imgUrl,
//                     status: food.status,
//                     category: food.category,
//                 },
//             });
//         })
//         .catch((err) => {
//             // res.status(500).json(err);
//             console.log(err);
//         });
// };

exports.update_food = async (req, res, next) => {
    const updateOps = {};

    if (!req.params._id) {
        return res.status(400).json({
            message: "Update failed",
            status: "Failed",
            error: `Phai co _id`,
            food: {},
        });
    }

    for (const ops in req.body) {
        if (
            ops !== "name" &&
            ops !== "price" &&
            ops !== "discount" &&
            ops !== "description" &&
            ops !== "soLuongTon" &&
            ops !== "status" &&
            ops !== "category"
        ) {
            console.log(ops);
            return res.status(400).json({
                message: "Update failed",
                status: "Failed",
                error: `Invalid field ${ops}`,
                food: {},
            });
        }
        updateOps[ops] = req.body[ops];
        // console.log(ops);
    }

    // change img if get new img
    if (req.file) {
        updateOps.imgUrl = process.env.IP_ADRESS + req.file.path;
    }

    const id = req.params._id;
    let newCategoryID = normalizeString.normalizeString(req.body.category);
    let newName = req.body.name;
    let newPrice = normalizeString.normalizeInt(req.body.price);
    let newDescription = req.body.description;
    let newSoLuongTon = normalizeString.normalizeInt(req.body.soLuongTon);
    let newDiscount = normalizeString.normalizeFloat(req.body.discount);
    let status = normalizeString.normalizeInt(req.body.status);

    //
    if (req.body.discount) {
        if (newDiscount < 0 || newDiscount > 100) {
            return res.status(400).json({
                message: "Cap nhat food info that bai",
                status: "Failed",
                error: `Giảm giá không hợp lệ`,
                food: {},
            });
        }
    }

    try {
        const oldFood = await Food.findById(id).exec();

        if (!oldFood) {
            return res.status(404).json({
                message: "Khong tim thay mon an",
                status: "Failed",
                error: "Khong tim thay mon an",
                food: {},
            });
        }

        if (oldFood) {
            const result = await Food.findOneAndUpdate(
                { _id: id },
                {
                    name: newName,
                    price: newPrice,
                    discount: newDiscount,
                    description: newDescription,
                    soLuongTon: newSoLuongTon,
                    imgUrl: req.file
                        ? process.env.IP_ADRESS + req.file.path
                        : oldFood.imgUrl,
                    status: status,
                    category: newCategoryID,
                },
                { new: true }
            )
                .populate("category", "_id name foodnumber")
                .exec();

            if (!result) {
                return res.status(404).json({
                    message: "Khong tim thay mon an",
                    status: "Failed",
                    error: "Food not found",
                    food: {},
                });
            } else {
                if (req.body.category) {
                    if (newCategoryID == oldFood.category._id) {
                        return res.status(200).json({
                            message: "Cap nhat food info thanh cong",
                            status: "Success",
                            error: "",
                            food: {
                                _id: result._id,
                                name: result.name,
                                price: result.price,
                                discount: result.discount,
                                description: result.description,
                                soLuongTon: result.soLuongTon,
                                imgUrl: result.imgUrl,
                                status: result.status,
                                category: {
                                    _id: result.category._id,
                                    name: result.category.name,
                                    foodnumber: result.category.foodnumber,
                                },
                            },
                        });
                    } else {
                        const oldCategory = await FoodCategory.findById(
                            oldFood.category._id
                        ).exec();
                        const newCategory = await FoodCategory.findById(
                            newCategoryID
                        ).exec();

                        oldCategory.foodnumber -= 1;
                        newCategory.foodnumber += 1;

                        await oldCategory.save();
                        await newCategory.save();
                    }
                }

                return res.status(200).json({
                    message: "Cap nhat food info thanh cong",
                    status: "Success",
                    error: "",
                    food: {
                        _id: result._id,
                        name: result.name,
                        price: result.price,
                        discount: result.discount,
                        description: result.description,
                        soLuongTon: result.soLuongTon,
                        imgUrl: result.imgUrl,
                        status: result.status,
                        category: {
                            _id: result.category._id,
                            name: result.category.name,
                            foodnumber: result.category.foodnumber,
                        },
                    },
                });
            }
        }
    } catch (err) {
        res.status(500).json({
            message: "Có lỗi khi cập nhật food info",
            status: "Failed",
            error: err.message,
            food: {},
        });
    }
};

exports.delete_food = async (req, res, next) => {
    if (!req.params._id) {
        return res.status(400).json({
            message: "Cannot delete food",
            status: "Failed",
            error: "Missing _id",
            food: {},
        });
    }
    try {
        const result = await Food.findOneAndDelete({
            _id: req.params._id,
        }).exec();

        if (!result) {
            return res.status(404).json({
                message: "Không tìm thấy món ăn",
                status: "Failed",
                error: "Không thể xóa món ăn",
                food: {},
            });
        }

        const category = await FoodCategory.findById(result.category).exec();
        category.foodnumber -= 1;

        const saveCategoryResult = await category.save();

        if (!saveCategoryResult) {
            return res.status(500).json({
                message: "Máy chủ gặp lỗi khi xóa món ăn",
                status: "Failed",
                error: err.message,
                food: {},
            });
        } else {
            return res.status(200).json({
                message: "Đã xóa món ăn thành công",
                status: "Success",
                error: "",
                food: {
                    _id: result._id,
                    name: result.name,
                    price: result.price,
                    discount: result.discount,
                    description: result.description,
                    soLuongTon: result.soLuongTon,
                    imgUrl: result.imgUrl,
                    status: result.status,
                    category: {
                        _id: result.category,
                        name: result.category.name,
                        foodnumber: result.category.foodnumber,
                    },
                },
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Máy chủ gặp lỗi khi xóa món ăn",
            status: "Failed",
            error: err.message,
            food: {},
        });
    }
};

exports.delete_all = (req, res, next) => {
    Product.deleteMany({})
        .then((result) => {
            res.status(200).json({
                message: `deleted all ${result.deletedCount} foods`,
                status: "Success",
                error: "",
                foods: result,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Có lỗi khi xóa food",
                status: "Failed",
                error: err.message,
                foods: [],
            });
        });
};
