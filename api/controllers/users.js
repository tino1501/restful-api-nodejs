const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/user");
const MapLabel = require("../middlewares/map-label");

exports.get_all = (req, res, next) => {
    User.find()
        .exec()
        .then((users) => {
            const response = {
                message: "Lấy danh sách user thành công",
                status: "Success",
                error: "",
                count: users.length,
                users: users.map((user) => {
                    return {
                        _id: user._id,
                        username: user.username,
                        password: user.password,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        sex: MapLabel.mapToSexLabel(user.sex),
                        birthday: user.birthday,
                        imgUrl: user.imgUrl,
                        role: user.role == 0 ? "staff" : "manager",
                        email: user.email,
                        sdt: user.sdt,
                        status: user.status,
                    };
                }),
            };
            res.status(200).json(response);
        })
        .catch((err) => {
            res.status(500).json({
                message: "Có lỗi khi lấy danh sách user",
                status: "Failed",
                error: err.message,
                count: 0,
                users: [],
            });
        });
};

exports.get_user = async (req, res, next) => {
    try {
        const user = await User.findOne({
            username: req.params.username,
        }).exec();

        if (!user) {
            res.status(404).json({
                message: "Can not find user",
                status: "Failed",
                error: "User not found",
                user: {},
            });
        } else {
            res.status(200).json({
                message: "Get user successful",
                status: "Success",
                error: "",
                user: {
                    _id: user._id,
                    username: user.username,
                    password: user.password,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    sex: MapLabel.mapToSexLabel(user.sex),
                    birthday: user.birthday,
                    imgUrl: user.imgUrl,
                    role: user.role == 0 ? "staff" : "manager",
                    email: user.email,
                    sdt: user.sdt,
                    status: user.status,
                },
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
            status: "Failed",
            error: err.message,
            user: {},
        });
    }
};

exports.user_signup = async (req, res, next) => {
    try {
        const user = await User.findOne({
            username: req.body.username,
        }).exec();

        if (user) {
            return res.status(409).json({
                message: "Can not create user",
                status: "Failed",
                error: "Username already exists",
                access_token: "",
                user: {},
            });
        } else {
            const newUser = new User({
                _id: new mongoose.Types.ObjectId(),
                username: req.body.username,
                password: req.body.password,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                sex: req.body.sex,
                birthday: req.body.birthday,
                imgUrl: req.body.imgUrl,
                email: req.body.email,
                sdt: req.body.sdt,
            });

            const result = await newUser.save();

            if (!result) {
                res.status(500).json({
                    message: "Can not create user",
                    status: "Failed",
                    error: "Create user failed",
                    access_token: "",
                    user: {},
                });
            } else {
                res.status(201).json({
                    message: "User created",
                    status: "Success",
                    error: "",
                    access_token: "here is access token",
                    user: {
                        _id: result._id,
                        username: result.username,
                        password: result.password,
                        first_name: result.first_name,
                        last_name: result.last_name,
                        sex: MapLabel.mapToSexLabel(result.sex),
                        birthday: result.birthday,
                        imgUrl: result.imgUrl,
                        role: result.role == 0 ? "staff" : "manager",
                        email: result.email,
                        sdt: result.sdt,
                        status: result.status,
                    },
                });
            }
        }
    } catch (err) {
        const response = {
            message: "Something went wrong",
            status: "Failed",
            error: err.message,
            access_token: "",
            user: {},
        };
        res.status(500).json(response);
    }
};

exports.user_signin = async (req, res, next) => {
    if (!req.body.username) {
        return res.status(401).json({
            message: "Can not login",
            status: "Failed",
            error: "Missing username",
            access_token: "",
            user: {},
        });
    } else if (!req.body.password) {
        return res.status(401).json({
            message: "Can not login",
            status: "Failed",
            error: "Missing password",
            access_token: "",
            user: {},
        });
    }

    try {
        const user = await User.findOne({
            username: req.body.username,
        }).exec();

        if (!user) {
            return res.status(401).json({
                message: "Can not login",
                status: "Failed",
                error: "Cannot find user",
                access_token: "",
                user: {},
            });
        }
        if (req.body.password !== user.password) {
            return res.status(401).json({
                message: "Can not login",
                status: "Failed",
                error: "Wrong password",
                access_token: "",
                user: {},
            });
        }

        res.status(200).json({
            message: "Login successful",
            status: "Success",
            error: "",
            access_token: "",
            user: user,
        });
    } catch (err) {
        const response = {
            message: "Something went wrong",
            status: "Failed",
            error: err,
            access_token: "",
            user: {},
        };
        res.status(500).json(response);
    }
};

exports.user_delete = (req, res, next) => {
    if (!req.params.username) {
        return res.status(400).json({
            message: "Cannot delete user",
            status: "Failed",
            error: "missing username field",
            user: {},
        });
    }

    User.findOneAndDelete({ username: req.params.username })
        .exec()
        .then((result) => {
            if (!result) {
                return res.status(404).json({
                    message: "User not found",
                    status: "Failed",
                    error: "User name not found",
                    user: {},
                });
            }
            res.status(200).json({
                message: "User deleted",
                status: "Success",
                error: "",
                user: result,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                message: "Something went wrong",
                status: "Failed",
                error: err.message,
                user: {},
            });
        });
};
