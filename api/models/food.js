const mongoose = require("mongoose");

const foodSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    discount: { type: Number, default: 0 }, // giảm giá đơn vị %
    description: { type: String, default: "" },
    soLuongTon: { type: Number, default: 0 },
    imgUrl: { type: String, default: "" },
    status: { type: Number, default: 1 }, // 1 -> đang bán

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
});

module.exports = mongoose.model("Food", foodSchema);
