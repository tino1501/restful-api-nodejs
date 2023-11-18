const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    foodnumber: { type: Number, default: 0 }, // so luong mon an trong category
});

module.exports = mongoose.model("Category", categorySchema);
