import React, { useState } from 'react';
import jsPDF from 'jspdf';

const DownloadVehiclePDFButton = ({ vehicle }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    
    // Add a small delay to show the animation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create PDF using jsPDF
    const doc = new jsPDF();
    
    // Colors
    const primaryColor = "#A0522D";
    const accentColor = "#D2691E";
    
    // Header
    doc.setFillColor(244, 228, 188); // Light cinnamon background
    doc.rect(0, 0, 210, 40, 'F');
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(primaryColor);
    doc.text("CINNA CEYLON", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Vehicle Details Report", 105, 30, { align: "center" });
    
    // Line separator
    doc.setDrawColor(accentColor);
    doc.setLineWidth(1);
    doc.line(20, 45, 190, 45);
    
    // Vehicle Information
    let yPos = 60;
    
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.text("VEHICLE INFORMATION", 20, yPos);
    yPos += 15;
    
    // Vehicle details
    const details = [
      ["Vehicle ID:", vehicle.vehicleId || vehicle._id || 'N/A'],
      ["Vehicle Type:", vehicle.vehicleType || 'N/A'],
      ["Capacity:", vehicle.capacity ? `${vehicle.capacity} kg` : 'N/A'],
      ["Status:", vehicle.status || 'N/A'],
      ["Insurance No:", vehicle.insuranceNo || 'N/A'],
      ["Insurance Expiry:", vehicle.insuranceExpDate ? new Date(vehicle.insuranceExpDate).toLocaleDateString() : 'N/A'],
      ["Service Date:", vehicle.serviceDate ? new Date(vehicle.serviceDate).toLocaleDateString() : 'N/A'],
      ["Maintenance Cost:", vehicle.maintenanceCost !== undefined ? `$${vehicle.maintenanceCost}` : 'N/A'],
      ["Accident Cost:", vehicle.accidentCost !== undefined ? `$${vehicle.accidentCost}` : 'N/A']
    ];
    
    details.forEach(([label, value], index) => {
      // Alternating background
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(20, yPos - 4, 170, 8, 'F');
      }
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(label, 25, yPos);
      doc.text(value, 80, yPos);
      yPos += 10;
    });
    
    // Footer
    yPos = 280;
    doc.setDrawColor(accentColor);
    doc.line(20, yPos - 10, 190, yPos - 10);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated on " + new Date().toLocaleDateString(), 105, yPos, { align: "center" });
    doc.text("Cinna Ceylon - Vehicle Management System", 105, yPos + 5, { align: "center" });
    
    // Save PDF
    const fileName = `Vehicle_${vehicle.vehicleId || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    // Show success animation
    setIsGenerating(false);
    setIsSuccess(true);
    
    // Reset success state after animation
    setTimeout(() => {
      setIsSuccess(false);
    }, 2000);
  };

  return (
    <div className="relative group">
      {/* Floating particles effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#A0522D] via-[#D2691E] to-[#A0522D] rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
      
      <button 
        onClick={handleDownload} 
        disabled={isGenerating}
        className={`
          relative px-8 py-4 rounded-lg font-bold text-white
          bg-gradient-to-r from-[#A0522D] via-[#D2691E] to-[#A0522D]
          bg-size-200 bg-pos-0 hover:bg-pos-100
          transition-all duration-500 ease-in-out
          transform hover:-translate-y-2 hover:scale-105
          shadow-lg hover:shadow-2xl hover:shadow-[#A0522D]/30
          border border-transparent hover:border-[#D2691E]/50
          overflow-hidden
          ${isGenerating ? 'animate-pulse cursor-not-allowed' : 'cursor-pointer'}
          ${isSuccess ? 'bg-gradient-to-r from-green-500 to-green-600' : ''}
          flex items-center gap-3 min-w-[200px] justify-center
        `}
        style={{
          backgroundSize: '200% 100%',
          backgroundPosition: isGenerating ? '100% 0' : '0% 0',
        }}
      >
        {/* Animated background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 hover:opacity-100 hover:animate-shimmer transition-opacity duration-300"></div>
        
        {/* Button content */}
        <div className="relative flex items-center gap-3">
          {/* Icon container with rotation animation */}
          <div className={`transition-transform duration-500 ${isGenerating ? 'animate-spin' : 'group-hover:rotate-12'}`}>
            {isGenerating ? (
              // Loading spinner
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isSuccess ? (
              // Success checkmark with animation
              <svg className="w-5 h-5 text-white animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              // Download icon with bounce animation
              <svg className="w-5 h-5 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          {/* Text with typewriter effect */}
          <span className={`
            transition-all duration-300 font-semibold
            ${isGenerating ? 'text-blue-100' : isSuccess ? 'text-green-100' : 'text-white'}
            group-hover:tracking-wide
          `}>
            {isGenerating ? 'Generating PDF...' : isSuccess ? 'Download Complete!' : 'Download PDF Report'}
          </span>
        </div>
        
        {/* Ripple effect on click */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-active:scale-100 transition-transform duration-300 origin-center"></div>
        </div>
      </button>
      
      {/* Floating success message */}
      {isSuccess && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce z-10">
          <div className="text-sm font-medium">PDF Downloaded!</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-green-500"></div>
        </div>
      )}
      
      {/* Particles animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`
              absolute w-1 h-1 bg-[#D2691E] rounded-full opacity-0 group-hover:opacity-60
              animate-float-${i + 1}
            `}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s',
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default DownloadVehiclePDFButton;
