const express = require("express");
const Product = require("../models/Product.js");
const protect = require("../middleware/authMiddleware.js");
const upload = require("../storage/multer.js");
const uploadCSV = require("../storage/uploadCSV.js");
const fs = require("fs");
const csv = require("csv-parser");
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

productRouter.post(
  "/products/bulk",
  uploadCSV.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const results = [];

      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => {
          results.push({
            productName: data["Product Name"],
            productId: data["Product ID"],
            category: data["Category"],
            price: Number(data["Price"]),
            quantity: Number(data["Quantity"]),
            unit: data["Unit"],
            expiryDate: moment(data["Expiry Date"]).format("M/D/YY"),
            thresholdValue: Number(data["Threshold Value"]),
          });
        })
        .on("end", async () => {
          try {
            for (const row of results) {
              const product = new Product(row);
              await product.save();
            }

            fs.unlinkSync(req.file.path);

            res.status(201).json({
              message: "Products created successfully",
              count: results.length,
            });
          } catch (error) {
            res.status(500).json({
              message: "Error saving products",
              error: error.message,
            });
          }
        });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

productRouter.get("/fetch/products", async (req, res) => {
  try {
    const products = await Product.find();

    if (!products) {
      return res.status(404).json({ message: "Products not found" });
    }

    res
      .status(200)
      .json({ message: "Products fetched successfullly", products });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

productRouter.get("/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    res.status(200).json({
      message: "Products fetched successfully",
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = productRouter;
