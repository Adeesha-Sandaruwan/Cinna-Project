import React, { useState, useEffect } from 'react';
import './RawMaterialForm.css';

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
  const [touched, setTouched] = useState({});
  const [previewUrl, setPreviewUrl] = useState('');
  const [supplierDetails, setSupplierDetails] = useState(null);
  const [showSupplier, setShowSupplier] = useState(false);

  useEffect(() => {
    const fetchSupplierDetails = async () => {
      if (!supplierId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/suppliers/${supplierId}`);
        if (response.ok) {
          const data = await response.json();
          setSupplierDetails(data);
        } else {
          console.error('Failed to fetch supplier details');
        }
      } catch (error) {
        console.error('Error fetching supplier details:', error);
      }
    };

    fetchSupplierDetails();
  }, [supplierId]);

  const validate = (data) => {
    const errors = {};
    if (!data.materialPhoto) errors.materialPhoto = 'Material photo is required';
    if (!data.quantity || Number(data.quantity) <= 0) errors.quantity = 'Enter a valid quantity';
    if (!data.quality) errors.quality = 'Please select quality';
    if (!data.pricePerKg || Number(data.pricePerKg) < 0) errors.pricePerKg = 'Enter a valid price';
    if (data.moistureContent !== '' && (Number(data.moistureContent) < 0 || Number(data.moistureContent) > 100)) errors.moistureContent = 'Must be between 0 and 100';
    if (data.harvestDate && new Date(data.harvestDate) > new Date()) errors.harvestDate = 'Harvest date cannot be in the future';
    if (data.description && data.description.length > 1000) errors.description = 'Description too long (max 1000 chars)';
    if (data.description && !/^[A-Za-z0-9\s,.]+$/.test(data.description)) errors.description = 'Use only letters, numbers, spaces, comma and full stop';
    if (data.location && !/^[A-Za-z0-9\s,.]+$/.test(data.location)) errors.location = 'Location may contain letters, numbers, spaces, comma and full stop only';
    return errors;
  };

  const errors = validate(formData);
  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'location' || name === 'description') {
      v = value.replace(/[^A-Za-z0-9\s,.]/g, '');
    }
    setFormData(prev => ({
      ...prev,
      [name]: v
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setFormData(prev => ({
      ...prev,
      materialPhoto: file || null
    }));
    setTouched(prev => ({ ...prev, materialPhoto: true }));
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, materialPhoto: file }));
      setTouched(prev => ({ ...prev, materialPhoto: true }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      materialPhoto: true,
      quantity: true,
      quality: true,
      pricePerKg: true,
      moistureContent: true,
      harvestDate: true,
      description: true,
      location: true
    });
    const currentErrors = validate(formData);
    if (Object.keys(currentErrors).length > 0) {
      setError('Please fix the errors in the form');
      return;
    }

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
    <div className="rmf rounded-2xl border shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-cinnamon-700 to-cocoa-700 px-6 py-5 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Add Raw Material</h3>
          <p className="text-sm text-cinnamon-100">Provide details about your raw material listing.</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-white/80 hover:text-white text-2xl leading-none"
        >
          ×
        </button>
      </div>
      <div className="p-6 bg-cinnamon-50/40">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section divider */}
          <div className="hidden md:block h-px bg-cinnamon-100 mb-2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-cocoa-800 mb-2">Material Photo<span className="text-red-500"> *</span></label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`rmf-dropzone relative border-2 ${touched.materialPhoto && errors.materialPhoto ? 'border-red-300' : 'border-dashed border-cinnamon-200 hover:border-cinnamon-300'} rounded-xl p-4 md:p-6 flex items-center gap-4 bg-cinnamon-50/50 transition-colors duration-200`}
              >
                <div className="flex-1">
                  <p className="text-sm text-cocoa-800 font-medium">Drag & drop an image here, or</p>
                  <p className="text-sm text-cinnamon-700">click to browse</p>
                  <input
                    type="file"
                    name="materialPhoto"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <p className="text-xs text-cocoa-600 mt-2">Supported formats: JPG, PNG. Max size ~5MB.</p>
                </div>
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border border-cinnamon-100 flex items-center justify-center transition-shadow duration-200 hover:shadow-md">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🖼️</span>
                  )}
                </div>
              </div>
              {touched.materialPhoto && errors.materialPhoto && (
                <div className="text-sm text-red-600 mt-2">{errors.materialPhoto}</div>
              )}
              {previewUrl && (
                <div className="mt-3 text-sm text-gray-600 flex items-center justify-between">
                  <span className="truncate mr-2">{formData.materialPhoto?.name}</span>
                  <span className="text-gray-500">
                    {formData.materialPhoto ? `${Math.round(formData.materialPhoto.size / 1024)} KB` : ''}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cocoa-800 mb-2">Quantity (kg) <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                onBlur={handleBlur}
                min="0.1"
                step="0.1"
                placeholder="e.g. 50"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 placeholder-cocoa-400 transition-all duration-150 ${touched.quantity && errors.quantity ? 'border-red-300 focus:ring-red-200' : 'border-cinnamon-200 focus:ring-cinnamon-100 focus:border-cinnamon-300'}`}
              />
              <p className="text-xs text-cocoa-600 mt-1">Enter net available weight in kilograms.</p>
              {touched.quantity && errors.quantity && <div className="text-sm text-red-600 mt-1">{errors.quantity}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-cocoa-800 mb-2">Quality <span className="text-red-500">*</span></label>
              <select
                name="quality"
                value={formData.quality}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-150 ${touched.quality && errors.quality ? 'border-red-300 focus:ring-red-200' : 'border-cinnamon-200 focus:ring-cinnamon-100 focus:border-cinnamon-300'}`}
              >
                <option value="">Select quality</option>
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
              {touched.quality && errors.quality && <div className="text-sm text-red-600 mt-1">{errors.quality}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-cocoa-800 mb-2">Price per kg (LKR) <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="pricePerKg"
                value={formData.pricePerKg}
                onChange={handleChange}
                onBlur={handleBlur}
                min="0"
                step="0.01"
                placeholder="e.g. 450.00"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 placeholder-cocoa-400 transition-all duration-150 ${touched.pricePerKg && errors.pricePerKg ? 'border-red-300 focus:ring-red-200' : 'border-cinnamon-200 focus:ring-cinnamon-100 focus:border-cinnamon-300'}`}
              />
              <p className="text-xs text-cocoa-600 mt-1">Set your selling price per kilogram.</p>
              {touched.pricePerKg && errors.pricePerKg && <div className="text-sm text-red-600 mt-1">{errors.pricePerKg}</div>}
            </div>

            {/* Total value preview */}
            <div className="md:col-span-2">
              <div className="mt-1 p-4 rounded-xl border border-cinnamon-100 bg-cinnamon-50/60 flex items-center justify-between">
                <div>
                  <p className="text-sm text-cocoa-800">Estimated total value</p>
                  <p className="text-xs text-cocoa-600">Calculated as quantity × price per kg</p>
                </div>
                <div className="text-lg font-bold text-cinnamon-800">
                  {(() => {
                    const qty = parseFloat(formData.quantity || 0);
                    const price = parseFloat(formData.pricePerKg || 0);
                    const total = isNaN(qty) || isNaN(price) ? 0 : qty * price;
                    return `LKR ${total.toFixed(2)}`;
                  })()}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-cocoa-800 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Town / Region"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 placeholder-cocoa-400 transition-all duration-150 ${touched.location && errors.location ? 'border-red-300 focus:ring-red-200' : 'border-cinnamon-200 focus:ring-cinnamon-100 focus:border-cinnamon-300'}`}
              />
              <p className="text-xs text-cocoa-600 mt-1">Town or region where the material is available.</p>
              {touched.location && errors.location && (
                <div className="text-sm text-red-600 mt-1">{errors.location}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cocoa-800 mb-2">Harvest Date</label>
              <input
                type="date"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                onBlur={handleBlur}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-150 ${touched.harvestDate && errors.harvestDate ? 'border-red-300 focus:ring-red-200' : 'border-cinnamon-200 focus:ring-cinnamon-100 focus:border-cinnamon-300'}`}
              />
              {touched.harvestDate && errors.harvestDate && <div className="text-sm text-red-600 mt-1">{errors.harvestDate}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-cocoa-800 mb-2">Moisture Content (%)</label>
              <input
                type="number"
                name="moistureContent"
                value={formData.moistureContent}
                onChange={handleChange}
                onBlur={handleBlur}
                min="0"
                max="100"
                step="0.1"
                placeholder="e.g. 7.5"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 placeholder-cocoa-400 transition-all duration-150 ${touched.moistureContent && errors.moistureContent ? 'border-red-300 focus:ring-red-200' : 'border-cinnamon-200 focus:ring-cinnamon-100 focus:border-cinnamon-300'}`}
              />
              {touched.moistureContent && errors.moistureContent && <div className="text-sm text-red-600 mt-1">{errors.moistureContent}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-cocoa-800 mb-2">Processing Method</label>
              <select
                name="processingMethod"
                value={formData.processingMethod}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-cinnamon-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnamon-100 transition-all duration-150 focus:border-cinnamon-300"
              >
                <option value="">Select method (optional)</option>
                <option value="Traditional">Traditional</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-cocoa-800 mb-2">Visibility</label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-cinnamon-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnamon-100 transition-all duration-150 focus:border-cinnamon-300"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-cocoa-800 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={4}
              placeholder="Short description (optional, up to 1000 characters)"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 placeholder-cocoa-400 transition-all duration-150 ${touched.description && errors.description ? 'border-red-300 focus:ring-red-200' : 'border-cinnamon-200 focus:ring-cinnamon-100 focus:border-cinnamon-300'}`}
            />
            {touched.description && errors.description && <div className="text-sm text-red-600 mt-1">{errors.description}</div>}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {supplierDetails && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <button type="button" onClick={() => setShowSupplier(!showSupplier)} className="font-semibold text-cinnamon-800 mb-2">
                {showSupplier ? 'Hide' : 'View'} Supplier Details
              </button>
              {showSupplier && (
                <div>
                  <p><strong>Name:</strong> {supplierDetails.name}</p>
                  <p><strong>Email:</strong> {supplierDetails.email}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 sticky bottom-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-cinnamon-100 py-4 px-2 -mx-2 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-cinnamon-200 rounded-lg text-sm font-medium text-cocoa-800 hover:bg-cinnamon-50 transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`rmf-submit px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors duration-150 ${loading ? 'bg-cinnamon-300' : 'bg-cinnamon-700 hover:bg-cinnamon-800'}`}
            >
              {loading ? 'Adding...' : 'Add Raw Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RawMaterialForm;