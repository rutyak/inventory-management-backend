const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
      unique: [true, "Product name should be unique"],
    },
    productId: {
      type: String,
      required: [true, "Product ID is required"],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
    },
    thresholdValue: {
      type: Number,
      required: [true, "Threshold value is required"],
      min: [0, "Threshold must be >= 0"],
    },
    expiryDate: {
      type: String,
      required: [true, "Expiry date is required"],
    },
    availability: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
    },
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  if (this.quantity === 0) {
    this.availability = "Out of Stock";
  } else if (this.quantity <= this.thresholdValue) {
    this.availability = "Low Stock";
  } else {
    this.availability = "In Stock";
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
