const mongoose = require("mongoose");

const tableSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    tablename: { type: String, default: "Chua dat ten" },
    note: { type: String, default: "" },
    status: { type: Number, default: 0 },
});

module.exports = mongoose.model("Table", tableSchema);
