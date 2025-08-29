const express = require("express");
const Product = require("../models/Product.js");
const protect = require("../middleware/authMiddleware.js");
const upload = require("../storage/multer.js");
const moment = require("moment");

const productRouter = express.Router();

productRouter.post(
  "/product",
  upload.single("productImage"),
  async (req, res) => {
    console.log("create is hit");

    try {
      const {
        productName,
        productId,
        category,
        price,
        quantity,
        unit,
        expiryDate,
        thresholdValue,
      } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const imageUrl = req.file.path;

      const formattedExpiryDate = moment(expiryDate).format("M/D/YY");

      console.log("formattedExpiryDate: ", formattedExpiryDate);

      const product = new Product({
        productName,
        productId,
        category,
        price,
        quantity,
        unit,
        expiryDate: formattedExpiryDate,
        thresholdValue,
        imageUrl,
      });

      await product.save();

      res.status(201).json({
        message: "Product created successfully",
        product,
      });
    } catch (error) {
      console.error("Error creating product:", error.message);
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
);

productRouter.get("/products", async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = productRouter;
