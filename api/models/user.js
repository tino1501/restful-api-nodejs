const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true },
    password: { type: String, default: "test" },
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    sex: { type: Number, default: 3 },
    birthday: { type: String, default: "" },
    imgUrl: { type: String, default: "" },
    role: { type: String, default: "0" }, // 0 -> staff, 1 -> manager
    email: { type: String, default: "" },
    sdt: { type: String, default: "" },
    status: { type: Number, default: 1 },
});

module.exports = mongoose.model("User", userSchema);
