import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './RawMaterialList.css';

const RawMaterialList = ({ rawMaterials, onEdit, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (material) => {
    toast.info('Opening raw material for update...');
    setEditingId(material._id);
    setEditForm({
      quantity: material.quantity,
      pricePerKg: material.pricePerKg,
      description: material.description || '',
      location: material.location || '',
      moistureContent: material.moistureContent || '',
      processingMethod: material.processingMethod || '',
      visibility: material.visibility || 'public'
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'location' || name === 'description') {
      v = value.replace(/[^A-Za-z0-9\s,.]/g, '');
    }
    setEditForm(prev => ({
      ...prev,
      [name]: v
    }));
  };

  const validateEdit = (data) => {
    if (!data.quantity || Number(data.quantity) <= 0) return 'Enter a valid quantity';
    if (data.pricePerKg === '' || Number(data.pricePerKg) < 0) return 'Enter a valid price per kg';
    if (data.location && !/^[A-Za-z0-9\s,.]+$/.test(data.location)) return 'Location may contain letters, numbers, spaces, comma and full stop only';
    if (data.description && !/^[A-Za-z0-9\s,.]+$/.test(data.description)) return 'Use only letters, numbers, spaces, comma and full stop';
    return '';
  };

  const handleEditSubmit = async (id) => {
    try {
      const msg = validateEdit(editForm);
      if (msg) {
        toast.error(msg);
        return;
      }
      const response = await fetch(`http://localhost:5000/api/raw-materials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        setEditingId(null);
        onEdit();
        toast.success('Raw material updated');
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.error || 'Failed to update raw material');
      }
    } catch (err) {
      console.error('Error updating raw material:', err);
      toast.error('Network error while updating');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this raw material?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/raw-materials/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          onDelete();
        }
      } catch (err) {
        console.error('Error deleting raw material:', err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityColor = (quality) => {
    const colors = {
      'ALBA': 'bg-purple-100 text-purple-800',
      'C5': 'bg-blue-100 text-blue-800',
      'C4': 'bg-indigo-100 text-indigo-800',
      'H1': 'bg-green-100 text-green-800',
      'H2': 'bg-emerald-100 text-emerald-800',
      'H3': 'bg-teal-100 text-teal-800',
      'H4': 'bg-cyan-100 text-cyan-800',
      'M5': 'bg-orange-100 text-orange-800',
      'M4': 'bg-amber-100 text-amber-800'
    };
    return colors[quality] || 'bg-gray-100 text-gray-800';
  };

  if (rawMaterials.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌿</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Raw Materials</h3>
        <p className="text-gray-500">Start by adding your first raw material to get started.</p>
      </div>
    );
  }

  return (
    <div className="rml space-y-4">
      {rawMaterials.map((material) => (
        <div key={material._id} className="rml-card bg-white border border-amber-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          {editingId === material._id ? (
            // Edit Form
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-amber-800 mb-2">
                    Quantity (kg)
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={editForm.quantity}
                    onChange={handleEditChange}
                    min="0.1"
                    step="0.1"
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-800 mb-2">
                    Price per kg (LKR)
                  </label>
                  <input
                    type="number"
                    name="pricePerKg"
                    value={editForm.pricePerKg}
                    onChange={handleEditChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-800 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-800 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:border-amber-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditSubmit(material._id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Display Mode
            <div className="flex items-start justify-between">
              <div className="flex space-x-4">
                {/* Material Image */}
                <div className="flex-shrink-0">
                  {material.materialPhoto ? (
                    <img
                      src={`http://localhost:5000/uploads/${material.materialPhoto}`}
                      alt="Raw Material"
                      className="w-20 h-20 rounded-lg object-cover border border-amber-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-amber-100 flex items-center justify-center">
                      <span className="text-2xl">🌿</span>
                    </div>
                  )}
                </div>

                {/* Material Details */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`rml-badge px-2 py-1 rounded-full text-xs font-semibold ${getQualityColor(material.quality)}`}>
                      {material.quality}
                    </span>
                    <span className={`rml-badge px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(material.status)}`}>
                      {material.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Quantity:</span>
                      <p className="font-semibold text-amber-800">{Number(material.quantity || 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <p className="font-semibold text-amber-800">LKR {Number(material.pricePerKg || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/kg</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Value:</span>
                      <p className="font-semibold text-amber-800">LKR {Number((Number(material.quantity || 0) * Number(material.pricePerKg || 0)) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="font-semibold text-amber-800">{material.location || 'N/A'}</p>
                    </div>
                  </div>

                  {material.description && (
                    <div className="mt-2">
                      <span className="text-gray-600 text-sm">Description:</span>
                      <p className="text-sm text-gray-700">{material.description}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    {material.harvestDate && (
                      <span>Harvested: {new Date(material.harvestDate).toLocaleDateString()}</span>
                    )}
                    {material.moistureContent && (
                      <span>Moisture: {material.moistureContent}%</span>
                    )}
                    {material.processingMethod && (
                      <span>Method: {material.processingMethod}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(material)}
                  className="px-3 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(material._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RawMaterialList;
