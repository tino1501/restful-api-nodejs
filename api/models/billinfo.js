const mongoose = require("mongoose");

const billInfoSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    bill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bill",
        required: true,
    },
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    note: {
        type: String,
        required: false,
        default: "",
    },
});

module.exports = mongoose.model("BillInfo", billInfoSchema);
