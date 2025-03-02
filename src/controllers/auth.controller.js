const bcrypt = require("bcryptjs");

const { generateToken, generateOTP} = require("../lib/utils.js");

const User = require("../models/user.model.js");
const OTP = require('../models/otp.model.js');
const cloudinary = require("../lib/cloudinary.js");
const sendMail = require("../lib/email.js");

const signup = async (req, res) => {
    const { fullname, age, email, password } = req.body;
    if (!fullname || !age || !email || !password) {
        return res.status(400).json({ message: "All fields are required" })
    }
    try {

        if (password.length < 6) {
            return res.status(400).json({ message: "Password should be atleast 6 characters long" })
        }
        if (age < 0) {
            return res.status(400).json({ message: "Age must be greater than 0" })
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Email already Registered" })
        }

        const otp = generateOTP()
        // const mailRes = await sendMail(email,"Your OTP Code",`Your OTP is: ${otp}.\n\nIt is valid for 5 minutes.\n\nThank you`);
        
        // if (!mailRes.success) {
        //     return res.status(500).json({ message: "Failed to send OTP" });
        // }
        await OTP.deleteMany({ email });
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash("123456", salt);
        // const hashedOTP = await bcrypt.hash(otp, salt);
        await OTP.create({ email, otp: hashedOTP, expiresAt: Date.now() + 5 * 60 * 1000 });

        return res.status(200).json({ message: "OTP sent. Please verify to complete registration." });

    } catch (error) {
        console.log("Error in Signup Controller", error.message)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

const verifyOtp = async (req, res) => {
    const { email, otp, fullname, age, password } = req.body;

    if (!email || !otp || !fullname || !age || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord || otpRecord.expiresAt < Date.now()) {
            ;
            return res.status(400).json({ message: "OTP expired or invalid" })
        }
        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid OTP" })
        }

        await OTP.deleteMany({ email });

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            age,
            email,
            password: hashPassword
        })

        if (newUser) {
            generateToken(newUser._id, res)
            await newUser.save();

            const subject = `Welcome ${fullname}` ;
            const text = `Hello,\n\nYour email has been successfully verified. You can now access our platform.\n\nThank you!`;
            // sendMail(email, subject, text);

            return res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                age: newUser.age,
                email: newUser.email,
                dp: newUser.dp,
            })
        }
        else {
            return res.status(400).json({ message: "Something went wrong" })
        }

    } catch (error) {
        console.error("Error in OTP Verification", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }
        generateToken(user._id, res)
        return res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            age: user.age,
            email: user.email,
            dp: user.dp,
        })

    } catch (error) {
        console.log("Error in Login Controller", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        console.log("Error in Logout Controller", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const updateProfile = async (req, res) => {
    try {
        const { dp,fullname,age } = req.body
        const userId = req.user._id
        if(!(age || fullname || dp)){
            res.status(400).json({ message: "Atleast one field required" })
        }
        let dpUrl = ""
        if (dp) {
            const uploadResponse = await cloudinary.uploader.upload(dp)
            dpUrl = uploadResponse.secure_url
        }
        
        const updatedUser = await User.findByIdAndUpdate(userId, { dp:dpUrl,fullname,age }, { new: true }).select("-password")

        res.status(200).json(updatedUser)

    } catch (error) {
        console.log("Error in UpdateProfile Controller", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth Controller", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

module.exports = {
    signup,
    verifyOtp,
    login,
    logout,
    updateProfile,
    checkAuth
}