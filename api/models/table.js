const mongoose = require("mongoose");

const tableSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    tablename: { type: String, default: "Chua dat ten" },
    note: { type: String, default: "" },
    status: { type: Number, default: 0 },
    bill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bill",
        required: false,
        default: null,
    },
});

module.exports = mongoose.model("Table", tableSchema);
