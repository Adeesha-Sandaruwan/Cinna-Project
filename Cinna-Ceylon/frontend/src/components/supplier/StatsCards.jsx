import React from 'react';

const StatsCards = ({ rawMaterials, totalQuantity, totalValue }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="stat-card-materials bg-gradient-to-br from-[#d97706] to-[#b36f3d] rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#e5cdb4] text-sm font-medium">Total Materials</p>
            <p className="text-3xl font-bold mt-2">{rawMaterials.length}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">📦</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#e5cdb4]/30">
          <p className="text-[#e5cdb4] text-sm">Active listings</p>
        </div>
      </div>
      <div className="stat-card-quantity bg-gradient-to-br from-[#ea580c] to-[#c2410c] rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#f3e7db] text-sm font-medium">Total Quantity</p>
            <p className="text-3xl font-bold mt-2">{totalQuantity.toFixed(1)} kg</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">⚖️</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#ea580c]/30">
          <p className="text-[#f3e7db] text-sm">Available stock</p>
        </div>
      </div>
      <div className="stat-card-value bg-gradient-to-br from-[#78350f] to-[#451a03] rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#e5cdb4] text-sm font-medium">Total Value</p>
            <p className="text-3xl font-bold mt-2">LKR {totalValue.toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">💰</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#e5cdb4]/30">
          <p className="text-[#e5cdb4] text-sm">Inventory value</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
