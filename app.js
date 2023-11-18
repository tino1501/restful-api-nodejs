const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const foodRoutes = require("./api/routes/foods");
const userRoutes = require("./api/routes/users");
const categoryRoutes = require("./api/routes/categories");
const tableRoutes = require("./api/routes/tables");
const billRoutes = require("./api/routes/bills");
const billInfoRoutes = require("./api/routes/billInfo");

let mongoPass = process.env.MONGO_ATLAS_PW;
let databaseName = process.env.DATABASE_NAME;
let mongoUri = `mongodb+srv://ngantrandev:${mongoPass}@nodejs-rest-api.uxdcqko.mongodb.net/${databaseName}?retryWrites=true&w=majority`;

mongoose.connect(mongoUri);

app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT,POST,PATCH,DELETE,GET");
        return res.status(200).json({});
    }
    next();
});

// routes which should handle requests
app.use("/foods", foodRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/tables", tableRoutes);
app.use("/bills", billRoutes);
app.use("/billinfo", billInfoRoutes);

app.use((req, res, next) => {
    const error = new Error("Not found method");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});

module.exports = app;
