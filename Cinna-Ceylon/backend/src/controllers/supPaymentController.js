// controllers/supPaymentController.js
import SupPayment from "../models/SupPayment.js";
import Supplier from "../models/Supplier.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Create a new Supplier Payment
export const createSupplierPayment = async (req, res) => {
  try {
    const { Sup_id, Date, Amount, Tax, Net_Payment } = req.body;
    
    // Validate required fields
    if (!Amount || Amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }
    
    if (!Date) {
      return res.status(400).json({ error: "Date is required" });
    }
    
    // Validate supplier exists if provided
    if (Sup_id) {
      const supplier = await Supplier.findById(Sup_id);
      if (!supplier) {
        return res.status(400).json({ error: "Invalid supplier ID" });
      }
    }
    
    const payment = new SupPayment({
      Sup_id: Sup_id || null,
      Date: Date,
      Amount,
      Tax,
      Net_Payment
    });
    
    await payment.save();
    
    // Populate supplier details for response
    await payment.populate('Sup_id', 'name contact email address');
    
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all Supplier Payments
export const getAllSupplierPayments = async (req, res) => {
  try {
    const payments = await SupPayment.find()
      .populate("Sup_id", "name contact email address")
      .sort({ Date: -1 });
      
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Supplier Payment by ID
export const getSupplierPaymentById = async (req, res) => {
  try {
    const payment = await SupPayment.findById(req.params.id)
      .populate("Sup_id", "name contact email address");

    if (!payment) return res.status(404).json({ error: "Not found" });

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Supplier Payment
export const updateSupplierPayment = async (req, res) => {
  try {
    // Validate supplier exists if provided
    if (req.body.Sup_id) {
      const supplier = await Supplier.findById(req.body.Sup_id);
      if (!supplier) {
        return res.status(400).json({ error: "Invalid supplier ID" });
      }
    }
    
    const payment = await SupPayment.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true, runValidators: true }
    ).populate('Sup_id', 'name contact email address');

    if (!payment) return res.status(404).json({ error: "Not found" });

    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Supplier Payment
export const deleteSupplierPayment = async (req, res) => {
  try {
    const payment = await SupPayment.findByIdAndDelete(req.params.id);

    if (!payment) return res.status(404).json({ error: "Not found" });

    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate PDF for Supplier Payment
export const generateSupplierPaymentPDF = async (req, res) => {
  try {
    const payment = await SupPayment.findById(req.params.id)
      .populate("Sup_id", "name contact email address");
      
    if (!payment) return res.status(404).send("Supplier payment not found");

    const companyName = "Cinna-Ceylon";
    const companyAddress = "No. 123, Cinnamon Gardens, Colombo, Sri Lanka";
    const companyPhone = "+94 77 123 4567";
    const companyEmail = "info@cinnaceylon.com";

    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "portrait" });
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      let pdfData = Buffer.concat(buffers);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=SupplierPayment_${payment._id}.pdf`
      });
      res.send(pdfData);
    });

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#E6F7FF");

    // Header
    const __dirname = path.resolve();
    const logoPath = path.join(__dirname, "frontend/public/cinnamon-bg.jpeg");
    
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 40, { width: 70 });
      doc.fontSize(18).fillColor("#007B8A").text(companyName, 120, 45);
    } else {
      doc.fontSize(18).fillColor("#007B8A").text(companyName, 40, 45);
    }
    
    doc.fontSize(10).fillColor("#333333");
    doc.text(companyAddress, 40, 70);
    doc.text(`Phone: ${companyPhone}`, 40, 85);
    doc.text(`Email: ${companyEmail}`, 40, 100);

    // Title
    doc.fontSize(16).fillColor("#005580").text(
      `SUPPLIER PAYMENT RECEIPT - ${new Date(payment.Date).toLocaleDateString()}`,
      40,
      130,
      { align: "center", underline: true }
    );

    // Supplier details box
    const detailsTop = 170;
    doc.rect(40, detailsTop, doc.page.width - 80, 60).fill("#B3E0FF");
    doc.fontSize(12).fillColor("#005580").text("SUPPLIER DETAILS", 50, detailsTop + 10);
    doc.fontSize(10).fillColor("#333333");
    doc.text("Supplier Name:", 50, detailsTop + 30);
    doc.text(payment.Sup_id?.name || "N/A", 150, detailsTop + 30);
    doc.text("Contact:", 50, detailsTop + 45);
    doc.text(payment.Sup_id?.contact || "N/A", 150, detailsTop + 45);

    // Payment details header
    const paymentTop = detailsTop + 70;
    doc.rect(40, paymentTop, doc.page.width - 80, 30).fill("#007B8A");
    doc.fontSize(12).fillColor("#FFFFFF").text("PAYMENT DETAILS", 50, paymentTop + 10);

    // Table header
    const tableTop = paymentTop + 40;
    const colWidth = (doc.page.width - 100) / 2;
    doc.rect(40, tableTop, colWidth, 25).fill("#80D4FF");
    doc.rect(40 + colWidth, tableTop, colWidth, 25).fill("#80D4FF");
    doc.fontSize(11).fillColor("#000000");
    doc.text("Particulars", 50, tableTop + 8);
    doc.text("Amount (Rs.)", 40 + colWidth + 10, tableTop + 8);

    // Table rows
    const rows = [
      { label: "Amount", value: payment.Amount || 0 },
      { label: "Tax", value: payment.Tax || 0 },
      { label: "Net Payment", value: payment.Net_Payment || 0 }
    ];
    let rowY = tableTop + 25;
    
    rows.forEach((row) => {
      doc.rect(40, rowY, colWidth, 20).fill("#E6F7FF");
      doc.rect(40 + colWidth, rowY, colWidth, 20).fill("#E6F7FF");
      doc.fontSize(10).fillColor("#333333");
      doc.text(row.label, 50, rowY + 5);
      doc.text(row.value.toString(), 40 + colWidth + 10, rowY + 5);
      rowY += 20;
    });

    // Payment date row
    doc.rect(40, rowY, colWidth, 20).fill("#E6F7FF");
    doc.rect(40 + colWidth, rowY, colWidth, 20).fill("#E6F7FF");
    doc.fontSize(10).fillColor("#333333");
    doc.text("Payment Date", 50, rowY + 5);
    doc.text(new Date(payment.Date).toLocaleDateString(), 40 + colWidth + 10, rowY + 5);
    rowY += 30;

    doc.fontSize(10).fillColor("#007B8A").text(
      "This is a system generated supplier payment receipt.",
      40,
      rowY + 20,
      { align: "center" }
    );

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating supplier payment PDF");
  }
};