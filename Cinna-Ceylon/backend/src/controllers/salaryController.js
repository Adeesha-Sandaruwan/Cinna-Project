// Import Salary model
import Salary from "../models/Salary.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { sendEmailWithAttachments } from '../utils/emailSender.js';
import User from '../models/User.js';

// CREATE Salary Record
export const createSalary = async (req, res) => {
  try {
    // Create a new salary document with incoming request data
    const salary = new Salary(req.body);
    // Save data in MongoDB
    await salary.save();
    res.status(201).json(salary); // Respond with created salary
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// READ ALL Salary records
export const getAllSalaries = async (req, res) => {
  try {
    // Fetch all records from Salary collection
    const salaries = await Salary.find();
    res.json(salaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// READ ONE Salary record by ID
export const getSalaryById = async (req, res) => {
  try {
    // Find salary by MongoDB ObjectId
    const salary = await Salary.findById(req.params.id);
    if (!salary) return res.status(404).json({ error: "Salary not found" });
    res.json(salary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE existing Salary record
export const updateSalary = async (req, res) => {
  try {
    // Update salary document based on ID and body data
    const salary = await Salary.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return updated document instead of old one
    });
    if (!salary) return res.status(404).json({ error: "Salary not found" });
    res.json(salary);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE Salary record
export const deleteSalary = async (req, res) => {
  try {
    // Find salary record by ID and remove it
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) return res.status(404).json({ error: "Salary not found" });
    res.json({ message: "Salary deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Send salary payslip by email (protected route expected)
export const sendSalaryEmail = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);
    if (!salary) return res.status(404).json({ error: 'Salary not found' });

    // Resolve user
    let user = null;
    if (salary.Emp_id) {
      user = await User.findById(salary.Emp_id);
    }
    if (!user || !user.email) return res.status(400).json({ error: 'Employee email not found' });

    // Generate PDF in-memory (similar to existing payslip route)
    const companyName = "Cinna-Ceylon";
    const companyAddress = "No. 123, Cinnamon Gardens, Colombo, Sri Lanka";
    const companyPhone = "+94 77 123 4567";
    const companyEmail = "info@cinnaceylon.com";

    const __dirname = path.resolve();
    const logoPath = path.join(__dirname, "frontend/public/cinnamon-bg.jpeg");

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'portrait' });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    const pdfEndPromise = new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);
    });

    // Build PDF content (condensed version)
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FFF9E6');
    doc.fillColor('#333333');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 40, { width: 70 });
      doc.fontSize(18).fillColor('#8B4513').text(companyName, 120, 45);
    } else {
      doc.fontSize(18).fillColor('#8B4513').text(companyName, 40, 45);
    }
    doc.fontSize(10).fillColor('#333333');
    doc.text(companyAddress, 40, 70);
    doc.text(`Phone: ${companyPhone}`, 40, 85);
    doc.text(`Email: ${companyEmail}`, 40, 100);

    const titleY = 130;
    doc.fontSize(16).fillColor('#8B0000').text(`PAY SLIP FOR THE MONTH OF ${salary.Month?.toUpperCase() || ''}`, 40, titleY, { align: 'center' });

    const employeeDetailsTop = titleY + 30;
    doc.rect(40, employeeDetailsTop, doc.page.width - 80, 80).fill('#FFE4B5');
    doc.fontSize(12).fillColor('#8B0000').text('EMPLOYEE DETAILS', 50, employeeDetailsTop + 10);
    doc.fontSize(10).fillColor('#333333');

    const col1 = 50; const col2 = 250;
    doc.text('Employee ID:', col1, employeeDetailsTop + 35);
    doc.text(salary.Emp_id?.toString() || 'N/A', col2, employeeDetailsTop + 35);
    doc.text('Employee Name:', col1, employeeDetailsTop + 55);
    doc.text(user.username || 'N/A', col2, employeeDetailsTop + 55);
    doc.text('Position:', col1, employeeDetailsTop + 75);
    doc.text(user.role || user.userType || 'N/A', col2, employeeDetailsTop + 75);

    // Salary details simplified
    const salaryDetailsTop = employeeDetailsTop + 90;
    doc.rect(40, salaryDetailsTop, doc.page.width - 80, 30).fill('#8B0000');
    doc.fontSize(12).fillColor('#FFFFFF').text('SALARY DETAILS', 50, salaryDetailsTop + 10);

    const tableTop = salaryDetailsTop + 40;
    const colWidth = (doc.page.width - 100) / 2;
    doc.fontSize(11).fillColor('#000000');
    doc.text('Particulars', 50, tableTop + 8);
    doc.text('Amount (Rs.)', 40 + colWidth + 10, tableTop + 8);

    const earnings = [
      { label: 'Base Salary', value: salary.Base_Salary || 0 },
      { label: 'Bonus', value: salary.Bonus || 0 },
      { label: 'Overtime', value: salary.Overtime || 0 }
    ];
    let currentY = tableTop + 25;
    earnings.forEach((row, index) => {
      const bgColor = index % 2 === 0 ? '#FFF5E1' : '#FFEFD5';
      doc.rect(40, currentY, colWidth, 25).fill(bgColor);
      doc.rect(40 + colWidth, currentY, colWidth, 25).fill(bgColor);
      doc.fontSize(10).fillColor('#333333');
      doc.text(row.label, 50, currentY + 8);
      doc.text((row.value || 0).toFixed ? (row.value || 0).toFixed(2) : String(row.value), 40 + colWidth + 10, currentY + 8);
      currentY += 25;
    });

    const totalEarnings = earnings.reduce((s, r) => s + (parseFloat(r.value) || 0), 0);
    doc.rect(40, currentY, colWidth, 25).fill('#FFD700');
    doc.rect(40 + colWidth, currentY, colWidth, 25).fill('#FFD700');
    doc.fontSize(11).fillColor('#8B0000');
    doc.text('TOTAL EARNINGS', 50, currentY + 8);
    doc.text(totalEarnings.toFixed(2), 40 + colWidth + 10, currentY + 8);
    currentY += 30;

    const deductions = [
      { label: 'Tax', value: salary.Tax || 0 },
      { label: 'EPF', value: salary.EPF || 0 },
      { label: 'ETF', value: salary.ETF || 0 },
      { label: 'Leave Deduction', value: salary.Leave_Deduction || 0 }
    ];
    // Deductions rows
    deductions.forEach((deduction, index) => {
      if (currentY > doc.page.height - 100) { doc.addPage(); currentY = 40; }
      const bgColor = index % 2 === 0 ? '#FFF5E1' : '#FFEFD5';
      doc.rect(40, currentY, colWidth, 25).fill(bgColor);
      doc.rect(40 + colWidth, currentY, colWidth, 25).fill(bgColor);
      doc.fontSize(10).fillColor('#333333');
      doc.text(deduction.label, 50, currentY + 8);
      doc.text((deduction.value || 0).toFixed(2), 40 + colWidth + 10, currentY + 8);
      currentY += 25;
    });

    const totalDeductions = deductions.reduce((s, d) => s + (parseFloat(d.value) || 0), 0);
    if (currentY > doc.page.height - 100) { doc.addPage(); currentY = 40; }
    doc.rect(40, currentY, colWidth, 25).fill('#CD5C5C');
    doc.rect(40 + colWidth, currentY, colWidth, 25).fill('#CD5C5C');
    doc.fontSize(11).fillColor('#FFFFFF');
    doc.text('TOTAL DEDUCTIONS', 50, currentY + 8);
    doc.text(totalDeductions.toFixed(2), 40 + colWidth + 10, currentY + 8);
    currentY += 30;

    if (currentY > doc.page.height - 100) { doc.addPage(); currentY = 40; }
    const netSalary = totalEarnings - totalDeductions;
    doc.rect(40, currentY, colWidth, 25).fill('#32CD32');
    doc.rect(40 + colWidth, currentY, colWidth, 25).fill('#32CD32');
    doc.fontSize(11).fillColor('#000000');
    doc.text('NET SALARY', 50, currentY + 8);
    doc.text(netSalary.toFixed(2), 40 + colWidth + 10, currentY + 8);

    doc.fontSize(9).fillColor('#666666').text('This is a system-generated pay slip. No signature is required.', 40, doc.page.height - 40, { align: 'center' });

    doc.end();
    const pdfBuffer = await pdfEndPromise;

    // Send email with attachment
    const subject = `Payslip - ${salary.Month || 'Salary'}`;
    const html = `<p>Dear ${user.username || 'Employee'},</p>
      <p>Please find attached your payslip for <strong>${salary.Month || ''}</strong>.</p>
      <p>If you have any questions, contact HR.</p>
      <p>Regards,<br/>Cinna Ceylon</p>`;

    const attachments = [{ filename: `PaySlip_${salary._id}.pdf`, content: pdfBuffer }];
    const result = await sendEmailWithAttachments(user.email, subject, html, attachments);
    if (!result.success) return res.status(500).json({ error: 'Failed to send email', details: result.error || result });

    return res.json({ success: true, message: 'Email sent', info: result });
  } catch (err) {
    console.error('sendSalaryEmail error:', err);
    res.status(500).json({ error: err.message });
  }
};
