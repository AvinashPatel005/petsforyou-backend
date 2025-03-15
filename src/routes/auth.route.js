const express = require("express")
const router = express.Router()
const {login,signup,logout,updateProfile,listAddress,addAddress,updateAddress,checkAuth, verifyOtp} = require("../controllers/auth.controller.js")
const {protectRoute} = require("../middleware/auth.middleware.js")

router.post("/signup",signup)
router.post("/verify-otp",verifyOtp)
router.post("/login",login)
router.post("/logout",logout)

router.post("/update-profile",protectRoute ,updateProfile)

router.get("/list-address",protectRoute,listAddress)
router.post("/add-address",protectRoute,addAddress)
router.post("/update-address/:id",protectRoute,updateAddress)

router.get("/check",protectRoute ,checkAuth)

module.exports = router