const express = require("express")
const router = express.Router()
const {login,signup,logout,updateProfile,checkAuth, verifyOtp} = require("../controllers/auth.controller.js")
const {protectRoute} = require("../middleware/auth.middleware.js")

router.post("/signup",signup)
router.post("/verify-otp",verifyOtp)
router.post("/login",login)
router.post("/logout",logout)

router.put("/update-profile",protectRoute ,updateProfile)

router.get("/check",protectRoute ,checkAuth)

module.exports = router