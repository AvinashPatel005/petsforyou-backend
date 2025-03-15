const express = require("express");
const router = express.Router();
const { createSubscription,confirmSubscription, getUserSubscription } = require("../controllers/subscription.controller.js");
const {protectRoute} = require("../middleware/auth.middleware.js")
const validateSubscription = require("../middleware/subscription.middleware.js");

router.post("/create",protectRoute,createSubscription);
router.post("/confirm",confirmSubscription);
router.get("/",protectRoute, getUserSubscription);
router.get("/dashboard",protectRoute,validateSubscription,(req,res)=>{
    res.send("Dashboard:"+req.subscription);
})

module.exports = router;
