import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Calendar, 
  Scale, 
  Star, 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  Building2,
  TrendingUp,
  BarChart3,
  CheckCircle
} from 'lucide-react';

const SupplyRecord = () => {
  const [supplyRecords, setSupplyRecords] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    quality: ''
  });

  // API base URLs
  const RECORDS_API = 'http://localhost:3000/api/supply-records';
  const SUPPLIERS_API = 'http://localhost:3000/api/suppliers';

  // Mock data for demonstration
  const mockSuppliers = [
    { _id: '1', name: 'Ceylon Spice Co.' },
    { _id: '2', name: 'Tropical Tea Exports' },
    { _id: '3', name: 'Cinnamon Valley Ltd.' },
    { _id: '4', name: 'Golden Coconut Industries' }
  ];

  const mockSupplyRecords = [
    {
      _id: '1',
      supplier: { _id: '1', name: 'Ceylon Spice Co.' },
      date: '2025-08-30',
      quantity: 500,
      quality: 'Premium',
      createdAt: '2025-08-30T10:00:00Z'
    },
    {
      _id: '2',
      supplier: { _id: '2', name: 'Tropical Tea Exports' },
      date: '2025-08-29',
      quantity: 250,
      quality: 'Standard',
      createdAt: '2025-08-29T14:30:00Z'
    },
    {
      _id: '3',
      supplier: { _id: '3', name: 'Cinnamon Valley Ltd.' },
      date: '2025-08-28',
      quantity: 750,
      quality: 'Premium',
      createdAt: '2025-08-28T09:15:00Z'
    },
    {
      _id: '4',
      supplier: { _id: '4', name: 'Golden Coconut Industries' },
      date: '2025-08-27',
      quantity: 300,
      quality: 'Good',
      createdAt: '2025-08-27T16:45:00Z'
    }
  ];

  // Load data on component mount
  useEffect(() => {
    fetchSuppliers();
    fetchSupplyRecords();
  }, []);

  // Fetch all suppliers
  const fetchSuppliers = async () => {
    try {
      const response = await fetch(SUPPLIERS_API);
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers(mockSuppliers);
    }
  };

  // Fetch all supply records
  const fetchSupplyRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(RECORDS_API);
      if (!response.ok) throw new Error('Failed to fetch supply records');
      const data = await response.json();
      setSupplyRecords(data);
    } catch (error) {
      console.error('Error fetching supply records:', error);
      setSupplyRecords(mockSupplyRecords);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Basic validation
    if (!formData.supplier || !formData.quantity) {
      alert('Supplier and quantity are required');
      return;
    }

    try {
      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity)
      };

      if (editingRecord) {
        // Update existing record
        const response = await fetch(`${RECORDS_API}/${editingRecord._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });

        if (response.ok) {
          const updatedRecord = await response.json();
          setSupplyRecords(prev => 
            prev.map(record => record._id === editingRecord._id ? {
              ...updatedRecord,
              supplier: suppliers.find(s => s._id === updatedRecord.supplier) || updatedRecord.supplier
            } : record)
          );
        }
      } else {
        // Create new record
        const response = await fetch(RECORDS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });

        if (response.ok) {
          const newRecord = await response.json();
          setSupplyRecords(prev => [{
            ...newRecord,
            supplier: suppliers.find(s => s._id === newRecord.supplier) || newRecord.supplier
          }, ...prev]);
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving supply record:', error);
      // Fallback for demo
      if (editingRecord) {
        const updatedRecord = { 
          ...editingRecord, 
          ...formData,
          supplier: suppliers.find(s => s._id === formData.supplier) || editingRecord.supplier,
          quantity: parseFloat(formData.quantity)
        };
        setSupplyRecords(prev => 
          prev.map(record => record._id === editingRecord._id ? updatedRecord : record)
        );
      } else {
        const newRecord = {
          _id: Date.now().toString(),
          ...formData,
          supplier: suppliers.find(s => s._id === formData.supplier),
          quantity: parseFloat(formData.quantity),
          createdAt: new Date().toISOString()
        };
        setSupplyRecords(prev => [newRecord, ...prev]);
      }
      resetForm();
    }
  };

  // Handle editing a record
  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      supplier: record.supplier._id || record.supplier,
      date: record.date.split('T')[0],
      quantity: record.quantity.toString(),
      quality: record.quality || ''
    });
    setShowForm(true);
  };

  // Handle deleting a record
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supply record?')) {
      try {
        const response = await fetch(`${RECORDS_API}/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSupplyRecords(prev => prev.filter(record => record._id !== id));
        }
      } catch (error) {
        console.error('Error deleting supply record:', error);
        setSupplyRecords(prev => prev.filter(record => record._id !== id));
      }
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setFormData({ 
      supplier: '', 
      date: new Date().toISOString().split('T')[0], 
      quantity: '', 
      quality: '' 
    });
    setShowForm(false);
    setEditingRecord(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get quality badge color
  const getQualityColor = (quality) => {
    switch (quality?.toLowerCase()) {
      case 'premium': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'good': return 'bg-gradient-to-r from-green-400 to-green-500 text-white';
      case 'standard': return 'bg-gradient-to-r from-blue-400 to-blue-500 text-white';
      case 'poor': return 'bg-gradient-to-r from-red-400 to-red-500 text-white';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };

  // Filter records based on search term
  const filteredRecords = supplyRecords.filter(record =>
    record.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.quality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.quantity?.toString().includes(searchTerm)
  );

  // Calculate statistics
  const totalQuantity = supplyRecords.reduce((sum, record) => sum + (record.quantity || 0), 0);
  const premiumRecords = supplyRecords.filter(record => record.quality?.toLowerCase() === 'premium').length;
  const avgQuantity = supplyRecords.length > 0 ? (totalQuantity / supplyRecords.length).toFixed(1) : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-indigo-200"></div>
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-indigo-600 absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Supply Records Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Track and manage supplier deliveries and quality</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-6 h-6" />
              Add Supply Record
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by supplier, quality, or quantity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-indigo-100">
              <div className="p-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
                  {editingRecord ? 'Edit Supply Record' : 'Add New Supply Record'}
                </h2>
                
                <div className="space-y-6">
                  {/* Supplier Selection */}
                  <div className="transform transition-all duration-300 hover:scale-102">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Building2 className="inline w-4 h-4 mr-2 text-indigo-600" />
                      Supplier *
                    </label>
                    <select
                      required
                      value={formData.supplier}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <option value="">Select a supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Field */}
                  <div className="transform transition-all duration-300 hover:scale-102">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Calendar className="inline w-4 h-4 mr-2 text-purple-600" />
                      Supply Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>

                  {/* Quantity Field */}
                  <div className="transform transition-all duration-300 hover:scale-102">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Scale className="inline w-4 h-4 mr-2 text-green-600" />
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Enter quantity (kg, units, etc.)"
                    />
                  </div>

                  {/* Quality Field */}
                  <div className="transform transition-all duration-300 hover:scale-102">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Star className="inline w-4 h-4 mr-2 text-yellow-600" />
                      Quality Grade
                    </label>
                    <select
                      value={formData.quality}
                      onChange={(e) => setFormData(prev => ({ ...prev, quality: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <option value="">Select quality grade</option>
                      <option value="Premium">Premium</option>
                      <option value="Good">Good</option>
                      <option value="Standard">Standard</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {editingRecord ? 'Update Record' : 'Create Record'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-3 px-6 rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Total Records</p>
                <p className="text-3xl font-bold">{supplyRecords.length}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <Package className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Quantity</p>
                <p className="text-3xl font-bold">{totalQuantity.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">Premium Quality</p>
                <p className="text-3xl font-bold">{premiumRecords}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <Star className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Avg Quantity</p>
                <p className="text-3xl font-bold">{avgQuantity}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <BarChart3 className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Supply Records Grid */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Package className="w-7 h-7" />
              Supply Records Directory
            </h2>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {searchTerm ? 'No records found' : 'No supply records yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Add your first supply record to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Add First Record
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
              {filteredRecords.map((record) => (
                <div 
                  key={record._id} 
                  className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-102 hover:border-indigo-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl text-white">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleEdit(record)}
                        className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                        title="Edit Record"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="p-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                      {record.supplier?.name || 'Unknown Supplier'}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">{formatDate(record.date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-600">
                      <Scale className="w-4 h-4 text-green-500" />
                      <span className="text-lg font-bold text-gray-900">
                        {record.quantity?.toLocaleString()} units
                      </span>
                    </div>
                    
                    {record.quality && (
                      <div className="flex items-center gap-3">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getQualityColor(record.quality)}`}>
                          {record.quality}
                        </span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        Recorded {formatDate(record.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-xl px-6 py-3 shadow-md border border-gray-100">
            <Package className="w-5 h-5 text-indigo-600" />
            <span className="text-gray-700 font-medium">
              {filteredRecords.length} of {supplyRecords.length} records
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyRecord;