const mongoose = require("mongoose");
require("dotenv").config();

const Table = require("../models/table");
const normalizeString = require("../middlewares/normalize-string");

exports.get_all = async (req, res, next) => {
    try {
        const tables = await Table.find().exec();

        if (!tables) {
            res.status(500).json({
                message: "Lấy danh sách bàn thất bại",
                status: "Failed",
                error: "Không thể lấy danh sách bàn ăn",
                count: 0,
                tables: [],
            });
        } else {
            const response = {
                message: "Lấy danh sách bàn ăn thành công",
                status: "Success",
                error: "",
                count: tables.length,
                tables: tables.map((table) => {
                    return {
                        _id: table._id,
                        tablename: table.tablename,
                        note: table.note,
                        status: table.status,
                    };
                }),
            };

            res.status(200).json(response);
        }
    } catch (err) {
        res.status(500).json({
            message: "Lấy danh sách bàn thất bại",
            status: "Failed",
            error: err.message,
            count: 0,
            tables: [],
        });
    }
};

exports.get_table = async (req, res, next) => {
    if (!req.params._id) {
        return res.status(500).json({
            message: "Không thể lấy thông tin bàn ăn",
            status: "Failed",
            error: "Thiếu id bàn ăn",
            table: {},
        });
    }

    let id = normalizeString.normalizeString(req.params._id);

    try {
        const table = await Table.findById(id).exec();

        if (!table) {
            res.status(404).json({
                message: "Không thể lấy thông tin bàn ăn",
                status: "Failed",
                error: "Không tìm thấy bàn ăn",
                table: {},
            });
        } else {
            res.status(200).json({
                message: "Lấy thông tin bàn thành công",
                status: "Success",
                error: "",
                table: {
                    _id: table._id,
                    tablename: table.tablename,
                    note: table.note,
                    status: table.status,
                    bill: table.bill,
                },
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Lấy thông tin bàn thất bại",
            status: "Failed",
            error: err.message,
            table: {},
        });
    }
};

exports.create_table = async (req, res, next) => {
    if (!req.body.tablename) {
        return res.status(500).json({
            message: "Tạo bàn thất bại",
            status: "Failed",
            error: "Thiếu tên bàn ăn",
            table: {},
        });
    }

    let tablename = normalizeString.normalizeString(req.body.tablename);

    try {
        const table = await Table.findOne({
            tablename: tablename,
        }).exec();

        if (table) {
            return res.status(409).json({
                message: "Tên bàn bị trùng lặp",
                status: "Failed",
                error: "Tên bàn bị trùng lặp",
                table: {},
            });
        } else {
            const newTable = new Table({
                _id: new mongoose.Types.ObjectId(),
                tablename: tablename,
            });

            const result = await newTable.save();

            if (!result) {
                res.status(500).json({
                    message: "Tạo bàn thất bại",
                    status: "Failed",
                    error: "Tạo bàn thất bại",
                    table: {},
                });
            } else {
                res.status(201).json({
                    message: "Tạo bàn thành công",
                    status: "Success",
                    error: "",
                    table: {
                        _id: result._id,
                        tablename: result.tablename,
                        note: result.note,
                        status: result.status,
                        bill: result.bill,
                    },
                });
            }
        }
    } catch (err) {
        res.status(500).json({
            message: "Có lỗi khi tạo bàn",
            status: "Failed",
            error: err.message,
            table: {},
        });
    }
};

exports.delete_table = async (req, res, next) => {
    if (!req.params._id) {
        return res.status(500).json({
            message: "Không thể xóa bàn ăn",
            status: "Failed",
            error: "Thiếu id bàn ăn",
            table: {},
        });
    }
    let id = normalizeString.normalizeString(req.params._id);

    try {
        const result = await Table.findOneAndDelete({ _id: id }).exec();

        if (!result) {
            res.status(404).json({
                message: "Không thể xóa bàn ăn",
                status: "Failed",
                error: "Không tìm thấy bàn ăn",
                table: {},
            });
        } else {
            res.status(200).json({
                message: "Xóa bàn ăn thành công",
                status: "Success",
                error: "",
                table: {
                    _id: result._id,
                    tablename: result.tablename,
                    note: result.note,
                    status: result.status,
                },
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Có lỗi khi xóa bàn ăn",
            status: "Failed",
            error: err.message,
            table: {},
        });
    }
};

exports.update_table = async (req, res, next) => {
    if (!req.params._id) {
        return res.status(400).json({
            message: "Thiếu thông tin",
            status: "Failed",
            error: "Thiếu id bàn ăn",
            table: {},
        });
    }

    if (!req.body.tablename && !req.body.note && !req.body.status) {
        return res.status(400).json({
            message: "Thiếu thông tin",
            status: "Failed",
            error: "Thông tin cập nhật bàn ăn không hợp lệ",
            table: {},
        });
    }

    let id = normalizeString.normalizeString(req.params._id);

    try {
        const result = await Table.findOneAndUpdate(
            { _id: id },
            {
                tablename: req.body.tablename,
                note: req.body.note,
                status: req.body.status,
            },
            { new: true }
        ).exec();

        if (!result) {
            res.status(404).json({
                message: "Cập nhật bàn thất bại",
                status: "Failed",
                error: "Không tìm thấy bàn",
                table: {},
            });
        } else {
            res.status(200).json({
                message: "Cập nhật thông tin bàn thành công",
                status: "Success",
                error: "",
                table: {
                    _id: result._id,
                    tablename: result.tablename,
                    note: result.note,
                    status: result.status,
                },
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Cập nhật bàn thất bại",
            status: "Failed",
            error: err.message,
            table: {},
        });
    }
};
