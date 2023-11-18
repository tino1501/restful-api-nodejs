const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user");

module.exports = (req, res, next) => {
    try {
        // // const token = req.headers.authorization.split(" ")[1];

        // // const decoded = jwt.verify(token, process.env.JWT_KEY);
        // // const userData = decoded;
        // 

        // if (req.body.access_token) {
        //     const result = jwt.verify(
        //         req.body.access_token,
        //         process.env.JWT_KEY,
        //         (err, decoded) => {
        //             if (err) {
        //                 return res.status(401).json({
        //                     message: "Can not login",
        //                     desc: "Invalid access token",
        //                     status: "Failed",
        //                 });
        //             } else {
        //                 return decoded;
        //             }
        //         }
        //     );

        //     User.findOne({ username: result.username })
        //         .exec()
        //         .then((user) => {
        //             if (user && user.password === result.password) {
        //                 res.status(200).json({
        //                     message: "Xac thuc thanh cong",
        //                     status: "Success",
        //                 });
        //                 next();
        //             } else {
        //                 res.status(401).json({
        //                     message: "Xac thuc that bai",
        //                     status: "Failed",
        //                 });
        //             }
        //         });
        // }
        // else if (req.body.username && req.body.password) {
        //     User.findOne({ username: result.username })
        //         .exec()
        //         .then((user) => {
        //             if (user && user.password === result.password) {
        //                 res.status(200).json({
        //                     message: "Xac thuc thanh cong",
        //                     status: "Success",
        //                 });
        //                 next();
        //             } else {
        //                 res.status(401).json({
        //                     message: "Xac thuc that bai",
        //                     status: "Failed",
        //                 });
        //             }
        //         });
        // }
        // else{
        //     res.status(401).json({
        //         message: "Xac thuc that bai",
        //         status: "Failed",
        //     });
        // }

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Auth failed",
            status: "Failed",
        });
    }
};
