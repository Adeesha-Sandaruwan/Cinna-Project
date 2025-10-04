import React from 'react';

const DownloadVehiclePDFButton = ({ vehicle }) => {
  const handleDownload = () => {
    // Create a simple HTML representation and trigger print dialog
    const printContent = `
      <html>
        <head>
          <title>Vehicle Details Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #CC7722; margin-bottom: 20px; }
            .detail-row { margin: 8px 0; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Vehicle Details Report</h1>
          <div class="detail-row"><span class="label">Vehicle ID:</span> ${vehicle.vehicleId || '-'}</div>
          <div class="detail-row"><span class="label">Type:</span> ${vehicle.vehicleType || ''}</div>
          <div class="detail-row"><span class="label">Capacity:</span> ${vehicle.capacity || ''}</div>
          <div class="detail-row"><span class="label">Status:</span> ${vehicle.status || ''}</div>
          <div class="detail-row"><span class="label">Insurance No:</span> ${vehicle.insuranceNo || ''}</div>
          <div class="detail-row"><span class="label">Insurance Expiry:</span> ${vehicle.insuranceExpDate ? new Date(vehicle.insuranceExpDate).toLocaleDateString() : ''}</div>
          <div class="detail-row"><span class="label">Service Date:</span> ${vehicle.serviceDate ? new Date(vehicle.serviceDate).toLocaleDateString() : ''}</div>
          ${vehicle.maintenanceReport ? `<div class="detail-row"><span class="label">Maintenance Cost:</span> ${vehicle.maintenanceCost !== undefined && vehicle.maintenanceCost !== null ? vehicle.maintenanceCost : 'N/A'}</div>` : ''}
          ${vehicle.accidentReport ? `<div class="detail-row"><span class="label">Accident Cost:</span> ${vehicle.accidentCost !== undefined && vehicle.accidentCost !== null ? vehicle.accidentCost : 'N/A'}</div>` : ''}
        </body>
      </html>
    `;
    
    // Open in new window and trigger print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Trigger print dialog after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <button onClick={handleDownload} className="bg-[#CC7722] text-white px-4 py-2 rounded shadow hover:bg-[#8B4513] transition mt-4">
      Print Vehicle Report
    </button>
  );
};

export default DownloadVehiclePDFButton;
