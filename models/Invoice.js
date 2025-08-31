const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: [true, "Invoice ID is required"],
      unique: true,
      trim: true,
    },
    invoiceDate: {
      type: String,
    },
    referenceNumber: {
      type: String,
      required: [true, "Reference Number is required"],
      trim: true,
    },
    amount: {
      type: Number,
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
      required: true,
    },
    dueDate: {
      type: String,
      required: [true, "Due date is required"],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: String,
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
