const express = require("express")
const router = express.Router()
const {placeOrder,confirmOrder,orderHistory,cancelOrder} = require("../controllers/order.controller.js")
const {protectRoute} = require("../middleware/auth.middleware.js")

router.post("/place-order",protectRoute,placeOrder)
router.post("/confirm",confirmOrder)
router.put("/cancel/:id",protectRoute,cancelOrder)
router.get("/order-history",protectRoute,orderHistory)

module.exports = router