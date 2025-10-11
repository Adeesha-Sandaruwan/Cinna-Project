import React from 'react';
import { useNavigate } from 'react-router-dom';
import RawMaterialList from '../RawMaterialList';

const InventorySection = ({ rawMaterials, onEdit, onDelete, supplierId }) => {
  const navigate = useNavigate();

  return (
    <div id="inventory" className="content-card bg-white border-2 border-[#e5cdb4] rounded-2xl shadow-xl overflow-hidden">
      <div className="content-card-header px-6 py-4 border-b-2 border-[#e5cdb4] bg-gradient-to-r from-[#fef7ed] to-[#f3e7db]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-[#7a4522]">Raw Materials Inventory</h3>
            <p className="text-[#b36f3d] mt-1">Manage your material listings and availability</p>
          </div>
          <button
            onClick={() => navigate(`/raw-material-form/${supplierId}`)}
            className="mt-4 sm:mt-0 btn-primary-brown bg-gradient-to-r from-[#d97706] to-[#b36f3d] text-white rounded-xl hover:from-[#b45309] hover:to-[#9a582a] transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2 px-6 py-3"
          >
            <span>+</span>
            <span>Add New Material</span>
          </button>
        </div>
      </div>
      <div className="p-6">
        <RawMaterialList
          rawMaterials={rawMaterials}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default InventorySection;
