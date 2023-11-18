const mongoose = require("mongoose");
require("dotenv").config();
const moment = require("moment");

const Bill = require("../models/bill");
const Table = require("../models/table");
const BillInfo = require("../models/billinfo");
const MapLabel = require("../middlewares/map-label");

const { parse } = require("url");
const { parse: parseQueryString } = require("querystring");

exports.get_all = async (req, res, next) => {
    try {
        const bills = await Bill.find()
            .select(
                "_id timeCheckIn timeCheckout note tips status table seller"
            )
            .populate("seller", "_id username first_name last_name")
            .populate("table", "_id tablename status note")
            .exec();
        // res.status(200).json(bills);

        if (!bills) {
            res.status(500).json({
                message: "Get list bill failed",
                status: "Failed",
                error: "Cannot get list bill",
                count: 0,
                bills: [],
            });
        } else {
            const response = {
                message: "Get list bill successfully",
                status: "Success",
                error: "",
                count: bills.length,
                bills: bills.map((bill) => {
                    return {
                        _id: bill._id,
                        timeCheckIn: bill.timeCheckIn,
                        timeCheckout: bill.timeCheckout,
                        note: bill.note,
                        tips: bill.tips,
                        status: bill.status,
                        table: bill.table,
                        seller: bill.seller,
                    };
                }),
            };

            res.status(200).json(response);
        }
    } catch (err) {
        res.status(500).json({
            message: "Get list bill failed",
            status: "Failed",
            error: err.message,
            count: 0,
            bills: [],
        });
    }
};

exports.get_bill = async (req, res, next) => {
    console.log("get bill by id");
    try {
        const bill = await Bill.findById(req.params.billId)
            .select(
                "_id timeCheckIn timeCheckout note tips status table seller"
            )
            .populate("seller", "_id username first_name last_name")
            .populate("table", "_id tablename status note")
            .exec();

        if (!bill) {
            res.status(404).json({
                message: "Bill not found",
                status: "Failed",
                error: "Cannot find bill",
                bill: {},
            });
        } else {
            res.status(200).json({
                message: "Get bill successfully",
                status: "Success",
                error: "",
                bill: {
                    _id: bill._id,
                    timeCheckIn: bill.timeCheckIn,
                    timeCheckout: bill.timeCheckout,
                    note: bill.note,
                    tips: bill.tips,
                    status: bill.status,
                    table: bill.table,
                    seller: bill.seller,
                },
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Get bill failed",
            status: "Failed",
            error: err.message,
            bill: {},
        });
    }
};

exports.get_billinfo = async (req, res, next) => {
    console.log("get billinfo list");
    if (!req.params.billId) {
        return res.status(400).json({
            message: "Cannot get billinfo",
            status: "Failed",
            error: "Missing billId",
            billInfos: {},
        });
    }

    try {
        const listBillInfo = await BillInfo.find({
            bill: req.params.billId,
        }).exec();

        if (!listBillInfo) {
            return res.status(404).json({
                message: "Cannot get billinfo",
                status: "Failed",
                error: "Cannot find billinfo",
                billInfos: {},
            });
        } else {
            const response = {
                message: "Get list billinfo successfully",
                status: "Success",
                error: "",
                count: listBillInfo.length,
                billInfos: listBillInfo.map((doc) => {
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
        }
    } catch (err) {
        res.status(500).json({
            message: "Get billinfo failed",
            status: "Failed",
            error: err.message,
            billInfos: {},
        });
    }
};

exports.get_bills_by_day = async (req, res, next) => {
    console.log("get bill by day");
    console.log(req.query);

    if (!req.query.month || !req.query.year) {
        return res.status(400).json({
            message: "Cannot get bill",
            status: "Failed",
            error: "Missing day or month or year",
            count: 0,
            bills: [],
        });
    }

    try {
        const bills = await Bill.find()
            .select(
                "_id timeCheckIn timeCheckout note tips status table seller"
            )
            .populate("seller", "_id username first_name last_name")
            .populate("table", "_id tablename status note")
            .exec();
        // res.status(200).json(bills);

        if (!bills) {
            res.status(500).json({
                message: "Get list bill failed",
                status: "Failed",
                error: "Cannot get list bill",
                count: 0,
                bills: [],
            });
        } else {
            let size = 0;
            const response = {
                message: "Get list bill successfully",
                status: "Success",
                error: "",

                bills: bills
                    .map((bill) => {
                        const checkInDate = new Date(Number(bill.timeCheckIn));

                        if (
                            checkInDate.getMonth() + 1 != req.query.month || // month bat dau tu 0
                            checkInDate.getFullYear() != req.query.year
                        ) {
                            return null;
                        } else {
                            size++;
                            return {
                                _id: bill._id,
                                timeCheckIn: bill.timeCheckIn,
                                timeCheckout: bill.timeCheckout,
                                note: bill.note,
                                tips: bill.tips,
                                status: bill.status,
                                table: bill.table,
                                seller: bill.seller,
                            };
                        }
                    })
                    .filter((bill) => bill !== null),
                count: size,
            };

            res.status(200).json(response);
        }
    } catch (err) {
        return res.status(500).json({
            message: "Get bills failed",
            status: "Failed",
            error: err.message,
            count: 0,
            bills: [],
        });
    }
};

exports.create_bill = async (req, res, next) => {
    if (!req.body.timeCheckIn || !req.body.table || !req.body.seller) {
        return res.status(500).json({
            message: "Missing timeCheckIn or table or seller",
            status: "Failed",
            error: "Missing timeCheckIn or table or seller",
            bill: {},
        });
    }

    try {
        let table = await Table.findById(req.body.table);

        // kiem tra table co ton tai hay khong
        if (!table) {
            return res.status(404).json({
                message: "Cannot create bill",
                status: "Failed",
                error: "Table not found",
                bill: {},
            });
        } else if (table.status === 1) {
            // kiem tra table co dang duoc su dung hay khong
            return res.status(404).json({
                message: "Cannot create bill",
                status: "Failed",
                error: "Table is using",
                bill: {},
            });
        }

        // table san sang de su dung

        table = await Table.findOneAndUpdate(
            // cap nhat trang thai table
            { _id: req.body.table },
            { $set: { status: 1 } },
            { new: true }
        ).exec();

        const bill = new Bill({
            _id: new mongoose.Types.ObjectId(),
            timeCheckIn: req.body.timeCheckIn,
            note: req.body.note,
            tips: req.body.tips,
            table: req.body.table,
            seller: req.body.seller,
        });

        const result = await bill.save(); // luu bill vao database

        if (!result) {
            res.status(500).json({
                message: "Create bill failed",
                status: "Failed",
                error: "Cannot create bill",
                bill: {},
            });
        } else {
            res.status(201).json({
                message: "Create bill successfully",
                status: "Success",
                error: "",
                bill: {
                    _id: result._id,
                    timeCheckIn: result.timeCheckIn,
                    timeCheckout: result.timeCheckout,
                    note: result.note,
                    tips: result.tips,
                    status: result.status,
                    table: {
                        _id: result.table._id,
                        tablename: result.table.tablename,
                        status: result.table.status,
                        note: result.table.note,
                    },
                    seller: {
                        _id: result.seller._id,
                        username: result.seller.username,
                        first_name: result.seller.first_name,
                        last_name: result.seller.last_name,
                    },
                },
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Create bill failed",
            status: "Failed",
            error: err.message,
            bill: {},
        });
    }
};

exports.update_bill = async (req, res, next) => {
    const id = req.params.billId;
    const updateOps = {};

    for (const ops in req.body) {
        if (
            ops !== "timeCheckout" &&
            ops !== "note" &&
            ops !== "tips" &&
            ops !== "table"
        ) {
            return res.status(400).json({
                message: "Update failed",
                status: "Failed",
                error: `Can not use ${ops} to update bill`,
                bill: {},
            });
        } else {
            updateOps[ops] = req.body[ops];
        }
        // console.log(ops);
    }

    try {
        const result = await Bill.findOneAndUpdate(
            { _id: id },
            { $set: updateOps },
            { new: true }
        ).exec();

        if (!result) {
            res.status(404).json({
                message: "Bill not found",
                status: "Failed",
                error: "Cannot find bill",
                bill: {},
            });
        } else {
            res.status(200).json({
                message: "Update bill successfully",
                status: "Success",
                error: "",
                bill: result,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Update bill failed",
            status: "Failed",
            error: err.message,
            bill: {},
        });
    }
};

exports.delete_bill = async (req, res, next) => {
    if (!req.params.billId) {
        return res.status(400).json({
            message: "Cannot delete bill",
            status: "Failed",
            error: "Missing billId",
            bill: {},
        });
    }

    try {
        const result = await Bill.findOneAndDelete({
            _id: req.params.billId,
        }).exec();

        if (!result) {
            return res.status(404).json({
                message: "Cannot delete bill",
                status: "Failed",
                error: "Cannot find bill",
                bill: {},
            });
        } else {
            //?? có nên reset trạng thái bàn sau khi xóa bill không
            //
            //
            // // cap nhat trang thai table
            // const table = await Table.findOneAndUpdate(
            //     { _id: result.table },
            //     { $set: { status: 0 } }
            // ).exec();

            // if(!table) {
            //     return res.status(404).json({
            //         message: "Cannot reset state table after delete",
            //         desc: "Cannot find table",
            //         status: "Failed",
            //     });
            // }

            res.status(200).json({
                message: "Delete bill successfully",
                status: "Success",
                error: "",
                bill: result,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Delete bill failed",
            status: "Failed",
            error: err.message,
            bill: {},
        });
    }
};