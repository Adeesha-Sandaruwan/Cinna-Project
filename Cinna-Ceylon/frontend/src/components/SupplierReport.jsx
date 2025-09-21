import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SupplierReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [supplierRes, materialsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/suppliers/${id}`),
        fetch(`http://localhost:5000/api/raw-materials/supplier/${id}`)
      ]);

      if (supplierRes.ok) {
        const supplierData = await supplierRes.json();
        setSupplier(supplierData);
      }

      if (materialsRes.ok) {
        const materialsData = await materialsRes.json();
        setRawMaterials(materialsData);
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
    const totalQuantity = rawMaterials.reduce((sum, material) => sum + material.quantity, 0);
    const totalValue = rawMaterials.reduce((sum, material) => sum + (material.quantity * material.pricePerKg), 0);
    const averagePrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Supplier Report - ${supplier?.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #d97706; padding-bottom: 20px; }
          .header h1 { color: #92400e; margin: 0; font-size: 28px; }
          .header p { color: #a16207; margin: 5px 0; }
          .section { margin-bottom: 25px; }
          .section h2 { color: #92400e; border-bottom: 2px solid #fbbf24; padding-bottom: 5px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-card { background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center; min-width: 120px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #92400e; }
          .stat-label { color: #a16207; font-size: 14px; }
          .supplier-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-row { margin: 8px 0; }
          .info-label { font-weight: bold; color: #374151; }
          .materials-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .materials-table th, .materials-table td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
          .materials-table th { background: #f3f4f6; font-weight: bold; color: #374151; }
          .materials-table tr:nth-child(even) { background: #f9fafb; }
          .quality-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .quality-ALBA { background: #e9d5ff; color: #7c3aed; }
          .quality-C5 { background: #dbeafe; color: #2563eb; }
          .quality-C4 { background: #c7d2fe; color: #4338ca; }
          .quality-H1 { background: #dcfce7; color: #16a34a; }
          .quality-H2 { background: #bbf7d0; color: #15803d; }
          .quality-H3 { background: #a7f3d0; color: #047857; }
          .quality-H4 { background: #99f6e4; color: #0d9488; }
          .quality-M5 { background: #fed7aa; color: #ea580c; }
          .quality-M4 { background: #fde68a; color: #d97706; }
          .status-available { background: #dcfce7; color: #16a34a; }
          .status-sold { background: #fecaca; color: #dc2626; }
          .status-reserved { background: #fef3c7; color: #d97706; }
          .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌿 CinnaCeylon Supplier Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h2>Supplier Information</h2>
          <div class="supplier-info">
            <div class="info-row"><span class="info-label">Name:</span> ${supplier?.name}</div>
            <div class="info-row"><span class="info-label">Email:</span> ${supplier?.email}</div>
            <div class="info-row"><span class="info-label">Contact:</span> ${supplier?.contactNumber}</div>
            ${supplier?.whatsappNumber ? `<div class="info-row"><span class="info-label">WhatsApp:</span> ${supplier.whatsappNumber}</div>` : ''}
            <div class="info-row"><span class="info-label">Address:</span> ${supplier?.address}</div>
            <div class="info-row"><span class="info-label">Registration Date:</span> ${new Date(supplier?.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div class="section">
          <h2>Statistics Summary</h2>
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${totalMaterials}</div>
              <div class="stat-label">Total Materials</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalQuantity.toFixed(1)} kg</div>
              <div class="stat-label">Total Quantity</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">LKR ${totalValue.toFixed(2)}</div>
              <div class="stat-label">Total Value</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">LKR ${averagePrice.toFixed(2)}</div>
              <div class="stat-label">Avg Price/kg</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Raw Materials Inventory</h2>
          <table class="materials-table">
            <thead>
              <tr>
                <th>Quality</th>
                <th>Quantity (kg)</th>
                <th>Price/kg (LKR)</th>
                <th>Total Value (LKR)</th>
                <th>Status</th>
                <th>Location</th>
                <th>Harvest Date</th>
              </tr>
            </thead>
            <tbody>
              ${rawMaterials.map(material => `
                <tr>
                  <td><span class="quality-badge quality-${material.quality}">${material.quality}</span></td>
                  <td>${material.quantity}</td>
                  <td>${material.pricePerKg}</td>
                  <td>${(material.quantity * material.pricePerKg).toFixed(2)}</td>
                  <td><span class="quality-badge status-${material.status}">${material.status}</span></td>
                  <td>${material.location || 'N/A'}</td>
                  <td>${material.harvestDate ? new Date(material.harvestDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This report was generated by CinnaCeylon Management System</p>
          <p>For more information, contact: info@cinnaceylon.com</p>
        </div>
      </body>
      </html>
    `;

    // Create and download PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
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
                {rawMaterials.reduce((sum, material) => sum + material.quantity, 0).toFixed(1)} kg
              </div>
              <div className="text-green-600 text-sm">Total Quantity</div>
            </div>
            <div className="bg-blue-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-800">
                LKR {rawMaterials.reduce((sum, material) => sum + (material.quantity * material.pricePerKg), 0).toFixed(2)}
              </div>
              <div className="text-blue-600 text-sm">Total Value</div>
            </div>
            <div className="bg-purple-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-800">
                LKR {rawMaterials.length > 0 ? (rawMaterials.reduce((sum, material) => sum + (material.quantity * material.pricePerKg), 0) / rawMaterials.reduce((sum, material) => sum + material.quantity, 0)).toFixed(2) : '0.00'}
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
