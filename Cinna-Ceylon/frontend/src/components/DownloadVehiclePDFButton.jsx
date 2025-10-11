import React from 'react';

const DownloadVehiclePDFButton = ({ vehicle }) => {
  const handleDownload = () => {
    // Create a professional HTML vehicle report
    const getStatusColor = (status) => {
      switch(status) {
        case 'Available': return '#28a745';
        case 'In Use': return '#007bff';
        case 'Maintenance': return '#ffc107';
        case 'Out of Service': return '#dc3545';
        case 'Inactive': return '#6c757d';
        default: return '#6c757d';
      }
    };

    const getStatusIcon = (status) => {
      switch(status) {
        case 'Available': return '✅';
        case 'In Use': return '🚗';
        case 'Maintenance': return '🔧';
        case 'Out of Service': return '⚠️';
        case 'Inactive': return '⏸️';
        default: return '❓';
      }
    };

    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vehicle Details Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              min-height: 100vh;
              padding: 40px;
            }
            .container { 
              max-width: 900px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 20px; 
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #8B4513 0%, #CC7722 100%);
              color: white; 
              padding: 40px; 
              text-align: center; 
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="70" r="1" fill="rgba(255,255,255,0.05)"/></svg>');
            }
            .logo { 
              font-size: 36px; 
              font-weight: bold; 
              margin-bottom: 10px; 
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              position: relative;
              z-index: 1;
            }
            .report-title { 
              font-size: 28px; 
              font-weight: 300; 
              letter-spacing: 2px;
              position: relative;
              z-index: 1;
            }
            .vehicle-hero {
              background: linear-gradient(45deg, #f8f9fa 0%, #e9ecef 100%);
              padding: 30px;
              text-align: center;
              border-bottom: 3px solid #CC7722;
            }
            .vehicle-id {
              font-size: 32px;
              font-weight: bold;
              color: #8B4513;
              margin-bottom: 15px;
            }
            .vehicle-type {
              font-size: 18px;
              color: #495057;
              background: white;
              padding: 10px 20px;
              border-radius: 25px;
              display: inline-block;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .content { padding: 40px; }
            .info-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
              gap: 25px; 
              margin: 30px 0; 
            }
            .info-card { 
              background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
              padding: 25px; 
              border-radius: 15px; 
              border-left: 5px solid #CC7722;
              box-shadow: 0 5px 15px rgba(0,0,0,0.08);
              transition: transform 0.3s ease;
            }
            .info-card:hover { transform: translateY(-2px); }
            .card-icon {
              font-size: 24px;
              margin-bottom: 10px;
              display: block;
            }
            .label { 
              font-weight: 600; 
              color: #495057; 
              font-size: 12px; 
              text-transform: uppercase; 
              letter-spacing: 1px; 
              margin-bottom: 8px;
            }
            .value { 
              font-size: 18px; 
              color: #212529; 
              font-weight: 500;
            }
            .status-badge {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 14px;
              color: white;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            }
            .insurance-section {
              background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
              padding: 25px;
              border-radius: 15px;
              margin: 25px 0;
              border: 1px solid #90caf9;
            }
            .section-title {
              font-size: 20px;
              font-weight: bold;
              color: #1976d2;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .cost-highlight {
              background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
              padding: 20px;
              border-radius: 12px;
              text-align: center;
              margin: 20px 0;
              border: 2px solid #ff9800;
            }
            .cost-amount {
              font-size: 24px;
              font-weight: bold;
              color: #f57c00;
            }
            .footer { 
              background: #f8f9fa;
              padding: 30px;
              text-align: center; 
              border-top: 3px solid #CC7722;
              color: #6c757d;
            }
            .footer-logo {
              font-size: 24px;
              font-weight: bold;
              color: #8B4513;
              margin-bottom: 10px;
            }
            .report-meta {
              font-size: 12px;
              margin-top: 15px;
            }
            @media print {
              body { background: white; padding: 0; }
              .container { box-shadow: none; border-radius: 0; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🌿 Cinna Ceylon</div>
              <div class="report-title">VEHICLE DETAILS REPORT</div>
            </div>
            
            <div class="vehicle-hero">
              <div class="vehicle-id">${vehicle.vehicleId || 'N/A'}</div>
              <div class="vehicle-type">${vehicle.vehicleType || 'Vehicle Type Not Specified'}</div>
            </div>

            <div class="content">
              <div class="info-grid">
                <div class="info-card">
                  <div class="card-icon">🚗</div>
                  <div class="label">Vehicle Status</div>
                  <div class="value">
                    <span class="status-badge" style="background-color: ${getStatusColor(vehicle.status)}">
                      ${getStatusIcon(vehicle.status)} ${vehicle.status || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div class="info-card">
                  <div class="card-icon">👥</div>
                  <div class="label">Capacity</div>
                  <div class="value">${vehicle.capacity ? `${vehicle.capacity} passengers` : 'Not specified'}</div>
                </div>

                <div class="info-card">
                  <div class="card-icon">🔧</div>
                  <div class="label">Last Service Date</div>
                  <div class="value">${vehicle.serviceDate ? new Date(vehicle.serviceDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'No service records'}</div>
                </div>

                <div class="info-card">
                  <div class="card-icon">📅</div>
                  <div class="label">Registration Date</div>
                  <div class="value">${vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Not available'}</div>
                </div>
              </div>

              ${vehicle.insuranceNo ? `
              <div class="insurance-section">
                <div class="section-title">
                  🛡️ Insurance Information
                </div>
                <div class="info-grid">
                  <div class="info-card" style="border-left-color: #2196f3;">
                    <div class="label">Insurance Number</div>
                    <div class="value">${vehicle.insuranceNo}</div>
                  </div>
                  <div class="info-card" style="border-left-color: #2196f3;">
                    <div class="label">Expiry Date</div>
                    <div class="value">${vehicle.insuranceExpDate ? new Date(vehicle.insuranceExpDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Not specified'}</div>
                  </div>
                </div>
              </div>
              ` : ''}

              ${(vehicle.maintenanceCost !== undefined && vehicle.maintenanceCost !== null) || 
                (vehicle.accidentCost !== undefined && vehicle.accidentCost !== null) ? `
              <div class="cost-highlight">
                <div class="section-title" style="color: #f57c00; justify-content: center;">
                  💰 Cost Summary
                </div>
                ${vehicle.maintenanceCost !== undefined && vehicle.maintenanceCost !== null ? 
                  `<div style="margin: 10px 0;">
                    <div class="label">Total Maintenance Cost</div>
                    <div class="cost-amount">LKR ${Number(vehicle.maintenanceCost).toLocaleString()}</div>
                  </div>` : ''
                }
                ${vehicle.accidentCost !== undefined && vehicle.accidentCost !== null ? 
                  `<div style="margin: 10px 0;">
                    <div class="label">Total Accident Cost</div>
                    <div class="cost-amount">LKR ${Number(vehicle.accidentCost).toLocaleString()}</div>
                  </div>` : ''
                }
              </div>
              ` : ''}
            </div>

            <div class="footer">
              <div class="footer-logo">🌿 Cinna Ceylon</div>
              <div>Professional Vehicle Management System</div>
              <div class="report-meta">
                Report Generated: ${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div style="margin-top: 10px; font-weight: bold; color: #8B4513;">
                This is an official vehicle report document
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Create downloadable HTML file instead of just printing
    const element = document.createElement('a');
    const file = new Blob([printContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `vehicle-report-${vehicle.vehicleId || 'unknown'}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    // Also open in new window for immediate viewing/printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto-trigger print dialog after a delay
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  };

  return (
    <button onClick={handleDownload} className="bg-gradient-to-r from-[#CC7722] to-[#8B4513] text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mt-4 flex items-center gap-2">
      <span>📄</span> Download Vehicle Report
    </button>
  );
};

export default DownloadVehiclePDFButton;
