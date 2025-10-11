import React from 'react';
import SupplierChart from '../SupplierChart';

const AnalyticsSection = ({ supplierId, rawMaterials }) => {
  return (
    <div id="analytics" className="content-card bg-white border-2 border-[#e5cdb4] rounded-2xl shadow-xl p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-[#7a4522] mb-2">Performance Analytics</h3>
        <p className="text-[#b36f3d]">Visual insights into your material inventory and performance</p>
      </div>
      <SupplierChart supplierId={supplierId} rawMaterials={rawMaterials} />
    </div>
  );
};

export default AnalyticsSection;
