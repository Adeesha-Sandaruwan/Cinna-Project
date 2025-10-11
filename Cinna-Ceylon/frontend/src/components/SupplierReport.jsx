import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';

const SupplierReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Try using the ID from the URL
      let targetId = id;
      let supplierOk = false;

      if (targetId) {
        const supplierRes = await fetch(`http://localhost:5000/api/suppliers/${targetId}`);
        if (supplierRes.ok) {
          const supplierData = await supplierRes.json();
          setSupplier(supplierData);
          supplierOk = true;
          const materialsRes = await fetch(`http://localhost:5000/api/raw-materials/supplier/${targetId}`);
          if (materialsRes.ok) {
            const materialsData = await materialsRes.json();
            setRawMaterials(materialsData);
          }
        }
      }

      // Fallback: locate supplier by current user's email
      if (!supplierOk && user?.email) {
        const listRes = await fetch('http://localhost:5000/api/suppliers');
        const list = listRes.ok ? await listRes.json() : [];
        const match = Array.isArray(list)
          ? list.find(s => (s?.email || '').toLowerCase() === user.email.toLowerCase())
          : null;
        if (match && (match._id || match.id)) {
          const sid = match._id || match.id;
          setSupplier(match);
          const materialsRes = await fetch(`http://localhost:5000/api/raw-materials/supplier/${sid}`);
          if (materialsRes.ok) {
            const materialsData = await materialsRes.json();
            setRawMaterials(materialsData);
          }
          // Normalize URL silently
          if (id !== sid) navigate(`/supplier-report/${sid}`, { replace: true });
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    // Calculate statistics
    const totalMaterials = rawMaterials.length;
    const totalQuantity = rawMaterials.reduce((sum, material) => sum + Number(material.quantity || 0), 0);
    const totalValue = rawMaterials.reduce((sum, material) => sum + (Number(material.quantity || 0) * Number(material.pricePerKg || 0)), 0);
    const averagePrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;

    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let y = margin;

    // Header with logo and contact
    try {
      const img = new Image();
      img.src = logo;
      doc.addImage(img, 'PNG', margin, y, 50, 50);
    } catch (_) {}
    doc.setFontSize(18); doc.setTextColor('#92400e');
    doc.text('CinnaCeylon Supplier Report', margin + 60, y + 18);
    doc.setFontSize(10); doc.setTextColor('#6b7280');
    doc.text('Contact: info@cinnaceylon.com  •  +94 77 123 4567  •  +94 11 234 5678  •  www.cinnaceylon.com', margin + 60, y + 36);
    doc.setDrawColor('#d97706'); doc.setLineWidth(2);
    doc.line(margin, y + 60, pageWidth - margin, y + 60);
    y += 80;

    // Supplier info
    doc.setFontSize(12); doc.setTextColor('#92400e');
    doc.text('Supplier Information', margin, y); y += 16;
    doc.setFontSize(11); doc.setTextColor('#111111');
    doc.text(`Name: ${supplier?.name || '-'}`, margin, y); y += 14;
    doc.text(`Email: ${supplier?.email || '-'}`, margin, y); y += 14;
    doc.text(`Contact: ${supplier?.contactNumber || '-'}`, margin, y); y += 14;
    if (supplier?.whatsappNumber) { doc.text(`WhatsApp: ${supplier.whatsappNumber}`, margin, y); y += 14; }
    doc.text(`Address: ${supplier?.address || '-'}`, margin, y); y += 20;

    // Stats
    doc.setFontSize(12); doc.setTextColor('#92400e');
    doc.text('Statistics Summary', margin, y); y += 16; doc.setFontSize(11); doc.setTextColor('#111111');
    doc.text(`Total Materials: ${totalMaterials}`, margin, y); y += 14;
    doc.text(`Total Quantity: ${Number(totalQuantity).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`, margin, y); y += 14;
    doc.text(`Total Value: LKR ${Number(totalValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin, y); y += 14;
    doc.text(`Avg Price/kg: LKR ${Number(averagePrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin, y); y += 20;

    // Table header
    const columns = ['Quality', 'Qty (kg)', 'Price/kg', 'Total (LKR)', 'Status'];
    const colX = [margin, margin + 150, margin + 250, margin + 350, margin + 470];
    doc.setFontSize(11); doc.setTextColor('#374151');
    columns.forEach((c, i) => doc.text(c, colX[i], y));
    doc.setDrawColor('#fbbf24'); doc.setLineWidth(1); doc.line(margin, y + 4, pageWidth - margin, y + 4);
    y += 16; doc.setTextColor('#111111');

    // Rows
    rawMaterials.forEach((m) => {
      if (y > pageHeight - margin) { // new page
        doc.addPage(); y = margin; doc.setFontSize(11); doc.setTextColor('#374151');
        columns.forEach((c, i) => doc.text(c, colX[i], y));
        doc.setDrawColor('#fbbf24'); doc.line(margin, y + 4, pageWidth - margin, y + 4);
        y += 16; doc.setTextColor('#111111');
      }
      const qty = Number(m.quantity || 0);
      const price = Number(m.pricePerKg || 0);
      const total = qty * price;
      const status = (m.status || '').toString();
      doc.text(`${m.quality || '-'}`, colX[0], y);
      doc.text(`${qty.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`, colX[1], y);
      doc.text(`${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colX[2], y);
      doc.text(`${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colX[3], y);
      doc.text(`${status}`, colX[4], y);
      y += 16;
    });

    // Footer
    if (y > pageHeight - margin - 30) { doc.addPage(); y = margin; }
    doc.setFontSize(9); doc.setTextColor('#6b7280');
    doc.text('This report was generated by CinnaCeylon Management System', pageWidth / 2, pageHeight - 30, { align: 'center' });
    doc.text('For more information, contact: info@cinnaceylon.com', pageWidth / 2, pageHeight - 16, { align: 'center' });

    const filename = `supplier-report-${(supplier?.name || 'supplier').toString().replace(/\s+/g,'-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-600 text-lg">Generating report...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Supplier not found</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-2">
            📄 Supplier Report
          </h1>
          <p className="text-amber-600 text-lg">
            Generate and download supplier report as PDF
          </p>
        </div>

        {/* Report Preview Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-amber-200 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-amber-800 mb-2">{supplier.name}</h2>
            <p className="text-amber-600">Supplier Report Preview</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-amber-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-800">{rawMaterials.length}</div>
              <div className="text-amber-600 text-sm">Total Materials</div>
            </div>
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-800">
                {Number(rawMaterials.reduce((sum, material) => sum + Number(material.quantity || 0), 0)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
              </div>
              <div className="text-green-600 text-sm">Total Quantity</div>
            </div>
            <div className="bg-blue-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-800">
                LKR {Number(rawMaterials.reduce((sum, material) => sum + (Number(material.quantity || 0) * Number(material.pricePerKg || 0)), 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-blue-600 text-sm">Total Value</div>
            </div>
            <div className="bg-purple-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-800">
                LKR {rawMaterials.length > 0 
                  ? Number(
                      rawMaterials.reduce((sum, material) => sum + (Number(material.quantity || 0) * Number(material.pricePerKg || 0)), 0) /
                      rawMaterials.reduce((sum, material) => sum + Number(material.quantity || 0), 0)
                    ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : '0.00'}
              </div>
              <div className="text-purple-600 text-sm">Avg Price/kg</div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-amber-800 mb-3">Supplier Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">Email:</span> {supplier.email}</div>
              <div><span className="font-medium">Contact:</span> {supplier.contactNumber}</div>
              {supplier.whatsappNumber && (
                <div><span className="font-medium">WhatsApp:</span> {supplier.whatsappNumber}</div>
              )}
              <div><span className="font-medium">Address:</span> {supplier.address}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={generatePDF}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-semibold flex items-center space-x-2"
            >
              <span>📄</span>
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => navigate(`/supplier-dashboard/${id}`)}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-semibold flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierReport;
