const jwt = require('jsonwebtoken');
const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    })
}

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const isValidAddress = (address) => {
    if (
        !address ||
        typeof address !== "object" ||
        typeof address.street !== "string" ||
        typeof address.city !== "string" ||
        typeof address.state !== "string" ||
        typeof address.zipCode !== "string" ||
        typeof address.country !== "string" ||
        typeof address.coordinates !== "object" ||
        typeof address.coordinates.lat !== "number" ||
        typeof address.coordinates.lng !== "number"
    ) {
        return false;
    }
    return true;
};


module.exports = { generateToken, generateOTP,isValidAddress };