const express = require("express");
const invoiceRouter = express.Router();
const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const moment = require("moment");

invoiceRouter.post("/invoice", async (req, res) => {
  try {
    const { invoiceId, invoiceDate, dueDate, productId, quantity } = req.body;

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
      amount,
      dueDate: formattedDueDate,
      productId,
      quantity,
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

invoiceRouter.get("/fetch/invoices", async (req, res) => {
  try {
    const invoices = await Invoice.find();

    if (!invoices) {
      return res.status(404).json({ message: "Invoices not found" });
    }

    res
      .status(200)
      .json({ message: "Invoices fetched successfullly", invoices });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch invoices",
      error: error.message,
    });
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

invoiceRouter.patch("/invoice/:id/open", async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.openCount = (invoice.openCount || 0) + 1;
    await invoice.save();

    res.status(200).json({
      message: "Invoice open count incremented",
      invoice,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

invoiceRouter.patch("/invoice/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["Paid"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    let invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (status === "Paid" && !invoice.referenceNumber) {
      const generateReferenceId = async () => {
        let reference;
        let exists = true;

        while (exists) {
          reference =
            "INV-" +
            String(Math.floor(1 + Math.random() * 999)).padStart(3, "0");
          exists = await Invoice.exists({ referenceNumber: reference });
        }

        return reference;
      };

      invoice.referenceNumber = await generateReferenceId();
    }

    invoice.status = status;
    await invoice.save();

    res.status(200).json({
      message: `Invoice status updated to ${status}`,
      invoice: {
        _id: invoice._id,
        status: invoice.status,
        referenceNumber: invoice.referenceNumber,
      },
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Internal server error" });
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
