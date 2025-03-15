const Shop = require("../models/shop.model.js")
const { isValidAddress } = require("../lib/utils.js")
const createShop = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body
        const owner = req.user._id

        if (!name || !email || !phone || !address) {
            return res.status(400).json({ message: "Please fill in all fields" })
        }
        if (!isValidAddress(address)) {
            return res.status(400).json({ message: "Invalid address" })
        }

        const existingShop = await Shop.findOne({ email })

        if (existingShop) {
            return res.status(400).json({ message: "Shop with this email already exists." });
        }
        const shop = new Shop({ name, owner, email, phone, address });
        await shop.save();

        res.status(201).json({ message: "Shop created successfully", shop });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllShops = async (req, res) => {
    try {
        const shops = await Shop.find()
        res.status(200).json(shops)

    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const getShopById = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id)
        if (!shop) return res.status(404).json({ message: "Shop not found" });
        res.status(200).json(shop);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        if (shop.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this shop" });
        }

        await Shop.findByIdAndDelete(req.params.id);
        res.json({ message: "Shop deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}
const updateShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        if (shop.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to update this shop" });
        }

        const updatedShop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Shop updated successfully", updatedShop });
    } catch (error) {
        res.status(500).json({ message:"Internal Server Error" });
    }
};

module.exports = {
    createShop,
    getAllShops,
    getShopById,
    deleteShop,
    updateShop
}