const express = require("express")
const router = express.Router()
const {placeOrder,confirmOrder,orderHistory} = require("../controllers/order.controller.js")
const {protectRoute} = require("../middleware/auth.middleware.js")

router.post("/place-order",protectRoute,placeOrder)
router.post("/confirm",confirmOrder)
router.get("/order-history",protectRoute,orderHistory)

module.exports = router