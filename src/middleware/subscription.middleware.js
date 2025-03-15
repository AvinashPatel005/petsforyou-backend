const Subscription = require("../models/subscription.model");

const validateSubscription = async (req, res, next) => {
  try {
    const user = req.user._id;

    const subscriptions = await Subscription.find({ 
      user, 
      endDate: { $gt: new Date() }
    });

    if (!subscriptions.length) {
      return res.status(403).json({ message: "Access Denied: No active subscription found" });
    }

    const planPriority = { plan_basic: 1, plan_standard: 2, plan_extended: 3 };

    const bestSubscription = subscriptions.sort((a, b) => {
      const priorityA = planPriority[a.planId] || 0;
      const priorityB = planPriority[b.planId] || 0;

      return priorityB - priorityA || new Date(b.endDate) - new Date(a.endDate);
    })[0];

    req.subscription = bestSubscription;
    
    next();
  } catch (error) {
    console.error("Subscription Middleware Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = validateSubscription;
