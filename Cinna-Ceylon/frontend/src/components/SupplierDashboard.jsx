// SupplierDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Plus, User, Phone, Mail, MapPin, Package, Star, Upload, Eye, Edit, Trash2, Calendar } from 'lucide-react';

const SupplierDashboard = ({ supplierId }) => {
  const [supplier, setSupplier] = useState({
    name: '',
    contactNumber: '',
    email: '',
    address: '',
    profileImage: null
  });
  
  const [items, setItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    materialPhoto: null,
    quantity: '',
    quality: '',
    description: '',
    pricePerKg: '',
    harvestDate: '',
    location: '',
    moistureContent: '',
    processingMethod: ''
  });

  // Cinnamon quality grades with descriptions
  const cinnamonGrades = [
    { value: 'ALBA', label: 'ALBA (Finest Quality)', description: 'Finest grade, very thin bark, light yellow color' },
    { value: 'C5', label: 'C5 Special', description: 'High quality, thin bark, good aroma' },
    { value: 'C4', label: 'C4', description: 'Good quality, medium thickness' },
    { value: 'H1', label: 'H1', description: 'Broken pieces, good quality fragments' },
    { value: 'H2', label: 'H2', description: 'Medium quality broken pieces' },
    { value: 'H3', label: 'H3', description: 'Standard quality fragments' },
    { value: 'H4', label: 'H4', description: 'Lower grade fragments' },
    { value: 'M5', label: 'M5', description: 'Thick bark grade' },
    { value: 'M4', label: 'M4', description: 'Very thick bark grade' }
  ];

  // Handle supplier profile update
  const handleSupplierUpdate = (field, value) => {
    setSupplier(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file upload for supplier profile
  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleSupplierUpdate('profileImage', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle item image upload
  const handleItemImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const targetForm = showEditForm ? 'editingItem' : 'newItem';
        if (showEditForm) {
          setEditingItem(prev => ({
            ...prev,
            materialPhoto: e.target.result
          }));
        } else {
          setNewItem(prev => ({
            ...prev,
            materialPhoto: e.target.result
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new item
  const handleAddItem = () => {
    if (newItem.materialPhoto && newItem.quantity && newItem.quality) {
      const item = {
        id: Date.now(),
        ...newItem,
        addedDate: new Date().toISOString().split('T')[0],
        supplier: supplier
      };
      setItems(prev => [...prev, item]);
      resetNewItemForm();
      setShowAddForm(false);
    }
  };

  // Edit item
  const handleEditItem = (item) => {
    setEditingItem({ ...item });
    setShowEditForm(true);
  };

  // Update item
  const handleUpdateItem = () => {
    if (editingItem.materialPhoto && editingItem.quantity && editingItem.quality) {
      setItems(prev => prev.map(item => 
        item.id === editingItem.id ? editingItem : item
      ));
      setShowEditForm(false);
      setEditingItem(null);
    }
  };

  // Delete item
  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Reset new item form
  const resetNewItemForm = () => {
    setNewItem({
      materialPhoto: null,
      quantity: '',
      quality: '',
      description: '',
      pricePerKg: '',
      harvestDate: '',
      location: '',
      moistureContent: '',
      processingMethod: ''
    });
  };

  // Get quality grade info
  const getQualityInfo = (quality) => {
    return cinnamonGrades.find(grade => grade.value === quality) || { label: quality, description: '' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1>
              <p className="text-gray-600">Manage your cinnamon inventory and profile</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md"
            >
              <Plus size={20} />
              Add New Item
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-amber-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{items.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {items.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0)} kg
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Premium Items</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {items.filter(item => ['ALBA', 'C5', 'C4'].includes(item.quality)).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Grid */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Cinnamon Inventory Records</h2>
                <span className="text-sm text-gray-500">{items.length} items recorded</span>
              </div>
              
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items recorded yet</h3>
                  <p className="text-gray-500 mb-4">Start by adding your first cinnamon batch to track your inventory.</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
                  >
                    Add Your First Item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                  {items.map(item => {
                    const qualityInfo = getQualityInfo(item.quality);
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
                        <div className="aspect-w-16 aspect-h-12 mb-4">
                          <img
                            src={item.materialPhoto}
                            alt="Cinnamon material"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          {/* Quality Grade */}
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                {qualityInfo.label}
                              </span>
                              {qualityInfo.description && (
                                <p className="text-xs text-gray-500 mt-1">{qualityInfo.description}</p>
                              )}
                            </div>
                          </div>

                          {/* Quantity and Price */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Quantity</p>
                              <p className="font-semibold text-gray-900">{item.quantity} kg</p>
                            </div>
                            {item.pricePerKg && (
                              <div>
                                <p className="text-sm text-gray-600">Price/kg</p>
                                <p className="font-semibold text-green-600">${item.pricePerKg}</p>
                              </div>
                            )}
                          </div>

                          {/* Additional Details */}
                          {item.moistureContent && (
                            <div>
                              <p className="text-sm text-gray-600">Moisture Content</p>
                              <p className="text-sm text-gray-900">{item.moistureContent}%</p>
                            </div>
                          )}

                          {item.location && (
                            <div>
                              <p className="text-sm text-gray-600">Harvest Location</p>
                              <p className="text-sm text-gray-900">{item.location}</p>
                            </div>
                          )}

                          {item.harvestDate && (
                            <div>
                              <p className="text-sm text-gray-600">Harvest Date</p>
                              <p className="text-sm text-gray-900">{new Date(item.harvestDate).toLocaleDateString()}</p>
                            </div>
                          )}

                          {item.description && (
                            <div>
                              <p className="text-sm text-gray-600">Description</p>
                              <p className="text-sm text-gray-900">{item.description}</p>
                            </div>
                          )}

                          <div className="text-xs text-gray-500 pt-2 border-t">
                            Added: {new Date(item.addedDate).toLocaleDateString()}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4">
                            <button 
                              onClick={() => handleEditItem(item)}
                              className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded text-sm hover:bg-blue-100 flex items-center justify-center gap-1 transition-colors"
                            >
                              <Edit size={14} />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded text-sm hover:bg-red-100 flex items-center justify-center gap-1 transition-colors"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Supplier Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Profile</h3>
              
              {/* Profile Image */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {supplier.profileImage ? (
                    <img
                      src={supplier.profileImage}
                      alt="Supplier Profile"
                      className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-amber-100"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto border-4 border-gray-100">
                      <User size={32} className="text-gray-400" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-amber-600 rounded-full p-2 cursor-pointer hover:bg-amber-700 shadow-lg">
                    <Upload size={12} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Supplier Details Form */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-1" />
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    value={supplier.name}
                    onChange={(e) => handleSupplierUpdate('name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-1" />
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={supplier.contactNumber}
                    onChange={(e) => handleSupplierUpdate('contactNumber', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="+94 XX XXX XXXX"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={supplier.email}
                    onChange={(e) => handleSupplierUpdate('email', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="supplier@example.com"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    Address
                  </label>
                  <textarea
                    value={supplier.address}
                    onChange={(e) => handleSupplierUpdate('address', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter your full address"
                  />
                </div>
              </div>

              {/* Profile Summary */}
              {(supplier.name || supplier.contactNumber || supplier.email) && (
                <div className="bg-amber-50 p-4 rounded-lg mt-6">
                  <h4 className="font-medium text-amber-800 mb-3">Profile Summary</h4>
                  {supplier.name && (
                    <p className="text-sm text-amber-700 mb-1">📋 {supplier.name}</p>
                  )}
                  {supplier.contactNumber && (
                    <p className="text-sm text-amber-700 mb-1">📞 {supplier.contactNumber}</p>
                  )}
                  {supplier.email && (
                    <p className="text-sm text-amber-700 mb-1">✉️ {supplier.email}</p>
                  )}
                  {supplier.address && (
                    <p className="text-sm text-amber-700 mb-1">📍 {supplier.address}</p>
                  )}
                  <div className="border-t border-amber-200 pt-2 mt-2">
                    <p className="text-xs text-amber-600">Total Items: {items.length}</p>
                    <p className="text-xs text-amber-600">
                      Total Stock: {items.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0)} kg
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddForm && (
        <ItemFormModal
          title="Add New Cinnamon Item"
          item={newItem}
          setItem={setNewItem}
          onSave={handleAddItem}
          onClose={() => {
            setShowAddForm(false);
            resetNewItemForm();
          }}
          onImageUpload={handleItemImageUpload}
          cinnamonGrades={cinnamonGrades}
        />
      )}

      {/* Edit Item Modal */}
      {showEditForm && editingItem && (
        <ItemFormModal
          title="Edit Cinnamon Item"
          item={editingItem}
          setItem={setEditingItem}
          onSave={handleUpdateItem}
          onClose={() => {
            setShowEditForm(false);
            setEditingItem(null);
          }}
          onImageUpload={handleItemImageUpload}
          cinnamonGrades={cinnamonGrades}
        />
      )}
    </div>
  );
};

// Item Form Modal Component
const ItemFormModal = ({ title, item, setItem, onSave, onClose, onImageUpload, cinnamonGrades }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Material Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Photo *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {item.materialPhoto ? (
                    <div className="relative">
                      <img
                        src={item.materialPhoto}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg mb-2"
                      />
                      <button
                        type="button"
                        onClick={() => setItem(prev => ({...prev, materialPhoto: null}))}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Click to upload cinnamon photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={item.quantity}
                  onChange={(e) => setItem(prev => ({...prev, quantity: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter quantity in kg"
                />
              </div>

              {/* Quality Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality Grade *
                </label>
                <select
                  value={item.quality}
                  onChange={(e) => setItem(prev => ({...prev, quality: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select quality grade</option>
                  {cinnamonGrades.map(grade => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </select>
                {item.quality && (
                  <p className="text-xs text-gray-500 mt-1">
                    {cinnamonGrades.find(g => g.value === item.quality)?.description}
                  </p>
                )}
              </div>

              {/* Price per kg */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per kg ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={item.pricePerKg}
                  onChange={(e) => setItem(prev => ({...prev, pricePerKg: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter price per kg"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Harvest Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harvest Date
                </label>
                <input
                  type="date"
                  value={item.harvestDate}
                  onChange={(e) => setItem(prev => ({...prev, harvestDate: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harvest Location
                </label>
                <input
                  type="text"
                  value={item.location}
                  onChange={(e) => setItem(prev => ({...prev, location: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Matale, Kandy"
                />
              </div>

              {/* Moisture Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moisture Content (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  max="100"
                  value={item.moistureContent}
                  onChange={(e) => setItem(prev => ({...prev, moistureContent: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter moisture percentage"
                />
              </div>

              {/* Processing Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Method
                </label>
                <select
                  value={item.processingMethod}
                  onChange={(e) => setItem(prev => ({...prev, processingMethod: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select processing method</option>
                  <option value="Traditional">Traditional Sun Drying</option>
                  <option value="Mechanical">Mechanical Drying</option>
                  <option value="Mixed">Mixed Method</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={item.description}
                  onChange={(e) => setItem(prev => ({...prev, description: e.target.value}))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Additional details about the cinnamon batch..."
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={!item.materialPhoto || !item.quantity || !item.quality}
              className="flex-1 bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {title.includes('Edit') ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;