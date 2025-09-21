import React, { useState } from 'react';

const RawMaterialForm = ({ supplierId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    supplier: supplierId,
    materialPhoto: null,
    quantity: '',
    quality: '',
    description: '',
    pricePerKg: '',
    harvestDate: '',
    location: '',
    moistureContent: '',
    processingMethod: '',
    visibility: 'public'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      materialPhoto: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch('http://localhost:5000/api/raw-materials', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create raw material');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-amber-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-amber-800">Add New Raw Material</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Material Photo */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              Material Photo *
            </label>
            <input
              type="file"
              name="materialPhoto"
              onChange={handleImageChange}
              accept="image/*"
              required
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              Quantity (kg) *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0.1"
              step="0.1"
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
              placeholder="Enter quantity in kg"
            />
          </div>

          {/* Quality */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              Quality *
            </label>
            <select
              name="quality"
              value={formData.quality}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
            >
              <option value="">Select Quality</option>
              <option value="ALBA">ALBA</option>
              <option value="C5">C5</option>
              <option value="C4">C4</option>
              <option value="H1">H1</option>
              <option value="H2">H2</option>
              <option value="H3">H3</option>
              <option value="H4">H4</option>
              <option value="M5">M5</option>
              <option value="M4">M4</option>
            </select>
          </div>

          {/* Price per kg */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              Price per kg (LKR) *
            </label>
            <input
              type="number"
              name="pricePerKg"
              value={formData.pricePerKg}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
              placeholder="Enter price per kg"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
              placeholder="Enter location"
            />
          </div>

          {/* Harvest Date */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              Harvest Date
            </label>
            <input
              type="date"
              name="harvestDate"
              value={formData.harvestDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
            />
          </div>

          {/* Moisture Content */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              Moisture Content (%)
            </label>
            <input
              type="number"
              name="moistureContent"
              value={formData.moistureContent}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
              placeholder="Enter moisture content"
            />
          </div>

          {/* Processing Method */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              Processing Method
            </label>
            <select
              name="processingMethod"
              value={formData.processingMethod}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
            >
              <option value="">Select Method</option>
              <option value="Traditional">Traditional</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              Visibility
            </label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-amber-800 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 resize-none"
            placeholder="Enter material description"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-all duration-200 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Raw Material'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RawMaterialForm;
