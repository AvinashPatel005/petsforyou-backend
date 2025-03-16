const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    description:{type: String, required: true},
    discountType: { type: String, enum: ["percentage", "fixed"], required: true }, 
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },

    usageLimit: { type: Number, default: 1 },
    usedBy: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User",required:true },
        usageCount: { type: Number, default: 0 }
    }]

}, { timestamps: true });

module.exports = mongoose.model("Coupon", CouponSchema);