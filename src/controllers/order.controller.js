const crypto = require("crypto");
const Order = require("../models/order.model.js");
const Product = require("../models/product.model.js");
const Cart = require("../models/cart.model.js");
const Coupon = require("../models/coupon.model.js")

const razorpay = require("../lib/razorpay.js")

const placeOrder = async (req, res) => {
    const user = req.user._id;

    try {
        const cart = await Cart.findOne({ user }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Your cart is empty" });
        }

        const totalAmount = cart.totalAmount;

        const products = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.price
        }));

        const { shippingAddress, paymentMethod } = req.body;
        if (!shippingAddress) {
            return res.status(400).json({ message: "Shipping address is required" });
        }

        const amount = parseInt(totalAmount) * 100;
        const couponCode = await Coupon.findById(cart.coupon);

        if (cart.coupon != null) {
            if (!couponCode) {
                return res.status(404).json({ message: "Coupon not found" });
            }

            const userUsage = couponCode.usedBy.find(entry => entry.user.toString() === user.toString());

            if (userUsage) {
                if (userUsage.usageCount >= couponCode.usageLimit) {
                    return res.status(400).json({ message: "You have reached the usage limit for this coupon." });
                }
                userUsage.usageCount += 1;
            } else {
                couponCode.usedBy.push({ user, usageCount: 1 });
            }
        }


        const charges = 40
        const discount = parseInt(cart.discount)


        let orderId = null;
        const finalAmount = amount + (charges - discount) * 100

        if (paymentMethod !== "COD") {
            const order = await razorpay.orders.create({
                amount: finalAmount,
                currency: "INR",
                receipt: `receipt_${Date.now()}`,
                payment_capture: 1,
                notes: { user, target: "order" },
            });
            orderId = order.id;
        }

        const newOrder = new Order({
            user,
            products,
            totalAmount,
            charges,
            discount,
            shippingAddress,
            paymentMethod,
            orderId: orderId || null,
            status: paymentMethod !== "COD" ? "Pending" : "Confirmed",
        });
        
        if(cart.coupon != null) await couponCode.save();
        const savedOrder = await newOrder.save();

        if (paymentMethod === "COD") {
            for (let item of products) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            }
        }

        await Cart.findOneAndDelete({ user });

        res.status(200).json({
            message: "Order placed successfully",
            order: savedOrder,
            pending: paymentMethod !== "COD",
            razorpayOrderId: orderId,
            amount: amount + (charges - discount) * 100,
            currency: "INR",
        });
    } catch (error) {
        console.error("Error in placing order:", error);
        res.status(500).json({ message: "Internal server error", details: error.message });
    }
};

const confirmOrder = async (req, res) => {
    try {
        const secret = process.env.RAZOR_WEBHOOK_SECRET;
        const signature = req.headers["x-razorpay-signature"];
        const body = JSON.stringify(req.body);

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        if (signature !== expectedSignature) {
            return res.status(400).json({ message: "Invalid webhook signature" });
        }

        if (req.body.event === "payment.captured") {
            const { order_id: orderId,id, notes } = req.body.payload.payment.entity;

            if (notes.target != "order") {
                return res.status(400).json({ message: "Invalid transaction" });
            }

            const order = await Order.findOne({ orderId });
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
            if (order.status != "Pending") {
                return res.status(400).json({ message: "Invalid transaction" });
            }



            for (let item of order.products) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            }

            order.status = "Confirmed";
            order.transactionId = id
            await order.save();


            return res.status(200).json({ message: "Order confirmed successfully", order });
        }

        res.status(200).json({ message: "Event received" });
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const processRefund = async (transactionId, amount) => {
    try {
        const refund = await razorpay.payments.refund(transactionId, {
            amount: parseInt(amount) * 100
        });
        return true;
    } catch (error) {
        console.error("Refund failed:", error);
        return false;
    }
};


const cancelOrder = async (req, res) => {
    try {
        const id = req.params.id
        const order = await Order.findById(id)
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status == "Cancelled") {
            return res.status(400).json({ message: "Order already cancelled" });
        }
        if (order.status == "Delivered") {
            return res.status(400).json({ message: "Order already delivered" });
        }

        const bulkOps = order.products.map(item => ({
            updateOne: {
                filter: { _id: item.product._id },
                update: { $inc: { stock: item.quantity } }
            }
        }));

        await Product.bulkWrite(bulkOps);

        if (order.paymentMethod != "COD" && order.status != "Pending") {
            if (!order.transactionId) {
                return res.status(400).json({ message: "Transaction ID not found for refund" });
            }
            
            const refundSuccess = await processRefund(order.transactionId, order.totalAmount+order.charges-order.discount);
            if (!refundSuccess) {
                return res.status(400).json({ message: "Refund processing failed" });
            }
            order.paymentStatus = "Refunded";
        }

        order.status = "Cancelled"
        await order.save()
        return res.status(200).json({ message: "Order cancelled successfully", order })
    } catch (error) {
        console.error("Error in Cancel Orders:", error);
        res.status(500).json({ message: "Internal server error", message: error.message });
    }

}
const orderHistory = async (req, res) => {
    const user = req.user._id;
    const orders = await Order.find({ user });
    res.json(orders);
}

module.exports = {
    placeOrder,
    cancelOrder,
    orderHistory,
    confirmOrder
}