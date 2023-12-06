const mongoose = require("mongoose");
require("dotenv").config();

const normalize = require("../middlewares/normalize-string");
const Bill = require("../models/bill");
const Table = require("../models/table");
const BillInfo = require("../models/billinfo");

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

exports.get_billamount_by_month = async (req, res, next) => {
    if (!req.query.month || !req.query.year) {
        return res.status(400).json({
            message: "Get list bill failed",
            status: "Failed",
            error: "Cannot get list bill",
            count: 0,
            list_bill_amount: [],
        });
    }

    const month = parseInt(normalize.normalizeInt(req.query.month));
    const year = parseInt(normalize.normalizeInt(req.query.year));

    // Lấy ngày đầu tiên và cuối cùng của tháng
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);

    const listBillAmount = await Bill.aggregate([
        {
            $match: {
                timeCheckIn: {
                    $gte: firstDayOfMonth.getTime(),
                    $lt: lastDayOfMonth.getTime(),
                },
            },
        },
        {
            $lookup: {
                from: "billinfos",
                localField: "_id",
                foreignField: "bill",
                as: "billInfo",
            },
        },
        {
            $group: {
                _id: {
                    date: {
                        $dateToString: {
                            format: "%d",
                            date: { $toDate: "$timeCheckIn" },
                        },
                    },
                },
                total_food_amount: {
                    $sum: {
                        $multiply: [
                            {
                                $ifNull: [ // bat loi neu bill khong co billinfo tham chieu toi
                                    {
                                        $arrayElemAt: ["$billInfo.quantity", 0],
                                    },
                                    0,
                                ],
                            },
                            {
                                $ifNull: [ // bat loi neu bill khong co billinfo tham chieu toi
                                    {
                                        $arrayElemAt: ["$billInfo.price", 0],
                                    },
                                    0,
                                ],
                            },
                        ],
                    },
                },

                total_tips: {
                    $sum: "$tips",
                },

                dathanhtoan: {
                    $sum: {
                        $cond: {
                            if: { $eq: ["$status", 1] },
                            then: 1,
                            else: 0,
                        },
                    },
                },
                chuathanhtoan: {
                    $sum: {
                        $cond: {
                            if: { $eq: ["$status", 0] },
                            then: 1,
                            else: 0,
                        },
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                date: "$_id.date",
                total_food_amount: 1,
                total_tips: 1,
                dathanhtoan: "$dathanhtoan",
                chuathanhtoan: "$chuathanhtoan",
            },
        },
    ]);

    if (listBillAmount) {
        res.status(200).json({
            message: "Get list bill successfully",
            status: "Success",
            error: "",
            count: listBillAmount.length,
            list_bill_amount: listBillAmount,
        });
    } else {
        res.status(500).json({
            message: "Get list bill failed",
            status: "Failed",
            error: "Cannot get list bill",
            count: 0,
            list_bill_amount: [],
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

        const bill = new Bill({
            _id: new mongoose.Types.ObjectId(),
            timeCheckIn: req.body.timeCheckIn,
            note: req.body.note,
            table: req.body.table,
            seller: req.body.seller,
        });

        const result = await bill.save(); // luu bill vao database

        if (!result) {
            table.status = 0;
            await table.save();

            res.status(500).json({
                message: "Create bill failed",
                status: "Failed",
                error: "Cannot create bill",
                bill: {},
            });
        } else {
            // cap nhat trang thai table
            table.status = 1;
            const updatestatus = await table.save();

            if (!updatestatus) {
                return res.status(404).json({
                    message: "Cannot update state table after create bill",
                    status: "Failed",
                    error: "Khong the cap nhat trang thai ban sau khi tao bill",
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
