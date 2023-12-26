const mongoose = require("mongoose");
require("dotenv").config();

const BillInfo = require("../models/billinfo");
const Bill = require("../models/bill");
const Food = require("../models/food");

exports.get_all = async (req, res, next) => {
    try {
        const billInfo = await BillInfo.find()
            .select("bill food quantity price _id")
            .exec();
        const response = {
            message: "Get list billinfo successfully",
            status: "Success",
            error: "",
            count: billInfo.length,
            billInfos: billInfo.map((doc) => {
                return {
                    _id: doc._id,
                    bill: doc.bill,
                    food: doc.food,
                    quantity: doc.quantity,
                    price: doc.price,
                };
            }),
        };
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({
            message: "Get list billinfo failed",
            status: "Failed",
            error: error.message,
            count: 0,
            billInfos: [],
        });
    }
};

exports.get_billInfo = async (req, res, next) => {
    if (!req.params.billInfoId) {
        res.status(404).json({
            message: "billId not found",
            status: "Failed",
            error: "missing billId",
            billInfo: {},
        });
    }

    try {
        const billinfo = await BillInfo.findById(req.params.billInfoId).exec();

        if (!billinfo) {
            res.status(404).json({
                message: "billinfo not found",
                status: "Failed",
                error: "Cannot find billinfo",
                billInfo: {},
            });
        } else {
            res.status(200).json({
                message: "Get billinfo successfully",
                status: "Success",
                error: "",
                billinfo: {
                    _id: billinfo._id,
                    bill: billinfo.bill,
                    food: billinfo.food,
                    quantity: billinfo.quantity,
                    price: billinfo.price,
                },
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
            status: "Failed",
            error: err.message,
            billInfo: {},
        });
    }
};

exports.create_billInfo = async (req, res, next) => {
    console.log(req.body);

    const { bill, food, quantity } = req.body;

    if (!bill || !food || !quantity) {
        return res.status(404).json({
            message: "Cannot create billinfo",
            status: "Failed",
            error: "missing billId or foodId or quantity",
            billInfo: {},
        });
    }

    try {
        const existBillInfo = await BillInfo.findOne({
            bill: bill,
            food: food,
        }).exec();

        if (existBillInfo) {
            return res.status(409).json({
                message: "Cannot create billinfo",
                status: "Failed",
                error: "billinfo already exists",
                billInfo: {},
            });
        }

        const foundBill = await Bill.findById(bill).exec();

        if (!foundBill) {
            return res.status(404).json({
                message: "Cannot create billinfo",
                status: "Failed",
                error: "bill not found",
                billInfo: {},
            });
        }

        const foundFood = await Food.findById(food).exec();

        if (!foundFood) {
            return res.status(404).json({
                message: "Cannot create billinfo",
                status: "Failed",
                error: "food not found",
                billInfo: {},
            });
        }

        const billInfo = new BillInfo({
            _id: new mongoose.Types.ObjectId(),
            bill: bill,
            food: food,
            quantity: quantity,
            price: foundFood.price,
        });

        // Save the new billInfo
        const result = await billInfo.save();

        if (!result) {
            return res.status(500).json({
                message: "Cannot create billinfo",
                status: "Failed",
                error: "Something went wrong",
                billInfo: {},
            });
        }

        // Update the food quantity
        foundFood.soLuongTon -= quantity;

        // Save the updated food
        const updatedFood = await foundFood.save();

        if (!updatedFood) {
            // Handle error if failed to update food quantity
            return res.status(500).json({
                message: "Cannot create billinfo",
                status: "Failed",
                error: "Failed to update food quantity",
                billInfo: {},
            });
        }

        // Send the response if everything is successful
        res.status(201).json({
            message: "Create billinfo successfully",
            status: "Success",
            error: "",
            billInfo: {
                _id: result._id,
                bill: result.bill,
                food: result.food,
                quantity: result.quantity,
                price: result.price,
            },
        });
    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
            status: "Failed",
            error: err.message,
            billInfo: {},
        });
    }
};

exports.update_billInfo = async (req, res, next) => {
    const { quantity, food } = req.body;
    const billInfoId = req.params.billInfoId;

    if (!billInfoId || !quantity || !food) {
        return res.status(404).json({
            message: "Cannot update billinfo",
            status: "Failed",
            error: "missing billInfoId, quantity, or food",
            billInfo: {},
        });
    }

    try {
        const existingFood = await Food.findById(food).exec();

        if (!existingFood) {
            return res.status(404).json({
                message: "Cannot update billinfo",
                status: "Failed",
                error: "food not found",
                billInfo: {},
            });
        }

        if (quantity === 1) {
            // Kiểm tra nếu cần thêm món ăn và số lượng tồn kho là 0
            if (existingFood.soLuongTon === 0) {
                return res.status(404).json({
                    message: "Cannot update billinfo",
                    status: "Failed",
                    error: "không đủ món ăn",
                    billInfo: {},
                });
            }
        }

        existingFood.soLuongTon += -quantity;
        const updatedFood = await existingFood.save();

        if (!updatedFood) {
            return res.status(500).json({
                message: "Cannot update billinfo",
                status: "Failed",
                error: "Something went wrong while updating food quantity",
                billInfo: {},
            });
        }

        const updatedBillInfo = await BillInfo.findByIdAndUpdate(
            billInfoId,
            { $inc: { quantity: quantity } },
            { new: true }
        ).exec();

        if (!updatedBillInfo) {
            return res.status(404).json({
                message: "Cannot update billinfo",
                status: "Failed",
                error: "billinfo not found",
                billInfo: {},
            });
        }

        res.status(200).json({
            message: "Update billinfo successfully",
            status: "Success",
            error: "",
            billInfo: {
                _id: updatedBillInfo._id,
                bill: updatedBillInfo.bill,
                food: updatedBillInfo.food,
                quantity: updatedBillInfo.quantity,
                price: updatedBillInfo.price,
            },
        });
    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
            status: "Failed",
            error: err.message,
            billInfo: {},
        });
    }
};

exports.delete_billInfo = async (req, res, next) => {
    if (!req.params.billInfoId) {
        res.status(404).json({
            message: "Cannot delete billinfo",
            status: "Failed",
            error: "missing billInfoId",
            billInfo: {},
        });
    }

    try {
        const result = await BillInfo.findOneAndDelete({
            _id: req.params.billInfoId,
        }).exec();

        if (!result) {
            res.status(404).json({
                message: "Cannot delete billinfo",
                status: "Failed",
                error: "Cannot find billinfo",
                billInfo: {},
            });
        } else {
            res.status(200).json({
                message: "Delete billinfo successfully",
                status: "Success",
                error: "",
                billInfo: {
                    _id: result._id,
                    bill: result.bill,
                    food: result.food,
                    quantity: result.quantity,
                    price: result.price,
                },
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
            status: "Failed",
            error: err.message,
            billInfo: {},
        });
    }
};
