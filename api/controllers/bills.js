const mongoose = require("mongoose");
require("dotenv").config();

const normalize = require("../middlewares/normalize-string");
const Bill = require("../models/bill");
const Table = require("../models/table");
const BillInfo = require("../models/billinfo");
const Food = require("../models/food");

exports.get_all = async (req, res, next) => {
    try {
        const bills = await Bill.find()
            .select(
                "_id timeCheckIn timeCheckout note tips status table seller"
            )
            .populate("seller", "_id username first_name last_name")
            .populate("table", "_id tablename status note")
            .exec();

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
                bills: await Promise.all(
                    bills.map(async (bill) => {
                        // Include billinfos for each bill
                        const billinfos = await BillInfo.find({
                            bill: bill._id,
                        })
                            .select("bill food quantity price")
                            .exec();

                        return {
                            _id: bill._id,
                            timeCheckIn: bill.timeCheckIn,
                            timeCheckout: bill.timeCheckout,
                            note: bill.note,
                            tips: bill.tips,
                            status: bill.status,
                            table: bill.table,
                            seller: bill.seller,
                            billinfos: billinfos,
                        };
                    })
                ),
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
            // Lấy danh sách các billinfos cho bill
            const billinfos = await BillInfo.find({ bill: bill._id })
                .select("bill food quantity price")
                .exec();

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
                    billinfos: billinfos, // Danh sách billinfos đã được lấy
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
                                $ifNull: [
                                    // bat loi neu bill khong co billinfo tham chieu toi
                                    {
                                        $arrayElemAt: ["$billInfo.quantity", 0],
                                    },
                                    0,
                                ],
                            },
                            {
                                $ifNull: [
                                    // bat loi neu bill khong co billinfo tham chieu toi
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
    const { timeCheckIn, note, table, seller } = req.body;

    if (!timeCheckIn || !table || !seller) {
        console.log("Missing timeCheckIn or table or seller");
        return res.status(500).json({
            message: "Missing timeCheckIn or table or seller",
            status: "Failed",
            error: "Missing timeCheckIn or table or seller",
            bill: {},
        });
    }

    try {
        let tableObj = await Table.findById(req.body.table);

        // Kiểm tra xem bàn có tồn tại hay không
        if (!tableObj) {
            return res.status(404).json({
                message: "Cannot create bill",
                status: "Failed",
                error: "Table not found",
                bill: {},
            });
        } else if (tableObj.status === 1) {
            // Kiểm tra xem bàn có đang được sử dụng hay không
            return res.status(404).json({
                message: "Cannot create bill",
                status: "Failed",
                error: "Table is in use",
                bill: {},
            });
        }
        console.log("da tao bill");
        const bill = new Bill({
            _id: new mongoose.Types.ObjectId(),
            timeCheckIn: req.body.timeCheckIn,
            table: req.body.table,
            seller: req.body.seller,
        });

        const result = await bill.save();

        if (!result) {
            console.log("khong the luu bill");
            // Nếu không thể tạo bill, cập nhật trạng thái bàn và trả về lỗi
            tableObj.status = 0;
            await tableObj.save();

            res.status(500).json({
                message: "Create bill failed",
                status: "Failed",
                error: "Cannot create bill",
                bill: {},
            });
        } else {
            console.log("da luu bill thanh cong");
            // Nếu tạo bill thành công, cập nhật trạng thái bàn và không thêm BillInfo
            tableObj.status = 1;
            tableObj.bill = result._id;
            const updateStatus = await tableObj.save();

            if (!updateStatus) {
                return res.status(404).json({
                    message: "Cannot update state table after creating bill",
                    status: "Failed",
                    error: "Cannot update state table after creating bill",
                    bill: {},
                });
            } else {
                console.log(result);
                res.status(201).json({
                    message: "Create bill successfully",
                    status: "Success",
                    error: "",
                    bill: {
                        _id: result._id,
                        timeCheckIn: result.timeCheckIn,
                        note: result.note,
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
                        billinfos: [],
                    },
                });
            }
        }
    } catch (err) {
        // Xử lý lỗi chung
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

    const { timeCheckIn, timeCheckout, note, tips, table, seller, billinfos } =
        req.body;

    // // Kiểm tra tính hợp lệ của các trường đầu vào
    // if (!timeCheckIn || !status || !table || !seller || !billinfos) {
    //     res.status(400).json({
    //         message: "Update failed",
    //         status: "Failed",
    //         error: "Invalid input data",
    //         bill: {},
    //     });
    //     return;
    // }

    if (!timeCheckIn) {
        console.log("Missing timeCheckIn");
        res.status(400).json({
            message: "Update failed",
            status: "Failed",
            error: "Invalid input data",
            bill: {},
        });
        return;
    } else if (!table) {
        console.log("Missing table");
        res.status(400).json({
            message: "Update failed",
            status: "Failed",
            error: "Invalid input data",
            bill: {},
        });
        return;
    } else if (!seller) {
        console.log("Missing seller");
        res.status(400).json({
            message: "Update failed",
            status: "Failed",
            error: "Invalid input data",
            bill: {},
        });
        return;
    } else if (!billinfos) {
        console.log("Missing billinfos");
        res.status(400).json({
            message: "Update failed",
            status: "Failed",
            error: "Invalid input data",
            bill: {},
        });
        return;
    }

    const updateOps = {
        timeCheckIn: timeCheckIn,
        timeCheckout: timeCheckout,
        note: note,
        tips: tips,
        table: table,
        status: 1,
        seller: seller,
    };

    console.log(updateOps);
    console.log(billinfos);

    try {
        const result = await Bill.findOneAndUpdate(
            { _id: id },
            { $set: updateOps },
            { new: true }
        ).exec();

        if (!result) {
            console.log("Bill not found");
            return res.status(404).json({
                message: "Bill not found",
                status: "Failed",
                error: "Cannot find bill",
                bill: {},
            });
        }

        // Cập nhật thông tin bàn
        try {
            const updatedTable = await Table.findOneAndUpdate(
                { _id: table._id },
                { $set: { status: 0, bill: null } },
                { new: true }
            ).exec();

            if (!updatedTable) {
                return res.status(404).json({
                    message: "Table not found",
                    status: "Failed",
                    error: "Cannot find table",
                    bill: {},
                });
            } else {
                // Cập nhật hoặc thêm mới BillInfo
                try {
                    for (const billInfoData of billinfos) {
                        const { bill, food, quantity, price } = billInfoData;

                        // Kiểm tra xem có BillInfo nào đã tồn tại chưa
                        let existingBillInfo = await BillInfo.findOne({
                            bill: bill,
                            food: food,
                        });

                        if (existingBillInfo) {
                            // Nếu đã tồn tại, cập nhật thông tin
                            existingBillInfo.quantity = quantity;
                            existingBillInfo.price = price;
                            // Bạn có thể thêm xử lý cho trường note nếu cần
                            await existingBillInfo.save();

                            // Cập nhật số lượng món ăn
                            const existingFood = await Food.findById(food);
                            if (existingFood) {
                                existingFood.soLuongTon +=
                                    existingBillInfo.quantity - quantity;
                                await existingFood.save();
                            }
                        } else {
                            // Nếu chưa tồn tại, thêm mới
                            const newBillInfo = new BillInfo({
                                _id: new mongoose.Types.ObjectId(),
                                bill: bill,
                                food: food,
                                quantity: quantity,
                                price: price,
                                // Bạn có thể thêm xử lý cho trường note nếu cần
                            });
                            await newBillInfo.save();

                            // Cập nhật số lượng món ăn
                            const existingFood = await Food.findById(food);
                            if (existingFood) {
                                existingFood.soLuongTon -= quantity;
                                await existingFood.save();
                            }
                        }
                    }

                    console.log("BillInfos added or updated successfully");
                } catch (error) {
                    console.error("Error adding or updating BillInfos:", error);
                    return res.status(500).json({
                        message: "Update bill failed",
                        status: "Failed",
                        error: "Error adding or updating BillInfos",
                        bill: {},
                    });
                }
            }

            // Trả về kết quả sau khi đã cập nhật tất cả thông tin
            return res.status(200).json({
                message: "Update bill successfully",
                status: "Success",
                error: "",
                bill: {},
            });
        } catch (err) {
            console.error("Error updating Table:", err);
            return res.status(500).json({
                message: "Update bill failed",
                status: "Failed",
                error: "Error updating Table",
                bill: {},
            });
        }
    } catch (err) {
        console.error("Error updating Bill:", err);
        return res.status(500).json({
            message: "Update bill failed",
            status: "Failed",
            error: "Error updating Bill",
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
