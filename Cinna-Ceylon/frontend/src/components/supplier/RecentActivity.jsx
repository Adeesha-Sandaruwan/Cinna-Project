import React from 'react';

const RecentActivity = ({ rawMaterials }) => {
  return (
    <div className="content-card bg-white border-2 border-[#e5cdb4] rounded-2xl shadow-xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-[#7a4522]">Recent Activity</h3>
      </div>
      <ul className="space-y-3">
        {rawMaterials.slice(0, 5).map((m) => (
          <li key={m._id || m.id} className="flex items-center justify-between p-3 rounded-xl bg-[#fef7ed]">
            <div>
              <p className="font-medium text-[#7a4522]">
                {m.materialName && m.materialName.trim()
                  ? m.materialName
                  : (m.quality ? `Cinnamon ${m.quality}` : 'Cinnamon Raw Material')}
              </p>
              <p className="text-sm text-[#b36f3d]">Qty: {m.quantity} kg • LKR {parseFloat(m.pricePerKg || 0).toFixed(2)} per kg</p>
            </div>
            <span className="text-xs text-[#d97706] bg-[#e5cdb4] px-2 py-1 rounded-lg">Updated</span>
          </li>
        ))}
        {rawMaterials.length === 0 && (
          <li className="p-3 rounded-xl bg-[#f3e7db] text-[#b36f3d]">No recent activity yet.</li>
        )}
      </ul>
    </div>
  );
};

export default RecentActivity;
