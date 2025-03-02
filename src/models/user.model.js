const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        fullname: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        dp: {
            type: String,
            default: "",
        },
        role: { type: String, enum: ["consumer", "shop","admin"], default: "consumer" },
    },
    { timestamps: true }
)

const User = mongoose.model("User", userSchema)
module.exports = User