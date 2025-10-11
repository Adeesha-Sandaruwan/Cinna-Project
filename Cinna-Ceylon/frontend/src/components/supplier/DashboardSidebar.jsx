import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardSidebar = ({ supplierId, handleExportPDF }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <aside className="lg:col-span-3 xl:col-span-2">
      <div className="sidebar-nav sticky top-24 bg-gradient-to-b from-[#d97706] to-[#b45309] shadow-lg min-h-[200px]">
        <div className="relative p-4 flex items-center gap-3 cursor-pointer hover:from-[#b45309] hover:to-[#c2410c] transition-all" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <div className="w-8 h-8 bg-[#d97706] rounded flex items-center justify-center flex-shrink-0">
            <span className={`text-white text-sm transform transition-transform duration-300 ${sidebarOpen ? 'rotate-90' : ''}`}>▶</span>
          </div>
          <span className="text-white font-bold text-lg">Menu</span>
        </div>
        <div className={`transition-all duration-500 overflow-hidden ${sidebarOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <nav className="py-4">
            <button className="w-full text-left px-5 py-3 text-white/80 hover:bg-white/10 hover:text-white border-l-4 border-transparent hover:border-[#d97706] transition-all" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Overview</button>
            <button className="w-full text-left px-5 py-3 text-white/80 hover:bg-white/10 hover:text-white border-l-4 border-transparent hover:border-[#d97706] transition-all" onClick={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })}>Inventory</button>
            <button className="w-full text-left px-5 py-3 text-white/80 hover:bg-white/10 hover:text-white border-l-4 border-transparent hover:border-[#d97706] transition-all" onClick={() => document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' })}>Analytics</button>
            <button className="w-full text-left px-5 py-3 text-white/80 hover:bg-white/10 hover:text-white border-l-4 border-transparent hover:border-[#d97706] transition-all" onClick={handleExportPDF}>Export Report</button>
          </nav>
          <div className="sidebar-actions grid grid-cols-2 gap-3 px-4 py-4 border-t border-white/10">
            <button onClick={() => navigate(`/raw-material-form/${supplierId}`)} className="btn-add-material bg-gradient-to-r from-[#d97706] to-[#ea580c] text-white rounded-lg font-semibold py-2 px-4 hover:from-[#b45309] hover:to-[#c2410c] transition-all">Add Material</button>
            <button onClick={() => navigate(`/supplier-edit/${supplierId}`)} className="btn-edit-profile bg-white/10 text-white rounded-lg font-semibold py-2 px-4 border border-white/20 hover:bg-white/20 transition-all">Edit Profile</button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
