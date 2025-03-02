const express = require("express")
const router = express.Router()
const {getCart,addToCart,removeFromCart,updateCartItem} = require("../controllers/cart.controller.js")
const {protectRoute} = require("../middleware/auth.middleware.js")

router.get("/",protectRoute,getCart)
router.post("/",protectRoute,addToCart)
router.put("/",protectRoute,updateCartItem)
router.delete("/",protectRoute,removeFromCart)

module.exports = router
