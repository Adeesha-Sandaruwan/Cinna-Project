import express from 'express';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
const router = express.Router();

// Get all attendance records (optionally filter by user, date, etc.)
router.get('/', async (req, res) => {
  try {
    const records = await Attendance.find().populate('user', 'username email profile');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance', error: err.message });
  }
});

// Generate attendance report as PDF
router.get('/report', async (req, res) => {
  try {
    const records = await Attendance.find().populate('user', 'username email profile');

  // Create PDF doc (buffer pages so we can add page numbers)
  const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.pdf');
    doc.pipe(res);

    // Helper constants
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    // columns: username, email, name, date, role, status
    const colWidths = [0.14, 0.28, 0.18, 0.2, 0.12, 0.08].map(p => Math.floor(p * pageWidth));
    const tableTopStart = 160; // start y after header
    const rowHeight = 22;

    // Determine logo path (look in frontend/public for assets)
    const __dirname = path.resolve();
    const candidate1 = path.join(__dirname, 'frontend', 'public', 'cinnamon-bg.jpeg');
    const candidate2 = path.join(__dirname, 'frontend', 'public', 'logo.png');
    const logoPath = fs.existsSync(candidate1) ? candidate1 : (fs.existsSync(candidate2) ? candidate2 : null);

    // Cinnamon-themed colors
    const CINNAMON = '#8B4513'; // saddle brown
    const CINNAMON_ACCENT = '#CC7722'; // lighter cinnamon
    const PAPER_BG = '#FFF9F2'; // warm off-white

    // Draw branded header (Cinna Ceylon themed)
    const drawHeader = () => {
      // subtle page background top strip
      doc.rect(0, 0, doc.page.width, 120).fill(PAPER_BG);

      // Optional logo on the left
      if (logoPath && fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, doc.page.margins.left, 20, { width: 70 });
        } catch (e) {
          // ignore image errors and continue
        }
      }

      // Company name & tagline
      const titleX = logoPath ? doc.page.margins.left + 90 : doc.page.margins.left;
      doc.fillColor(CINNAMON).font('Helvetica-Bold').fontSize(20).text('Cinna Ceylon', titleX, 30);
      doc.font('Helvetica').fontSize(9).fillColor('#4b5563').text('Premium Ceylon Cinnamon & Natural Products', titleX, 55);

      // Right side: report meta
      const metaX = doc.page.width - doc.page.margins.right - 220;
      doc.font('Helvetica-Bold').fontSize(12).fillColor(CINNAMON_ACCENT).text('Attendance Report', metaX, 30, { align: 'right' });
      doc.font('Helvetica').fontSize(8).fillColor('#6b7280').text(`Generated: ${new Date().toLocaleString()}`, metaX, 50, { align: 'right' });
      doc.font('Helvetica').fontSize(8).fillColor('#6b7280').text('info@cinnaceylon.com | www.cinnaceylon.com', metaX, 64, { align: 'right' });

      // Reset fill color for body
      doc.fillColor('#111827');
    };

    // Footer with page numbers and contact
    const drawFooter = (pageNumber, totalPages) => {
      const footerY = doc.page.height - 40;
      doc.font('Helvetica').fontSize(8).fillColor('#6b7280');
      doc.text('Cinna Ceylon — Crafted in Sri Lanka', doc.page.margins.left, footerY, { align: 'left' });
      doc.text(`Page ${pageNumber} of ${totalPages}`, -doc.page.margins.right, footerY, { align: 'right' });
    };

    // Draw table header
    const drawTableHeader = (y) => {
      let x = doc.page.margins.left;
      // header background
      doc.rect(x - 5, y - 6, pageWidth + 10, rowHeight + 8).fill('#f3f4f6');
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10);
      const headers = ['Username', 'Email', 'Name', 'Date', 'Role', 'Status'];
      headers.forEach((h, i) => {
        doc.text(h, x + 4, y, { width: colWidths[i] - 8, align: 'left' });
        x += colWidths[i];
      });
    };

    // Prepare pages: draw header on first page
    drawHeader();

    // Where the table body starts
    let y = tableTopStart;
    drawTableHeader(y);
    y += rowHeight + 6;

    // Draw rows with alternating background
    records.forEach((r, idx) => {
      const cols = [r.user?.username || '', r.user?.email || '', r.user?.profile?.name || '', new Date(r.date).toLocaleString(), r.role || '', r.status || ''];

      // If not enough space for next row, add new page and redraw header & table header
      if (y + rowHeight + 60 > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        drawHeader();
        y = tableTopStart;
        drawTableHeader(y);
        y += rowHeight + 6;
      }

      // alternating row background
      if (idx % 2 === 0) {
        doc.rect(doc.page.margins.left - 5, y - 4, pageWidth + 10, rowHeight + 4).fill('#ffffff');
      } else {
        doc.rect(doc.page.margins.left - 5, y - 4, pageWidth + 10, rowHeight + 4).fill('#fbfbfd');
      }

      // write columns
      doc.fillColor('#111827').font('Helvetica').fontSize(9);
      let x = doc.page.margins.left;
      cols.forEach((c, i) => {
        doc.text(String(c), x + 4, y, { width: colWidths[i] - 8, align: 'left' });
        x += colWidths[i];
      });

      y += rowHeight + 6;
    });

    // Add page numbers to each page
    const range = doc.bufferedPageRange(); // { start: 0, count: N }
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      drawFooter(i + 1, range.count);
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ message: 'Error generating report', error: err.message });
  }
});

export default router;
