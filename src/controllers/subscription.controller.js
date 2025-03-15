const Subscription = require("../models/subscription.model.js");
const razorpay = require("../lib/razorpay.js")
const subscriptionList = require("../lib/subscriptions.json")
const crypto = require("crypto")

const createSubscription = async (req, res) => {
    const { planId } = req.body;
    if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
    }
    if (!Object.keys(subscriptionList).includes(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
    }
    const user = req.user._id
    const subscription = subscriptionList[planId]
    const amount = subscription.price * 100

    try {
        const order = await razorpay.orders.create({
            amount,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
            notes: {
                user: user,
                planId: planId,
                target:"subscription"
            },
        });

        res.status(200).json({ orderId: order.id, amount, currency: "INR" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

const confirmSubscription = async (req, res) => {

    const secret = process.env.RAZOR_WEBHOOK_SECRET
    try {
        const signature = req.headers["x-razorpay-signature"];
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(JSON.stringify(req.body));
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== signature) {
            return res.status(400).json({ message: "Invalid signature" });
        }

        if (req.body.event === "payment.captured") {
            const { id: razorpayTransactionId, notes } = req.body.payload.payment.entity;
            if(notes.target != "subscription"){
                return res.status(400).json({ message: "Invalid transaction" });
            }
            const user = notes?.user;
            const planId = notes?.planId;
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 30);

            const subscription = new Subscription({
                user,
                planId,
                status: "active",
                startDate,
                endDate,
                razorpayTransanctionId: razorpayTransactionId,
            });

            await subscription.save();
            res.status(201).json({ message: "success" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }

}

const getUserSubscription = async (req, res) => {
    try {
        const user = req.user._id;

        const subscriptions = await Subscription.find({
            user,
            endDate: { $gt: new Date() }
        });


        if (!subscriptions.length) {
            return res.status(404).json({ message: "No active subscription found" });
        }
        const planPriority = {
            plan_basic: 1,
            plan_standard: 2,
            plan_extended: 3,
        };

        const bestSubscription = subscriptions.sort(
            (a, b) => planPriority[b.planId] - planPriority[a.planId]
        )[0];

        return res.status(200).json(bestSubscription);
    } catch (error) {
        console.error("Error fetching subscription:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



module.exports = {
    createSubscription,
    getUserSubscription,
    confirmSubscription
}