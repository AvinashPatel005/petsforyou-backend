const express = require("express")
const router = express.Router()
const {getProducts,getProductById,getProductsByName} = require("../controllers/product.controller.js")


router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/search/:name",getProductsByName)


module.exports = router