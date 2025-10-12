import SupPayment from "../models/SupPayment.js";
import User from "../models/User.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { sendEmailWithAttachments } from '../utils/emailSender.js';

// Create a new Supplier Payment
// 1. Supplier selection required
// 2. Supplier must exist
// 3. Date required, valid format, not in future, not before this month
// 4. Amount required, must be positive number, up to 2 decimals
// --- Calculation Logic ---
// Tax and Net_Payment are calculated on frontend
export const createSupplierPayment = async (req, res) => {
  try {
    const { Sup_id, Date: paymentDate, Amount, Tax, Net_Payment } = req.body;

    // 1. Supplier selection required
    if (!Sup_id) {
      return res.status(400).json({ error: "Supplier selection is required" });
    }

    // 2. Validate supplier exists and is a supplier
    const supplier = await User.findById(Sup_id);
    if (!supplier) {
      return res.status(400).json({ error: "Invalid supplier ID" });
    }
    if (supplier.userType !== 'supplier') {
      return res.status(400).json({ error: "Selected user is not a supplier" });
    }

    // 3. Date validation
    if (!paymentDate) {
      return res.status(400).json({ error: "Date is required" });
    }
    if (isNaN(Date.parse(paymentDate))) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    const selectedDate = new Date(paymentDate);
    const today = new Date();
    if (selectedDate > today) {
      return res.status(400).json({ error: "Future dates are not allowed" });
    }
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (selectedDate < firstOfMonth) {
      return res.status(400).json({ error: "Date cannot be before this month" });
    }

    // 4. Amount validation
    if (!Amount || isNaN(Amount) || Number(Amount) <= 0) {
      return res.status(400).json({ error: "Amount must be a number greater than 0" });
    }
    if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(Amount)) {
      return res.status(400).json({ error: "Amount must be a valid number (no text, symbols, or -)" });
    }

    // Create payment
    const payment = new SupPayment({
      Sup_id,
      Date: paymentDate,
      Amount,
      Tax,
      Net_Payment
    });

    await payment.save();

    // Populate supplier details for response
    await payment.populate('Sup_id', 'username email');

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all Supplier Payments
// Returns all supplier payments, most recent first, with supplier details populated
export const getAllSupplierPayments = async (req, res) => {
  try {
    const payments = await SupPayment.find()
      .populate("Sup_id", "username email")
      .sort({ Date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Supplier Payment by ID
// Returns a single supplier payment with supplier details populated
export const getSupplierPaymentById = async (req, res) => {
  try {
    const payment = await SupPayment.findById(req.params.id)
      .populate("Sup_id", "name contact email address");

    if (!payment) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Supplier Payment
// Validates supplier ID if changed, updates payment, returns updated payment with supplier details
export const updateSupplierPayment = async (req, res) => {
  try {
    if (req.body.Sup_id) {
      const supplier = await User.findById(req.body.Sup_id);
      if (!supplier) {
        return res.status(400).json({ error: "Invalid supplier ID" });
      }
      if (supplier.userType !== 'supplier') {
        return res.status(400).json({ error: "Selected user is not a supplier" });
      }
    }
    const payment = await SupPayment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('Sup_id', 'username email');

    if (!payment) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Supplier Payment
// Deletes a supplier payment by ID, returns success message
export const deleteSupplierPayment = async (req, res) => {
  try {
    const payment = await SupPayment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate PDF for Supplier Payment
// Generates a PDF receipt for a supplier payment, including supplier and payment details
export const generateSupplierPaymentPDF = async (req, res) => {
  try {
    const payment = await SupPayment.findById(req.params.id)
      .populate("Sup_id", "username email");

    if (!payment) {
      return res.status(404).send("Supplier payment not found");
    }

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

    // Background color for PDF
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#E6F7FF");

    // Header with company info and logo
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

    // Title for PDF receipt
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
  doc.text(payment.Sup_id?.username || "N/A", 150, detailsTop + 30);
  doc.text("Contact:", 50, detailsTop + 45);
  doc.text(payment.Sup_id?.email || "N/A", 150, detailsTop + 45);

    // Payment details header
    const paymentTop = detailsTop + 70;
    doc.rect(40, paymentTop, doc.page.width - 80, 30).fill("#007B8A");
    doc.fontSize(12).fillColor("#FFFFFF").text("PAYMENT DETAILS", 50, paymentTop + 10);

    // Table header for payment details
    const tableTop = paymentTop + 40;
    const colWidth = (doc.page.width - 100) / 2;
    doc.rect(40, tableTop, colWidth, 25).fill("#80D4FF");
    doc.rect(40 + colWidth, tableTop, colWidth, 25).fill("#80D4FF");
    doc.fontSize(11).fillColor("#000000");
    doc.text("Particulars", 50, tableTop + 8);
    doc.text("Amount (Rs.)", 40 + colWidth + 10, tableTop + 8);

    // Table rows for Amount, Tax, Net Payment
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

    // Footer note for PDF receipt
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

// Send supplier payment PDF as email to supplier
export const sendSupplierPaymentEmail = async (req, res) => {
  try {
    const payment = await SupPayment.findById(req.params.id).populate("Sup_id", "username email");
    if (!payment) return res.status(404).json({ error: "Supplier payment not found" });
    if (!payment.Sup_id || !payment.Sup_id.email) return res.status(400).json({ error: "Supplier email not found" });

    // Generate PDF in-memory (reuse logic from generateSupplierPaymentPDF)
    const companyName = "Cinna-Ceylon";
    const companyAddress = "No. 123, Cinnamon Gardens, Colombo, Sri Lanka";
    const companyPhone = "+94 77 123 4567";
    const companyEmail = "info@cinnaceylon.com";

    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "portrait" });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    const pdfEndPromise = new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);
    });

    // Background color for PDF
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#E6F7FF");

    // Header with company info and logo
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
    doc.text(payment.Sup_id?.username || "N/A", 150, detailsTop + 30);
    doc.text("Contact:", 50, detailsTop + 45);
    doc.text(payment.Sup_id?.email || "N/A", 150, detailsTop + 45);

    // Payment details header
    const paymentTop = detailsTop + 70;
    doc.rect(40, paymentTop, doc.page.width - 80, 30).fill("#007B8A");
    doc.fontSize(12).fillColor("#FFFFFF").text("PAYMENT DETAILS", 50, paymentTop + 10);

    // Table header for payment details
    const tableTop = paymentTop + 40;
    const colWidth = (doc.page.width - 100) / 2;
    doc.rect(40, tableTop, colWidth, 25).fill("#80D4FF");
    doc.rect(40 + colWidth, tableTop, colWidth, 25).fill("#80D4FF");
    doc.fontSize(11).fillColor("#000000");
    doc.text("Particulars", 50, tableTop + 8);
    doc.text("Amount (Rs.)", 40 + colWidth + 10, tableTop + 8);

    // Table rows for Amount, Tax, Net Payment
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
    const pdfBuffer = await pdfEndPromise;

    // Email content
    const subject = `Supplier Payment Receipt - ${new Date(payment.Date).toLocaleDateString()}`;
    const html = `<p>Dear ${payment.Sup_id?.username || 'Supplier'},</p>
      <p>Please find attached your supplier payment receipt for <strong>${new Date(payment.Date).toLocaleDateString()}</strong>.</p>
      <p>If you have any questions, contact our finance team.</p>
      <p>Regards,<br/>Cinna Ceylon</p>`;
    const attachments = [{ filename: `SupplierPayment_${payment._id}.pdf`, content: pdfBuffer }];
    const result = await sendEmailWithAttachments(payment.Sup_id.email, subject, html, attachments);
    if (!result.success) return res.status(500).json({ error: 'Failed to send email', details: result.error || result });
    return res.json({ success: true, message: 'Email sent', info: result });
  } catch (err) {
    console.error('sendSupplierPaymentEmail error:', err);
    res.status(500).json({ error: err.message });
  }
};
