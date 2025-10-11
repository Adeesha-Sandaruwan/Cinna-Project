import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const WholesalePage = () => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supplierNameCache, setSupplierNameCache] = useState({});
  const [filters, setFilters] = useState({
    quality: '',
    supplier: '',
    minPrice: '',
    maxPrice: '',
    location: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rawMaterials, suppliers, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [materialsRes, suppliersRes] = await Promise.all([
        fetch('http://localhost:5000/api/raw-materials'),
        fetch('http://localhost:5000/api/suppliers')
      ]);

      const materialsData = materialsRes.ok ? await materialsRes.json() : [];
      const suppliersData = suppliersRes.ok ? await suppliersRes.json() : [];
      
      setRawMaterials(Array.isArray(materialsData) ? materialsData : []);
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
      const initialCache = (Array.isArray(suppliersData) ? suppliersData : []).reduce((acc, s) => {
        if (s && s._id) acc[s._id] = s.name || 'Unknown Supplier';
        return acc;
      }, {});
      setSupplierNameCache(initialCache);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSupplierName = (supplierId) => {
    if (!supplierId) return 'Unknown Supplier';
    if (supplierNameCache[supplierId]) return supplierNameCache[supplierId];
    const supplier = suppliers.find(s => s._id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
  };

  useEffect(() => {
    if (!filteredMaterials.length) return;
    const ids = Array.from(new Set(
      filteredMaterials
        .map(m => (typeof m.supplier === 'string' ? m.supplier : m.supplier?._id))
        .filter(id => id && !supplierNameCache[id])
    ));
    if (!ids.length) return;
    Promise.all(
      ids.map(id => fetch(`http://localhost:5000/api/suppliers/${id}`).then(r => (r.ok ? r.json() : null)))
    )
      .then(list => {
        const add = {};
        list.filter(Boolean).forEach(s => {
          if (s && s._id) add[s._id] = s.name || 'Unknown Supplier';
        });
        if (Object.keys(add).length) setSupplierNameCache(prev => ({ ...prev, ...add }));
      })
      .catch(() => {});
  }, [filteredMaterials, suppliers]);

  const applyFilters = () => {
    if (!rawMaterials.length) {
        setFilteredMaterials([]);
        return;
    }
    let filtered = rawMaterials.filter(material => {
      const supplierId = typeof material.supplier === 'string' ? material.supplier : material.supplier?._id;
      return (
        material.status === 'available' &&
        material.visibility === 'public' &&
        (!filters.quality || material.quality === filters.quality) &&
        (!filters.supplier || supplierId === filters.supplier) &&
        (!filters.minPrice || material.pricePerKg >= parseFloat(filters.minPrice)) &&
        (!filters.maxPrice || material.pricePerKg <= parseFloat(filters.maxPrice)) &&
        (!filters.location || material.location?.toLowerCase().includes(filters.location.toLowerCase()))
      );
    });
    setFilteredMaterials(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getQualityBadgeColor = (quality) => {
    const colors = {
      'ALBA': 'bg-purple-100 text-purple-800 border-purple-200',
      'C5': 'bg-blue-100 text-blue-800 border-blue-200',
      'C4': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'H1': 'bg-green-100 text-green-800 border-green-200',
      'H2': 'bg-green-100 text-green-800 border-green-200',
      'H3': 'bg-green-100 text-green-800 border-green-200',
      'H4': 'bg-green-100 text-green-800 border-green-200',
      'M5': 'bg-orange-100 text-orange-800 border-orange-200',
      'M4': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[quality] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading wholesale materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-gradient-to-r from-amber-600 to-orange-700">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">Raw Cinnamon Products</h1>
            <p className="text-lg text-amber-100 mb-6">Premium Cinnamon Raw Materials from Trusted Suppliers</p>
            <div className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-4xl mx-auto backdrop-blur-sm">
              <p className="text-amber-50">Discover the finest quality cinnamon from certified suppliers across Sri Lanka</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-amber-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Filter Materials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quality Grade</label>
              <select
                name="quality"
                value={filters.quality}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
              >
                <option value="">All Grades</option>
                <option value="ALBA">ALBA (Premium)</option>
                <option value="C5">C5 (High Grade)</option>
                <option value="C4">C4 (Good Grade)</option>
                <option value="H1">H1 (Harvest Grade)</option>
                <option value="H2">H2 (Harvest Grade)</option>
                <option value="H3">H3 (Harvest Grade)</option>
                <option value="H4">H4 (Harvest Grade)</option>
                <option value="M5">M5 (Medium Grade)</option>
                <option value="M4">M4 (Medium Grade)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
              <select
                name="supplier"
                value={filters.supplier}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
              >
                <option value="">All Suppliers</option>
                {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (LKR)</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
                placeholder="Min price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (LKR)</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
                placeholder="Max price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
                placeholder="Search location"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-lg text-gray-700 font-medium">
            Found {filteredMaterials.length} materials available
          </p>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6 text-gray-400">📦</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Materials Found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => {
              const supplierId = typeof material.supplier === 'string' ? material.supplier : material.supplier?._id;
              const supplierName = material.supplier?.name || getSupplierName(supplierId);
              const supplierDisplayName = supplierName === 'Unknown Supplier' ? '' : supplierName;

              return (
                <div key={material._id} className="bg-white rounded-2xl shadow-xl border border-amber-100 hover:shadow-2xl hover:border-amber-200 transition-all duration-200">
                  <div className="relative">
                    <div className="w-full aspect-square bg-white rounded-t-2xl overflow-hidden flex items-center justify-center">
                      {material.materialPhoto ? (
                        <img
                          src={`http://localhost:5000/uploads/${material.materialPhoto}`}
                          alt="Raw Material"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-4xl text-amber-400">📦</div>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border shadow-sm ${getQualityBadgeColor(material.quality)}`}>
                        {material.quality}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        Available
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {supplierDisplayName ? supplierDisplayName.charAt(0) : 'S'}
                        </div>
                        <div>
                          {supplierDisplayName && (
                            <h3 className="text-lg font-semibold text-gray-900">
                              {supplierDisplayName}
                            </h3>
                          )}
                          <p className="text-gray-600 text-sm">{material.location || 'Location not specified'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                        <div className="text-sm font-medium text-gray-700 mb-1">Available</div>
                        <p className="text-xl font-semibold text-gray-900">{Number(material.quantity || 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                        <div className="text-sm font-medium text-gray-700 mb-1">Price per kg</div>
                        <p className="text-xl font-semibold text-gray-900">LKR {Number(material.pricePerKg || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Link
                        to={`/wholesale/product/${material._id}`}
                        className="block w-full text-center text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                        style={{ backgroundColor: '#c5a35a' }}
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WholesalePage;