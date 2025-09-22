import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const RawMaterialPage = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
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
        navigate(`/supplier-dashboard/${supplierId}`);
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-emerald-800 mb-4">
            🌿 Add Raw Material
          </h1>
          <p className="text-emerald-600 text-xl">
            Add your premium cinnamon raw materials to the marketplace
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-emerald-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Material Photo */}
              <div className="md:col-span-2">
                <label className="block text-lg font-bold text-emerald-800 mb-3">
                  📸 Material Photo *
                </label>
                <input
                  type="file"
                  name="materialPhoto"
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                  className="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-lg font-bold text-emerald-800 mb-3">
                  ⚖️ Quantity (kg) *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0.1"
                  step="0.1"
                  className="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-lg"
                  placeholder="Enter quantity in kg"
                />
              </div>

              {/* Quality */}
              <div>
                <label className="block text-lg font-bold text-emerald-800 mb-3">
                  ⭐ Quality Grade *
                </label>
                <select
                  name="quality"
                  value={formData.quality}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-lg"
                >
                  <option value="">Select Quality Grade</option>
                  <option value="ALBA">🌟 ALBA (Premium)</option>
                  <option value="C5">⭐ C5 (High Grade)</option>
                  <option value="C4">✨ C4 (Good Grade)</option>
                  <option value="H1">🌿 H1 (Harvest Grade)</option>
                  <option value="H2">🌱 H2 (Harvest Grade)</option>
                  <option value="H3">🍃 H3 (Harvest Grade)</option>
                  <option value="H4">🌾 H4 (Harvest Grade)</option>
                  <option value="M5">🔥 M5 (Medium Grade)</option>
                  <option value="M4">💫 M4 (Medium Grade)</option>
                </select>
              </div>

              {/* Price per kg */}
              <div>
                <label className="block text-lg font-bold text-emerald-800 mb-3">
                  💰 Price per kg (LKR) *
                </label>
                <input
                  type="number"
                  name="pricePerKg"
                  value={formData.pricePerKg}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-lg"
                  placeholder="Enter price per kg"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-lg font-bold text-emerald-800 mb-3">
                  📍 Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-lg"
                  placeholder="Enter location"
                />
              </div>

              {/* Harvest Date */}
              <div>
                <label className="block text-lg font-bold text-emerald-800 mb-3">
                  🌾 Harvest Date
                </label>
                <input
                  type="date"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-lg"
                />
              </div>

              {/* Moisture Content */}
              <div>
                <label className="block text-lg font-bold text-emerald-800 mb-3">
                  💧 Moisture Content (%)
                </label>
                <input
                  type="number"
                  name="moistureContent"
                  value={formData.moistureContent}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-lg"
                  placeholder="Enter moisture content"
                />
              </div>

              {/* Processing Method */}
              <div>
                <label className="block text-lg font-bold text-emerald-800 mb-3">
                  ⚙️ Processing Method
                </label>
                <select
                  name="processingMethod"
                  value={formData.processingMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-lg"
                >
                  <option value="">Select Processing Method</option>
                  <option value="Traditional">🏺 Traditional</option>
                  <option value="Mechanical">⚡ Mechanical</option>
                  <option value="Mixed">🔄 Mixed</option>
                </select>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-lg font-bold text-emerald-800 mb-3">
                  👁️ Visibility
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-lg"
                >
                  <option value="public">🌐 Public</option>
                  <option value="private">🔒 Private</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-lg font-bold text-emerald-800 mb-3">
                📝 Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-4 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 resize-none text-lg"
                placeholder="Describe your raw material (quality, aroma, special features, etc.)"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-xl text-lg">
                ❌ {error}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-6 pt-6">
              <button
                type="button"
                onClick={() => navigate(`/supplier-dashboard/${supplierId}`)}
                className="flex-1 px-8 py-4 border-2 border-emerald-300 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all duration-200 font-bold text-lg"
              >
                ← Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Adding...' : '✅ Add Raw Material'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-emerald-600">
          <p className="text-lg">🌿 Premium Cinnamon Raw Materials for Global Market</p>
        </div>
      </div>
    </div>
  );
};

export default RawMaterialPage;
