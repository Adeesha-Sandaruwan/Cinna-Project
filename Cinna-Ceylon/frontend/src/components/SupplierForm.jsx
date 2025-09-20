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
  Users,
  Building,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  RefreshCw
} from 'lucide-react';

const SupplierForm = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    address: ''
  });

  // API base URL - replace with your actual backend URL
  const API_BASE = 'http://localhost:5000/api/suppliers';

  // Load suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Supplier name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Supplier name must be at least 2 characters';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.contact && !isValidPhone(formData.contact)) {
      errors.contact = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation helper
  const isValidPhone = (phone) => {
    const phoneRegex = /^[+]?[\d\s\-()]+$/;
    return phoneRegex.test(phone) && phone.length >= 10;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    setFormErrors({});

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
          fetchSuppliers();
          setSuccessMessage('Supplier updated successfully!');
        } else {
          throw new Error('Failed to update supplier');
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
          fetchSuppliers();
          setSuccessMessage('Supplier created successfully!');
        } else {
          throw new Error('Failed to create supplier');
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving supplier:', error);
      setFormErrors({ submit: 'Failed to save supplier. Please try again.' });
      resetForm();
    } finally {
      setSubmitting(false);
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
    setFormErrors({});
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
          fetchSuppliers();
          setSuccessMessage('Supplier deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setFormData({ name: '', contact: '', email: '', address: '' });
    setFormErrors({});
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
    supplier.contact?.includes(searchTerm) ||
    supplier.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-600 absolute top-0"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Supplier Management
              </h1>
              <p className="text-gray-600 text-lg">Manage your business partners and suppliers with ease</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">{suppliers.length} Total Suppliers</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="w-5 h-5" />
                  <span className="font-semibold">Active Partners</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => fetchSuppliers()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-3 transition-colors shadow-md"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg flex items-center gap-3 transition-colors shadow-md"
              >
                <Plus className="w-6 h-6" />
                Add New Supplier
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md border p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search suppliers by name, email, contact, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg placeholder-gray-400"
            />
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full border">
              {/* Form Header */}
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingSupplier ? 'Edit Supplier' : 'New Supplier'}
                </h2>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {/* Form Error Message */}
                {formErrors.submit && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-700 text-sm">{formErrors.submit}</span>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Supplier Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none transition-colors ${
                        formErrors.name 
                          ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
                      }`}
                      placeholder="Enter supplier company name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Contact Number Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={formData.contact}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none transition-colors ${
                        formErrors.contact 
                          ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
                      }`}
                      placeholder="+94 77 123 4567"
                    />
                    {formErrors.contact && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.contact}</p>
                    )}
                  </div>

                  {/* Email Address Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none transition-colors ${
                        formErrors.email 
                          ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
                      }`}
                      placeholder="supplier@company.com"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Address Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors resize-none"
                      rows="3"
                      placeholder="Enter complete business address"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors font-medium"
                    >
                      {submitting 
                        ? 'Saving...' 
                        : editingSupplier 
                          ? 'Update Supplier' 
                          : 'Create Supplier'
                      }
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={submitting}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-md transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Suppliers Grid */}
        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
          <div className="bg-gray-800 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Building className="w-7 h-7" />
              Supplier Directory
            </h2>
            <p className="text-gray-300 mt-2 text-lg">Manage all your business partners in one place</p>
          </div>

          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {searchTerm ? 'No suppliers found' : 'No suppliers yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Add your first supplier to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md font-semibold"
                >
                  Add First Supplier
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-8">
              {filteredSuppliers.map((supplier) => (
                <div 
                  key={supplier._id} 
                  className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-600 rounded-lg text-white">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
                        title="Edit Supplier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier._id)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                        title="Delete Supplier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {supplier.name}
                    </h3>
                    
                    {supplier.contact && (
                      <div className="flex items-center gap-3 text-gray-600 bg-green-50 rounded-lg p-3">
                        <Phone className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">{supplier.contact}</span>
                      </div>
                    )}
                    
                    {supplier.email && (
                      <div className="flex items-center gap-3 text-gray-600 bg-orange-50 rounded-lg p-3">
                        <Mail className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium truncate">{supplier.email}</span>
                      </div>
                    )}
                    
                    {supplier.address && (
                      <div className="flex items-start gap-3 text-gray-600 bg-red-50 rounded-lg p-3">
                        <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium leading-relaxed">{supplier.address}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">
                          Added {formatDate(supplier.createdAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          {supplier.email && <div className="w-2 h-2 bg-orange-400 rounded-full"></div>}
                          {supplier.contact && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                          {supplier.address && <div className="w-2 h-2 bg-red-400 rounded-full"></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white rounded-lg px-6 py-3 shadow-md border">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-gray-700 font-semibold">
              {filteredSuppliers.length} of {suppliers.length} suppliers
            </span>
            {searchTerm && (
              <span className="text-blue-600 font-medium">
                (filtered)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierForm;
