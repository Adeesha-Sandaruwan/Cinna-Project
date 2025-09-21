import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const WholesalePage = () => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
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
  }, [rawMaterials, filters]);

  const fetchData = async () => {
    try {
      const [materialsRes, suppliersRes] = await Promise.all([
        fetch('http://localhost:5000/api/raw-materials'),
        fetch('http://localhost:5000/api/suppliers')
      ]);

      if (materialsRes.ok) {
        const materialsData = await materialsRes.json();
        setRawMaterials(materialsData);
      }

      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = rawMaterials.filter(material => {
      return (
        material.status === 'available' &&
        material.visibility === 'public' &&
        (!filters.quality || material.quality === filters.quality) &&
        (!filters.supplier || material.supplier._id === filters.supplier) &&
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

  const handleWhatsAppContact = (supplier) => {
    if (supplier.whatsappNumber) {
      const message = `Hello ${supplier.name}, I'm interested in your ${supplier.quality} grade cinnamon. Can we discuss pricing and availability?`;
      const whatsappUrl = `https://wa.me/${supplier.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('WhatsApp number not available for this supplier');
    }
  };

  const getQualityColor = (quality) => {
    switch (quality?.toLowerCase()) {
      case 'alba':
        return 'bg-yellow-100 text-yellow-800';
      case 'c5':
        return 'bg-green-100 text-green-800';
      case 'c4':
        return 'bg-blue-100 text-blue-800';
      case 'h1':
        return 'bg-purple-100 text-purple-800';
      case 'h2':
        return 'bg-indigo-100 text-indigo-800';
      case 'h3':
        return 'bg-pink-100 text-pink-800';
      case 'h4':
        return 'bg-red-100 text-red-800';
      case 'm5':
        return 'bg-orange-100 text-orange-800';
      case 'm4':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityEmoji = (quality) => {
    switch (quality?.toLowerCase()) {
      case 'alba':
        return '⭐';
      case 'c5':
        return '🌟';
      case 'c4':
        return '✨';
      case 'h1':
        return '💎';
      case 'h2':
        return '🔸';
      case 'h3':
        return '🔹';
      case 'h4':
        return '🔺';
      case 'm5':
        return '🔶';
      case 'm4':
        return '🔷';
      default:
        return '📦';
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Wholesale Marketplace</h1>
            <p className="text-xl text-gray-600 mb-6">Premium Cinnamon Raw Materials from Trusted Suppliers</p>
            <div className="bg-gray-100 rounded-lg p-6 max-w-4xl mx-auto">
              <p className="text-gray-700">Discover the finest quality cinnamon from certified suppliers across Sri Lanka</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Filter Materials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quality Grade</label>
              <select
                name="quality"
                value={filters.quality}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search location"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-lg text-gray-700 font-medium">
            Found {filteredMaterials.length} materials available
          </p>
        </div>

        {/* Materials Grid */}
        {filteredMaterials.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6 text-gray-400">📦</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Materials Found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <div key={material._id} className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-200">
                {/* Material Image */}
                <div className="relative h-48 bg-gray-100 rounded-t-lg">
                  {material.materialPhoto ? (
                    <img
                      src={`http://localhost:5000/uploads/${material.materialPhoto}`}
                      alt="Raw Material"
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-4xl text-gray-400">📦</div>
                    </div>
                  )}
                  
                  {/* Quality Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getQualityBadgeColor(material.quality)}`}>
                      {material.quality}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                      Available
                    </span>
                  </div>
                </div>

                {/* Material Details */}
                <div className="p-6">
                  {/* Supplier Info */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {material.supplier?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {material.supplier?.name || 'Unknown Supplier'}
                        </h3>
                        <p className="text-gray-600 text-sm">{material.location || 'Location not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Material Type & Quality */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Material Type:</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                        Cinnamon Raw Material
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Quality Grade:</span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getQualityColor(material.quality)}`}>
                        {material.quality}
                      </span>
                    </div>
                  </div>

                  {/* Available Quantity & Pricing */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <div className="text-sm font-medium text-gray-700 mb-1">Available</div>
                      <p className="text-xl font-semibold text-gray-900">{material.quantity} kg</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <div className="text-sm font-medium text-gray-700 mb-1">Price per kg</div>
                      <p className="text-xl font-semibold text-gray-900">LKR {material.pricePerKg}</p>
                    </div>
                  </div>

                  {/* Total Value */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Total Value</span>
                      <span className="text-xl font-semibold text-gray-900">
                        LKR {(material.quantity * material.pricePerKg).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-2 mb-6">
                    {material.harvestDate && (
                      <div className="flex justify-between items-center bg-gray-50 rounded p-2">
                        <span className="text-sm text-gray-600">Harvest Date:</span>
                        <span className="text-sm font-medium text-gray-900">{new Date(material.harvestDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {material.moistureContent && (
                      <div className="flex justify-between items-center bg-gray-50 rounded p-2">
                        <span className="text-sm text-gray-600">Moisture Content:</span>
                        <span className="text-sm font-medium text-gray-900">{material.moistureContent}%</span>
                      </div>
                    )}
                    {material.processingMethod && (
                      <div className="flex justify-between items-center bg-gray-50 rounded p-2">
                        <span className="text-sm text-gray-600">Processing Method:</span>
                        <span className="text-sm font-medium text-gray-900">{material.processingMethod}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {material.description && (
                    <div className="mb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Description</div>
                        <p className="text-sm text-gray-600">{material.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                    <div className="text-sm font-medium text-gray-700 mb-3">Supplier Contact</div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Phone:</span> {material.supplier?.contactNumber || 'Not available'}
                      </p>
                      {material.supplier?.whatsappNumber && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">WhatsApp:</span> {material.supplier.whatsappNumber}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {material.supplier?.email || 'Not available'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleWhatsAppContact(material.supplier)}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
                    >
                      <span>Contact Supplier</span>
                    </button>
                    <button
                      onClick={() => window.open(`https://wa.me/${material.supplier?.contactNumber?.replace(/[^0-9]/g, '')}`, '_blank')}
                      className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 font-medium"
                      title="Call Supplier"
                    >
                      Call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WholesalePage;