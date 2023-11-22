const mongoose = require("mongoose");

const billSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    timeCheckIn: { type: Number, required:true }, // miliseconds
    timeCheckout: { type: Number, default: -1 },
    note: { type: String, default: "" },
    tips: { type: Number, default: 0 }, // tien tip nhan vien
    status: { type: Number, default: 0 }, // 0 -> chưa thanh toán, 1 -> đã thanh toán
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table",
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

module.exports = mongoose.model("Bill", billSchema);
