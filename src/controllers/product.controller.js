const Product = require("../models/product.model")

const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const getProductsByName = async (req, res) => {
    try {
      const name = req.params.name;
      const products = await Product.find({ name: { $regex: new RegExp(name, "i") } });
  
      if (products.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }
  
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
};

module.exports = {
    getProducts,
    getProductById,
    getProductsByName
}