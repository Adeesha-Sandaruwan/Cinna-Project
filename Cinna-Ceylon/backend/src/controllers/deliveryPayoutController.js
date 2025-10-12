// controllers/deliveryPayoutController.js
import DeliveryPayout from "../models/DeliveryPayout.js";
import Maintenance from "../models/maintenance.js";
import Emergency from "../models/emergency.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// CREATE Delivery Payout
// 1. referenceType must be 'Maintenance' or 'Emergency'
// 2. referenceId must exist in corresponding collection
// 3. Other fields validated by Mongoose schema
export const createDeliveryPayout = async (req, res) => {
  try {
    const { referenceType, referenceId, ...payoutData } = req.body;

    // 1. Verify the reference exists (maintenance/emergency)
    let reference;
    if (referenceType === "Maintenance") {
      reference = await Maintenance.findById(referenceId);
    } else if (referenceType === "Emergency") {
      reference = await Emergency.findById(referenceId);
    }

    if (!reference) {
      return res.status(404).json({ message: `${referenceType} record not found` });
    }

    // 2. Create the payout record
    const payout = await DeliveryPayout.create({
      referenceType,
      referenceId,
      ...payoutData
    });

    // 3. Populate reference details for response
    const populatedPayout = await DeliveryPayout.findById(payout._id)
      .populate({
        path: 'referenceId',
        populate: {
          path: 'vehicle',
          select: 'make model licensePlate'
        }
      });

    res.status(201).json(populatedPayout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ all delivery payouts with filtering and pagination
// Filters: referenceType, paymentStatus, payoutDate range
// Returns paginated results with reference details populated
export const getDeliveryPayouts = async (req, res) => {
  try {
    const { 
      referenceType, 
      paymentStatus, 
      startDate, 
      endDate,
      page = 1, 
      limit = 10 
    } = req.query;

    const filter = {};

    if (referenceType) filter.referenceType = referenceType;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      filter.payoutDate = {};
      if (startDate) filter.payoutDate.$gte = new Date(startDate);
      if (endDate) filter.payoutDate.$lte = new Date(endDate);
    }

    // Pagination logic
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination info
    const total = await DeliveryPayout.countDocuments(filter);

    // Get paginated results with reference details
    const payouts = await DeliveryPayout.find(filter)
      .populate({
        path: 'referenceId',
        populate: {
          path: 'vehicle',
          select: 'make model licensePlate'
        }
      })
      .sort({ payoutDate: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      docs: payouts,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ one delivery payout by ID
// Returns payout with reference details populated
export const getDeliveryPayoutById = async (req, res) => {
  try {
    const payout = await DeliveryPayout.findById(req.params.id)
      .populate({
        path: 'referenceId',
        populate: {
          path: 'vehicle',
          select: 'make model licensePlate'
        }
      });

    if (!payout) return res.status(404).json({ message: "Payout not found" });
    res.json(payout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE delivery payout by ID
// Validates and updates payout, returns updated payout with reference details
export const updateDeliveryPayout = async (req, res) => {
  try {
    const payout = await DeliveryPayout.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    )
    .populate({
      path: 'referenceId',
      populate: {
        path: 'vehicle',
        select: 'make model licensePlate'
      }
    });

    if (!payout) return res.status(404).json({ message: "Payout not found" });
    res.json(payout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE delivery payout by ID
// Deletes payout and returns success message
export const deleteDeliveryPayout = async (req, res) => {
  try {
    const payout = await DeliveryPayout.findByIdAndDelete(req.params.id);
    if (!payout) return res.status(404).json({ message: "Payout not found" });
    res.json({ message: "Payout deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available maintenance and emergency records for dropdown
// Used for populating reference selection in frontend
export const getAvailableReferences = async (req, res) => {
  try {
    const { type } = req.query;

    let references = [];

    if (type === 'Maintenance') {
      references = await Maintenance.find({})
      .populate('vehicle', 'make model licensePlate')
      .select('description serviceDate serviceCost vehicle');
    } else if (type === 'Emergency') {
      references = await Emergency.find({})
      .populate('vehicle', 'make model licensePlate')
      .populate('driver', 'name')
      .select('description accidentDate vehicle driver');
    }

    res.json(references);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payout statistics for dashboard
// Aggregates payout counts and amounts by type and status
export const getPayoutStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.payoutDate = {};
      if (startDate) matchStage.payoutDate.$gte = new Date(startDate);
      if (endDate) matchStage.payoutDate.$lte = new Date(endDate);
    }

    const stats = await DeliveryPayout.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            referenceType: "$referenceType",
            paymentStatus: "$paymentStatus"
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $group: {
          _id: "$_id.referenceType",
          statuses: {
            $push: {
              status: "$_id.paymentStatus",
              count: "$count",
              amount: "$totalAmount"
            }
          },
          totalCount: { $sum: "$count" },
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate PDF for Delivery Payout
// Generates a PDF receipt for a delivery payout, including payout and reference details
export const generateDeliveryPayoutPDF = async (req, res) => {
  try {
    const payout = await DeliveryPayout.findById(req.params.id)
      .populate({
        path: 'referenceId',
        populate: {
          path: 'vehicle',
          select: 'make model licensePlate'
        }
      });

    if (!payout) return res.status(404).send("Delivery payout not found");

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
        "Content-Disposition": `attachment; filename=DeliveryPayout_${payout._id}.pdf`
      });
      res.send(pdfData);
    });

    // Background - light green theme
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#F0FFF0");

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
      `DELIVERY PAYOUT RECEIPT - ${new Date(payout.payoutDate).toLocaleDateString()}`,
      40,
      130,
      { align: "center", underline: true }
    );

    // Payout details box
    const detailsTop = 170;
    doc.rect(40, detailsTop, doc.page.width - 80, 80).fill("#D1FFBD");
    doc.fontSize(12).fillColor("#005580").text("PAYOUT DETAILS", 50, detailsTop + 10);
    doc.fontSize(10).fillColor("#333333");

    // Payout Type and Status
    doc.text("Payout Type:", 50, detailsTop + 30);
    doc.text(payout.referenceType, 150, detailsTop + 30);
    doc.text("Payment Status:", 50, detailsTop + 45);
    doc.text(payout.paymentStatus, 150, detailsTop + 45);

    // Approved By
    doc.text("Approved By:", 50, detailsTop + 60);
    doc.text(payout.approvedBy || "N/A", 150, detailsTop + 60);

    // Reference details header
    const referenceTop = detailsTop + 90;
    doc.rect(40, referenceTop, doc.page.width - 80, 30).fill("#007B8A");
    doc.fontSize(12).fillColor("#FFFFFF").text(`${payout.referenceType.toUpperCase()} REFERENCE DETAILS`, 50, referenceTop + 10);

    // Reference details
    const referenceDetailsTop = referenceTop + 40;
    doc.fontSize(10).fillColor("#333333");

    if (payout.referenceType === 'Maintenance' && payout.referenceId) {
      doc.text("Description:", 50, referenceDetailsTop);
      doc.text(payout.referenceId.description || "N/A", 150, referenceDetailsTop);

      doc.text("Service Date:", 50, referenceDetailsTop + 15);
      doc.text(new Date(payout.referenceId.serviceDate).toLocaleDateString(), 150, referenceDetailsTop + 15);

    } else if (payout.referenceType === 'Emergency' && payout.referenceId) {
      doc.text("Description:", 50, referenceDetailsTop);
      doc.text(payout.referenceId.description || "N/A", 150, referenceDetailsTop);

      doc.text("Accident Date:", 50, referenceDetailsTop + 15);
      doc.text(new Date(payout.referenceId.accidentDate).toLocaleDateString(), 150, referenceDetailsTop + 15);

    } else {
      doc.text("No reference details available", 50, referenceDetailsTop);
    }

    // Payment table header
    const tableTop = referenceDetailsTop + 65;
    const colWidth = (doc.page.width - 100) / 2;
    doc.rect(40, tableTop, colWidth, 25).fill("#A2F5A2");
    doc.rect(40 + colWidth, tableTop, colWidth, 25).fill("#A2F5A2");
    doc.fontSize(11).fillColor("#000000");
    doc.text("Particulars", 50, tableTop + 8);
    doc.text("Amount (Rs.)", 40 + colWidth + 10, tableTop + 8);

    // Table rows for payout amount
    const rows = [
      { label: "Payout Amount", value: payout.amount || 0 }
    ];
    let rowY = tableTop + 25;

    rows.forEach((row) => {
      doc.rect(40, rowY, colWidth, 20).fill("#F0FFF0");
      doc.rect(40 + colWidth, rowY, colWidth, 20).fill("#F0FFF0");
      doc.fontSize(10).fillColor("#333333");
      doc.text(row.label, 50, rowY + 5);
      doc.text(row.value.toString(), 40 + colWidth + 10, rowY + 5);
      rowY += 20;
    });

    // Notes section if available
    if (payout.notes) {
      rowY += 10;
      doc.rect(40, rowY, doc.page.width - 80, 40).fill("#F0FFF0");
      doc.fontSize(10).fillColor("#333333");
      doc.text("Notes:", 50, rowY + 5);
      doc.text(payout.notes, 50, rowY + 20, { width: doc.page.width - 100 });
      rowY += 50;
    }

    // Footer note for PDF receipt
    doc.fontSize(10).fillColor("#007B8A").text(
      "This is a system generated delivery payout receipt.",
      40,
      rowY + 20,
      { align: "center" }
    );

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating delivery payout PDF");
  }
};