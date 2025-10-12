import express from "express";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import {
  createSalary,
  getAllSalaries,
  getSalaryById,
  updateSalary,
  deleteSalary
  ,
  sendSalaryEmail
} from "../controllers/salaryController.js";
import Salary from "../models/Salary.js";

const router = express.Router();

// Create Salary
router.post("/", createSalary);

// Get All
router.get("/", getAllSalaries);

// Generate Pay Slip PDF
router.get("/:id/payslip", async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);
    if (!salary) return res.status(404).send("Salary record not found");

    const companyName = "Cinna-Ceylon";
    const companyAddress = "No. 123, Cinnamon Gardens, Colombo, Sri Lanka";
    const companyPhone = "+94 77 123 4567";
    const companyEmail = "info@cinnaceylon.com";

    const __dirname = path.resolve();
    const logoPath = path.join(__dirname, "frontend/public/cinnamon-bg.jpeg");

    const doc = new PDFDocument({ 
      margin: 40,
      size: 'A4',
      layout: 'portrait'
    });
    
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      let pdfData = Buffer.concat(buffers);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="PaySlip_${salary._id}.pdf"`,
      });
      res.send(pdfData);
    });

    // Add background color
    doc.rect(0, 0, doc.page.width, doc.page.height)
       .fill("#FFF9E6"); // Light yellow background

    // Header section with company info
    doc.fillColor("#333333"); // Dark text
    
    // Logo (optional)
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 40, { width: 70 });
      doc.fontSize(18).fillColor("#8B4513").text(companyName, 120, 45);
    } else {
      doc.fontSize(18).fillColor("#8B4513").text(companyName, 40, 45);
    }
    
    doc.fontSize(10).fillColor("#333333");
    doc.text(companyAddress, 40, 70);
    doc.text(`Phone: ${companyPhone}`, 40, 85);
    doc.text(`Email: ${companyEmail}`, 40, 100);
    
    // Pay slip title - using absolute positioning instead of moveDown
    const titleY = 130; // Fixed position for title
    doc.fontSize(16).fillColor("#8B0000").text(`PAY SLIP FOR THE MONTH OF ${salary.Month.toUpperCase()}`, 40, titleY, {
      align: "center",
      underline: true
    });
    
    // Employee details section
    const employeeDetailsTop = titleY + 30;
    doc.rect(40, employeeDetailsTop, doc.page.width - 80, 80)
       .fill("#FFE4B5"); // Light orange background
       
    doc.fontSize(12).fillColor("#8B0000").text("EMPLOYEE DETAILS", 50, employeeDetailsTop + 10);
    doc.fontSize(10).fillColor("#333333");
    
    // Employee details in two columns
    const col1 = 50;
    const col2 = 250;
    
    doc.text("Employee ID:", col1, employeeDetailsTop + 35);
doc.text(salary.Emp_id || "N/A", col2, employeeDetailsTop + 35);
// Find user by Emp_id
let employeeName = "N/A";
let employeePosition = "N/A";
try {
  const User = (await import('../models/User.js')).default;
  const user = await User.findById(salary.Emp_id);
  if (user) {
    employeeName = user.username;
    employeePosition = user.role || user.userType;
  }
} catch (err) {}
doc.text("Employee Name:", col1, employeeDetailsTop + 55);
doc.text(employeeName, col2, employeeDetailsTop + 55);
doc.text("Position:", col1, employeeDetailsTop + 75);
doc.text(employeePosition, col2, employeeDetailsTop + 75);
    
    // Salary details section
    const salaryDetailsTop = employeeDetailsTop + 90;
    doc.rect(40, salaryDetailsTop, doc.page.width - 80, 30)
       .fill("#8B0000"); // Dark red background
       
    doc.fontSize(12).fillColor("#FFFFFF").text("SALARY DETAILS", 50, salaryDetailsTop + 10);
    
    // Salary particulars table
    const tableTop = salaryDetailsTop + 40;
    const colWidth = (doc.page.width - 100) / 2;
    
    // Table header
    doc.rect(40, tableTop, colWidth, 25).fill("#DAA520"); // Golden background
    doc.rect(40 + colWidth, tableTop, colWidth, 25).fill("#DAA520");
    
    doc.fontSize(11).fillColor("#000000");
    doc.text("Particulars", 50, tableTop + 8);
    doc.text("Amount (Rs.)", 40 + colWidth + 10, tableTop + 8);
    
    // Table rows - Earnings
    const earnings = [
      { label: "Base Salary", value: salary.Base_Salary || 0 },
      { label: "Bonus", value: salary.Bonus || 0 },
      { label: "Overtime", value: salary.Overtime || 0 }
    ];
    
    let currentY = tableTop + 25;
    
    earnings.forEach((row, index) => {
      const bgColor = index % 2 === 0 ? "#FFF5E1" : "#FFEFD5";
      
      doc.rect(40, currentY, colWidth, 25).fill(bgColor);
      doc.rect(40 + colWidth, currentY, colWidth, 25).fill(bgColor);
      
      doc.fontSize(10).fillColor("#333333");
      doc.text(row.label, 50, currentY + 8);
      doc.text(row.value.toFixed(2), 40 + colWidth + 10, currentY + 8);
      
      currentY += 25;
    });
    
    // Earnings total
    const totalEarnings = earnings.reduce((sum, row) => sum + row.value, 0);
    
    doc.rect(40, currentY, colWidth, 25).fill("#FFD700"); // Gold background
    doc.rect(40 + colWidth, currentY, colWidth, 25).fill("#FFD700");
    
    doc.fontSize(11).fillColor("#8B0000");
    doc.text("TOTAL EARNINGS", 50, currentY + 8);
    doc.text(totalEarnings.toFixed(2), 40 + colWidth + 10, currentY + 8);
    
    currentY += 30;
    
    // Check if we're approaching page bottom
    if (currentY > doc.page.height - 150) {
      doc.addPage();
      currentY = 40;
    }
    
    // Deductions header
    doc.rect(40, currentY, colWidth, 25).fill("#8B0000"); // Dark red background
    doc.rect(40 + colWidth, currentY, colWidth, 25).fill("#8B0000");
    
    doc.fontSize(11).fillColor("#FFFFFF");
    doc.text("DEDUCTIONS", 50, currentY + 8);
    doc.text("Amount (Rs.)", 40 + colWidth + 10, currentY + 8);
    
    currentY += 25;
    
    // Deductions rows
    const deductions = [
      { label: "Tax", value: salary.Tax || 0 },
      { label: "EPF", value: salary.EPF || 0 },
      { label: "ETF", value: salary.ETF || 0 },
      { label: "Leave Deduction", value: salary.Leave_Deduction || 0 }
    ];
    
    deductions.forEach((deduction, index) => {
      // Check if we need a new page
      if (currentY > doc.page.height - 100) {
        doc.addPage();
        currentY = 40;
      }
      
      const bgColor = index % 2 === 0 ? "#FFF5E1" : "#FFEFD5";
      
      doc.rect(40, currentY, colWidth, 25).fill(bgColor);
      doc.rect(40 + colWidth, currentY, colWidth, 25).fill(bgColor);
      
      doc.fontSize(10).fillColor("#333333");
      doc.text(deduction.label, 50, currentY + 8);
      doc.text(deduction.value.toFixed(2), 40 + colWidth + 10, currentY + 8);
      
      currentY += 25;
    });
    
    // Deductions total
    const totalDeductions = deductions.reduce((sum, deduction) => sum + deduction.value, 0);
    
    // Check if we need a new page
    if (currentY > doc.page.height - 100) {
      doc.addPage();
      currentY = 40;
    }
    
    doc.rect(40, currentY, colWidth, 25).fill("#CD5C5C"); // Indian red background
    doc.rect(40 + colWidth, currentY, colWidth, 25).fill("#CD5C5C");
    
    doc.fontSize(11).fillColor("#FFFFFF");
    doc.text("TOTAL DEDUCTIONS", 50, currentY + 8);
    doc.text(totalDeductions.toFixed(2), 40 + colWidth + 10, currentY + 8);
    
    currentY += 30;
    
    // NET SALARY row
    // Check if we need a new page
    if (currentY > doc.page.height - 100) {
      doc.addPage();
      currentY = 40;
    }
    
    const netSalary = totalEarnings - totalDeductions;
    
    doc.rect(40, currentY, colWidth, 25).fill("#32CD32"); // Lime green background
    doc.rect(40 + colWidth, currentY, colWidth, 25).fill("#32CD32");
    
    doc.fontSize(11).fillColor("#000000");
    doc.text("NET SALARY", 50, currentY + 8);
    doc.text(netSalary.toFixed(2), 40 + colWidth + 10, currentY + 8);
    
    // Additional details section
    const detailsTop = currentY + 40;
    
    // Check if we need a new page for additional details
    if (detailsTop > doc.page.height - 100) {
      doc.addPage();
      currentY = 40;
    } else {
      currentY = detailsTop;
    }
    
    doc.fontSize(10).fillColor("#333333");
    doc.text("ADDITIONAL DETAILS:", 40, currentY);
    
    const additionalDetails = [
      { label: "OT Type", value: salary.OT_Type === "weekend_holiday" ? "Weekend/Holiday" : "Weekday" },
      { label: "OT Hours", value: salary.OT_Hours || 0 },
      { label: "Leave Type", value: salary.Leave_Type === "no_pay" ? "No Pay" : "Full Pay" },
      { label: "No Pay Leave Days", value: salary.No_Pay_Leave_Days || 0 }
    ];
    
    additionalDetails.forEach((detail, index) => {
      const yPos = currentY + 20 + (index * 15);
      // Check if we need a new page
      if (yPos > doc.page.height - 40) {
        doc.addPage();
        currentY = 40;
        doc.fontSize(10).fillColor("#333333");
      }
      doc.text(`${detail.label}: ${detail.value}`, 40, yPos);
    });
    
    // Footer note
    const footerY = doc.page.height - 40;
    doc.fontSize(9).fillColor("#666666")
       .text("This is a system-generated pay slip. No signature is required.", 
             40, footerY, { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Error generating pay slip:", error);
    res.status(500).send("Error generating pay slip");
  }
});

// Send payslip via email (protected)
import auth from '../middleware/auth.js';
router.post('/:id/send-email', auth, sendSalaryEmail);

// Get One
router.get("/:id", getSalaryById);

// Update
router.put("/:id", updateSalary);

// Delete
router.delete("/:id", deleteSalary);

export default router;