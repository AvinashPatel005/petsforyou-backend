const Cart = require("../models/cart.model.js");
const Product = require("../models/product.model.js");

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

        await cart.save();
        res.json({ message: "Item removed from cart", cart });

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

module.exports = {
    addToCart,
    removeFromCart,
    updateCartItem,
    getCart,
};
