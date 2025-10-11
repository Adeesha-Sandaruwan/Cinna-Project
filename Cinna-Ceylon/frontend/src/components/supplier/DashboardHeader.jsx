import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = ({ supplier, handleExportPDF }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-header shadow-xl bg-gradient-to-r from-[#7a4522] to-[#5c351c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <button
              onClick={() => navigate('/')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all duration-200 font-medium flex items-center space-x-2 backdrop-blur-sm"
            >
              <span>←</span>
              <span>Back to Home</span>
            </button>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{supplier.name}</h1>
              <p className="text-[#e5cdb4] text-lg">Supplier Management Dashboard</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportPDF}
              className="bg-[#d97706] hover:bg-[#b45309] text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2"
            >
              <span className="text-lg">📊</span>
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
