const express = require("express")
const router = express.Router()
const {createShop,getAllShops,getShopById,deleteShop,updateShop} = require("../controllers/shop.controller.js")
const {protectRoute} = require("../middleware/auth.middleware.js")

router.get("/",getAllShops)
router.get("/:id",getShopById)
router.post("/create",protectRoute,createShop)
router.delete("/:id",protectRoute,deleteShop)
router.put("/:id",protectRoute,updateShop)


module.exports = router