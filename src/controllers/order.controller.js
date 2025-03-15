const crypto = require("crypto");
const Order = require("../models/order.model.js");
const Product = require("../models/product.model.js");
const Cart =  require("../models/cart.model.js");
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
        let orderId = null;

        if (paymentMethod !== "COD") {
            const order = await razorpay.orders.create({
                amount,
                currency: "INR",
                receipt: `receipt_${Date.now()}`,
                payment_capture: 1,
                notes: { user,target:"order" },
            });
            orderId = order.id;
        }

        const newOrder = new Order({
            user,
            products,
            totalAmount,
            shippingAddress,
            paymentMethod,
            transactionId: orderId || null,
            status: paymentMethod !== "COD"? "Pending" : "Confirmed",
        });

        const savedOrder = await newOrder.save();

        if(paymentMethod === "COD"){
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
            pending : paymentMethod !== "COD",
            razorpayOrderId: orderId,
            amount,
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
            const { order_id: transactionId, notes } = req.body.payload.payment.entity;

            if(notes.target != "order"){
                return res.status(400).json({ message: "Invalid transaction" });
            }

            const order = await Order.findOne({ transactionId });
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
            if(order.status != "Pending"){
                return res.status(400).json({ message: "Invalid transaction" });
            }

            

            for (let item of order.products) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            }

            order.status = "Confirmed";
            await order.save();


            return res.status(200).json({ message: "Order confirmed successfully", order });
        }

        res.status(200).json({ message: "Event received" });
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const cancelOrder = async (req,res)=>{

}
const orderHistory = async (req,res)=>{
    const user = req.user._id;
    const orders = await Order.find({ user }).populate("products.product");
    res.json(orders);
}

module.exports = {
    placeOrder,
    cancelOrder,
    orderHistory,
    confirmOrder
}