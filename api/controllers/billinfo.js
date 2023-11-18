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
    if (
        !req.body.billId ||
        !req.body.foodId ||
        !req.body.quantity ||
        !req.body.price
    ) {
        return res.status(404).json({
            message: "Cannot create billinfo",
            status: "Failed",
            error: "missing billId or foodId or quantity or price",
            billInfo: {},
        });
    }

    try {
        const existBillInfo = await BillInfo.findOne({
            bill: req.body.billId,
            food: req.body.foodId,
        }).exec();

        if (existBillInfo) {
            return res.status(409).json({
                message: "Cannot create billinfo",
                status: "Failed",
                error: "billinfo already exist",
                billInfo: {},
            });
        }

        // khong ton tai billinfo voi billId va foodId => tao moi billinfo

        const bill = await Bill.findById(req.body.billId).exec();

        if (!bill) {
            return res.status(404).json({
                message: "Cannot create billinfo",
                status: "Failed",
                error: "bill not found",
                billInfo: {},
            });
        }

        const food = await Food.findById(req.body.foodId).exec();

        if (!food) {
            return res.status(404).json({
                message: "Cannot create billinfo",
                status: "Failed",
                error: "food not found",
                billInfo: {},
            });
        }

        const billInfo = new BillInfo({
            _id: new mongoose.Types.ObjectId(),
            bill: req.body.billId,
            food: req.body.foodId,
            quantity: req.body.quantity,
            price: food.price,
        });

        const result = await billInfo.save();

        if (!result) {
            return res.status(500).json({
                message: "Cannot create billinfo",
                status: "Failed",
                error: "Something went wrong",
                billInfo: {},
            });
        } else {
            bill.tips += result.price * result.quantity;
            const resultSave = await bill.save();

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

exports.update_billInfo = async (req, res, next) => {
    console.log(req.body.quantity);
    console.log(req.params.billInfoId);
    if (!req.params.billInfoId || !req.body.quantity) {
        return res.status(404).json({
            message: "Cannot update billinfo",
            status: "Failed",
            error: "missing billInfoId or quantity",
            billInfo: {},
        });
    }

    try {
        const billinfo = await BillInfo.findOneAndUpdate(
            { _id: req.params.billInfoId },
            { quantity: req.body.quantity },
            { new: true }
        ).exec();

        if (!billinfo) {
            res.status(404).json({
                message: "Cannot update billinfo",
                status: "Failed",
                error: "billinfo not found",
                billInfo: {},
            });
        } else {
            res.status(200).json({
                message: "Update billinfo successfully",
                status: "Success",
                error: "",
                billInfo: {
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
