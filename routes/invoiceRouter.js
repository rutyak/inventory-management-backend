const express = require("express");
const invoiceRouter = express.Router();
const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const moment = require("moment");

invoiceRouter.post("/invoice", async (req, res) => {
  try {
    const {
      invoiceId,
      invoiceDate,
      referenceNumber,
      dueDate,
      productId,
      quantity,
    } = req.body;

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity > productExists.quantity) {
      return res.status(400).json({ message: "Insufficient product quantity" });
    }

    const amount = quantity * productExists.price;

    const formattedDueDate = moment(dueDate).format("DD-MMM-YYYY");
    const formatedInvoiceDate = moment(invoiceDate).format("DD-MMM-YYYY");

    const invoice = new Invoice({
      invoiceId,
      invoiceDate: formatedInvoiceDate,
      referenceNumber,
      amount,
      dueDate: formattedDueDate,
      productId,
      quantity
    });

    productExists.quantity -= quantity;
    await productExists.save();

    await invoice.save();

    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

invoiceRouter.get("/invoices", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      Invoice.find()
        .populate("productId", "productName unit price")
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments(),
    ]);

    res.status(200).json({
      message: "Invoices fetched successfully",
      invoices,
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

invoiceRouter.patch("/invoice/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({
      message: `Invoice status updated to ${status}`,
      invoice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

invoiceRouter.delete("/invoice/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInvoice = await Invoice.findByIdAndDelete(id);

    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({
      message: "Invoice deleted successfully",
      invoice: deletedInvoice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = invoiceRouter;
