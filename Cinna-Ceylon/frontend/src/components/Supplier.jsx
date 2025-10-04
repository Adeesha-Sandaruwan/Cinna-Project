import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  Users,
  Building
} from 'lucide-react';

const Supplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    address: ''
  });

  // API base URL - replace with your actual backend URL
  const API_BASE = 'http://localhost:3000/api/suppliers';

  // Mock data for demonstration
  const mockSuppliers = [
    {
      _id: '1',
      name: 'Ceylon Spice Co.',
      contact: '+94 77 123 4567',
      email: 'info@ceylonspice.lk',
      address: 'No. 123, Galle Road, Colombo 03',
      createdAt: '2025-08-30T10:00:00Z'
    },
    {
      _id: '2',
      name: 'Tropical Tea Exports',
      contact: '+94 71 987 6543',
      email: 'exports@tropicaltea.com',
      address: 'Tea Estate, Nuwara Eliya',
      createdAt: '2025-08-28T14:30:00Z'
    },
    {
      _id: '3',
      name: 'Cinnamon Valley Ltd.',
      contact: '+94 76 555 0123',
      email: 'sales@cinnamonvalley.lk',
      address: 'Spice Gardens, Matale',
      createdAt: '2025-08-29T09:15:00Z'
    },
    {
      _id: '4',
      name: 'Golden Coconut Industries',
      contact: '+94 72 444 8888',
      email: 'contact@goldencoconut.lk',
      address: 'Coconut Triangle, Kurunegala',
      createdAt: '2025-08-27T16:45:00Z'
    }
  ];

  // Load suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Fetch all suppliers from backend
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      // Fallback to mock data for demo
      setSuppliers(mockSuppliers);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for create/update
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      alert('Supplier name is required');
      return;
    }

    try {
      if (editingSupplier) {
        // Update existing supplier
        const response = await fetch(`${API_BASE}/${editingSupplier._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const updatedSupplier = await response.json();
          setSuppliers(prev => 
            prev.map(supplier => supplier._id === editingSupplier._id ? updatedSupplier : supplier)
          );
        }
      } else {
        // Create new supplier
        const response = await fetch(API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const newSupplier = await response.json();
          setSuppliers(prev => [newSupplier, ...prev]);
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving supplier:', error);
      // Fallback for demo - update local state
      if (editingSupplier) {
        const updatedSupplier = { ...editingSupplier, ...formData };
        setSuppliers(prev => 
          prev.map(supplier => supplier._id === editingSupplier._id ? updatedSupplier : supplier)
        );
      } else {
        const newSupplier = {
          _id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString()
        };
        setSuppliers(prev => [newSupplier, ...prev]);
      }
      resetForm();
    }
  };

  // Handle editing a supplier
  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact || '',
      email: supplier.email || '',
      address: supplier.address || ''
    });
    setShowForm(true);
  };

  // Handle deleting a supplier
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        const response = await fetch(`${API_BASE}/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSuppliers(prev => prev.filter(supplier => supplier._id !== id));
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
        // Fallback for demo - update local state
        setSuppliers(prev => prev.filter(supplier => supplier._id !== id));
      }
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setFormData({ name: '', contact: '', email: '', address: '' });
    setShowForm(false);
    setEditingSupplier(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact?.includes(searchTerm)
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-purple-200"></div>
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-purple-600 absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Supplier Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your business partners and suppliers</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-6 h-6" />
              Add New Supplier
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search suppliers by name, email, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300">
              <Filter className="w-5 h-5" />
              Filter
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-purple-100">
              <div className="p-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Building2 className="inline w-4 h-4 mr-2" />
                      Supplier Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter supplier name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Phone className="inline w-4 h-4 mr-2" />
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={formData.contact}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="+94 77 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Mail className="inline w-4 h-4 mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                      placeholder="supplier@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <MapPin className="inline w-4 h-4 mr-2" />
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      rows="3"
                      placeholder="Enter full address"
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-6 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-3 px-6 rounded-xl transition-all duration-300 font-semibold"
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
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Suppliers</p>
                <p className="text-3xl font-bold">{suppliers.length}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <Building2 className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">With Email</p>
                <p className="text-3xl font-bold">
                  {suppliers.filter(s => s.email && s.email.trim()).length}
                </p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <Mail className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">With Contact</p>
                <p className="text-3xl font-bold">
                  {suppliers.filter(s => s.contact && s.contact.trim()).length}
                </p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <Phone className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Complete Profiles</p>
                <p className="text-3xl font-bold">
                  {suppliers.filter(s => s.name && s.email && s.contact && s.address).length}
                </p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Building className="w-7 h-7" />
              Supplier Directory
            </h2>
          </div>

          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {searchTerm ? 'No suppliers found' : 'No suppliers yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Add your first supplier to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Add First Supplier
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
              {filteredSuppliers.map((supplier) => (
                <div 
                  key={supplier._id} 
                  className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-102"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl text-white">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                        title="Edit Supplier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier._id)}
                        className="p-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                        title="Delete Supplier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 truncate">
                      {supplier.name}
                    </h3>
                    
                    {supplier.contact && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{supplier.contact}</span>
                      </div>
                    )}
                    
                    {supplier.email && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="text-sm truncate">{supplier.email}</span>
                      </div>
                    )}
                    
                    {supplier.address && (
                      <div className="flex items-start gap-3 text-gray-600">
                        <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                        <span className="text-sm line-clamp-2">{supplier.address}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        Added {formatDate(supplier.createdAt)}
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
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-gray-700 font-medium">
              {filteredSuppliers.length} of {suppliers.length} suppliers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Supplier;