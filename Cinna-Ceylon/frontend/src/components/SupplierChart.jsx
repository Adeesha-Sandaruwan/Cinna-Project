import React from 'react';

const SupplierChart = ({ supplierId, rawMaterials }) => {
  // Calculate statistics
  const totalMaterials = rawMaterials.length;
  const totalQuantity = rawMaterials.reduce((sum, material) => sum + material.quantity, 0);
  const totalValue = rawMaterials.reduce((sum, material) => sum + (material.quantity * material.pricePerKg), 0);
  const averagePrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;

  // Quality distribution
  const qualityDistribution = rawMaterials.reduce((acc, material) => {
    acc[material.quality] = (acc[material.quality] || 0) + 1;
    return acc;
  }, {});

  // Status distribution
  const statusDistribution = rawMaterials.reduce((acc, material) => {
    acc[material.status] = (acc[material.status] || 0) + 1;
    return acc;
  }, {});

  // Top materials by value
  const topMaterials = [...rawMaterials]
    .sort((a, b) => (b.quantity * b.pricePerKg) - (a.quantity * a.pricePerKg))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-200">
      <h3 className="text-2xl font-bold text-amber-800 mb-6">📊 Supplier Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Materials */}
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-amber-800">{totalMaterials}</div>
          <div className="text-amber-600 font-semibold">Total Materials</div>
        </div>

        {/* Total Quantity */}
        <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-800">{totalQuantity.toFixed(1)} kg</div>
          <div className="text-green-600 font-semibold">Total Quantity</div>
        </div>

        {/* Total Value */}
        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-800">LKR {totalValue.toFixed(2)}</div>
          <div className="text-blue-600 font-semibold">Total Value</div>
        </div>

        {/* Average Price */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-800">LKR {averagePrice.toFixed(2)}</div>
          <div className="text-purple-600 font-semibold">Avg Price/kg</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quality Distribution */}
        <div>
          <h4 className="text-lg font-semibold text-amber-800 mb-4">Quality Distribution</h4>
          <div className="space-y-3">
            {Object.entries(qualityDistribution).map(([quality, count]) => (
              <div key={quality} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{quality}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(count / totalMaterials) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-amber-800 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div>
          <h4 className="text-lg font-semibold text-amber-800 mb-4">Status Distribution</h4>
          <div className="space-y-3">
            {Object.entries(statusDistribution).map(([status, count]) => {
              const statusColors = {
                'available': 'bg-green-500',
                'sold': 'bg-red-500',
                'reserved': 'bg-yellow-500'
              };
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${statusColors[status] || 'bg-gray-500'}`}
                        style={{ width: `${(count / totalMaterials) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-amber-800 w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Materials by Value */}
      {topMaterials.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-amber-800 mb-4">Top Materials by Value</h4>
          <div className="space-y-2">
            {topMaterials.map((material, index) => (
              <div key={material._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-800">{material.quality}</span>
                  <span className="text-sm text-gray-600">{material.quantity} kg</span>
                </div>
                <span className="font-semibold text-amber-800">
                  LKR {(material.quantity * material.pricePerKg).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalMaterials === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📈</div>
          <h4 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h4>
          <p className="text-gray-500">Add some raw materials to see analytics here.</p>
        </div>
      )}
    </div>
  );
};

export default SupplierChart;
