const Cart = require("../models/cart.model.js");
const Product = require("../models/product.model.js");
const Coupon = require("../models/coupon.model.js")

const addToCart = async (req, res) => {
    try {
        const user = req.user._id;
        const { product, quantity } = req.body;

        if (!product || quantity <= 0) {
            return res.status(400).json({ message: "Invalid product or quantity" });
        }

        const productRes = await Product.findById(product);
        if (!productRes) return res.status(404).json({ message: "Product not found" });

        let cart = await Cart.findOne({ user });

        if (!cart) {
            cart = new Cart({ user, items: [{ product, quantity, price: productRes.price }], totalAmount: productRes.price * quantity });
        } else {
            const itemIndex = cart.items.findIndex(item => item.product.toString() === product);

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ product, quantity, price: productRes.price });
            }
        }

        cart.totalAmount = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
        cart.discount = 0
        cart.coupon = null
        await cart.save();
        res.status(200).json({ message: "Item added to cart", cart });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const user = req.user._id;
        const { product } = req.body;

        if (!product) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        let cart = await Cart.findOne({ user });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== product);

        cart.totalAmount = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
        cart.discount = 0
        cart.coupon = null
        await cart.save();
        res.json({ message: "Item removed from cart"});

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const user = req.user._id;
        const { product, quantity } = req.body;

        if (!product || quantity < 1) {
            return res.status(400).json({ message: "Invalid product ID or quantity" });
        }

        let cart = await Cart.findOne({ user });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === product);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
        } else {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        cart.totalAmount = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
        cart.discount = 0
        cart.coupon = null
        await cart.save();
        res.json({ message: "Cart updated successfully", cart });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCart = async (req, res) => {
    try {
        const user = req.user._id;

        const cart = await Cart.findOne({ user }).populate("items.product", "name price");

        if (!cart || cart.items.length === 0) {
            return res.status(200).json({ message: "Cart is empty", cart: [] });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const applyCoupon = async (req,res)=> {
    try {
        const user = req.user._id
        const { coupon } = req.params
        const cart = await Cart.findOne({ user })

        if (!cart) return res.status(400).json({ message: "Cart not found" })
        
        const couponCode = await Coupon.findOne({ code: coupon })

        if (!couponCode) return res.status(404).json({ message: "Coupon not found" })
        

        if (!couponCode.isActive) return res.status(400).json({ message: "Coupon is not active" })

        if (new Date() > couponCode.expiresAt) return res.status(400).json({ message: "Coupon has expired" })

        if (cart.totalAmount < couponCode.minOrderValue) {
            return res.status(400).json({ 
                message: `Minimum order value for this coupon is ₹${couponCode.minOrderValue}`
            });
        }

        const userUsage = couponCode.usedBy.find(entry => entry.user.toString() === user.toString());

        if (userUsage && userUsage.usageCount >= couponCode.usageLimit) {
                return res.status(400).json({ message: "You have reached the usage limit for this coupon." });
        }


        let discountAmount = couponCode.discountType === "percentage"
            ? (cart.totalAmount * couponCode.discountValue) / 100
            : couponCode.discountValue;
        
        
        if (couponCode.maxDiscount !== null) {
            discountAmount = Math.min(discountAmount, couponCode.maxDiscount);
        }

        const finalPrice = cart.totalAmount - discountAmount;

        if(!finalPrice){
            return res.status(400).json({ message: "Coupon is not applicable for this order"})
        }

        cart.discount = discountAmount
        cart.coupon = couponCode._id

        couponCode.save();
        cart.save()

        res.status(200).json({
            message: "Coupon applied successfully.",
            discountAmount,
            finalPrice
        });
        
    } catch (error) {
        console.error("Error in applyCoupon",error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const getAvailableCoupon = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user:userId })
        if (!cart) {
            return res.status(404).json({ message: "Add items to the cart" });
        }

        const availableCoupons = await Coupon.find({
            isActive: true,
            expiresAt: { $gt: new Date() },
            minOrderValue: { $lte: cart.totalAmount }
        });
        

        const filteredCoupons = availableCoupons.filter(coupon => {
            const userUsage = coupon.usedBy.find(entry => entry.user.toString() === userId.toString());
            return !userUsage || userUsage.usageCount < coupon.usageLimit;
        }).map(({code,description,minOrderValue,maxDiscount})=>({
            code,description,minOrderValue,maxDiscount
        }));

        if (filteredCoupons.length === 0) {
            return res.status(200).json({ message: "No available coupons for you.", coupons: [] });
        }

        res.status(200).json({ message: "Available coupons fetched successfully.", coupons: filteredCoupons });

    } catch (error) {
        console.error("Error in GetAvailableCoupon",error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = {
    addToCart,
    removeFromCart,
    updateCartItem,
    getCart,
    applyCoupon,
    getAvailableCoupon
};
