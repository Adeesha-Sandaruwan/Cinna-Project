import React, { useState, useEffect } from 'react';

const OfferForm = ({ offer, products, onClose, onSave }) => {
  // formData holds all form fields for offer creation/editing
  const [formData, setFormData] = useState({
    name: offer?.name || '', // Offer name
    description: offer?.description || '', // Offer description
    products: offer?.products?.map(p => p._id) || [], // Array of product IDs
    discountedPrice: offer?.discountedPrice || '', // Discounted bundle price
    expiryDate: offer?.expiryDate ? new Date(offer.expiryDate).toISOString().split('T')[0] : '', // Expiry date
    status: offer?.status || 'Active', // Offer status
    image: offer?.image || '' // Custom image URL
  });

  const [selectedProducts, setSelectedProducts] = useState(offer?.products || []);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Calculate total price of selected products
  const totalPrice = selectedProducts.reduce((sum, product) => sum + product.price, 0);

  useEffect(() => {
    if (offer) {
      setSelectedProducts(offer.products || []);
    }
  }, [offer]);

  /**
   * Validates the offer form fields before submit.
   * Checks for required fields, price logic, and expiry date rules.
   * Returns true if valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Offer name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.discountedPrice || formData.discountedPrice <= 0) {
      newErrors.discountedPrice = 'Discounted price must be greater than 0';
    }
    if (selectedProducts.length === 0) {
      newErrors.products = 'At least one product is required';
    }

    // Discounted price must be less than total price
    if (formData.discountedPrice && totalPrice > 0 && formData.discountedPrice >= totalPrice) {
      newErrors.discountedPrice = 'Discounted price must be less than the total price';
    }

    // Expiry date must be in the future for active offers
    if (formData.status === 'Active' && formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= new Date()) {
        newErrors.expiryDate = 'Expiry date must be in the future for active offers';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Adds a selected product to the offer bundle.
   * Clears products error if any.
   */
  const handleProductSelect = (productId) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      const updatedProducts = [...selectedProducts, product];
      setSelectedProducts(updatedProducts);
      setFormData({...formData, products: updatedProducts.map(p => p._id)});

      // Clear products error if any
      if (errors.products) {
        setErrors({...errors, products: ''});
      }
    }
  };

  /**
   * Removes a product from the offer bundle by product ID.
   */
  const removeProduct = (productId) => {
    const updatedProducts = selectedProducts.filter(p => p._id !== productId);
    setSelectedProducts(updatedProducts);
    setFormData({...formData, products: updatedProducts.map(p => p._id)});
  };

  /**
   * Handles input field changes in the offer form.
   * Clears error for the edited field.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({...errors, [name]: ''});
    }
  };

  // Handle form submit for create/update offer
  /**
   * Handles form submission for creating or updating an offer.
   * Validates the form, sends API request, and handles errors.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const url = offer ? `http://localhost:5000/api/offers/${offer._id}` : 'http://localhost:5000/api/offers';
      const method = offer ? 'PUT' : 'POST';

      // Prepare data for API - include full product data for images
      const apiData = {
        ...formData,
        discountedPrice: parseFloat(formData.discountedPrice),
        products: selectedProducts // Send full product objects, not just IDs
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${offer ? 'update' : 'create'} offer`);
      }

      onSave();
    } catch (err) {
      console.error('Error saving offer:', err);
      setErrors({...errors, submit: err.message});
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Returns the correct image path for a product or offer image.
   * Handles local and remote images.
   */
  const getImagePath = (image) => {
    if (!image) return '';
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
      return image;
    }
    return `http://localhost:5000/uploads/${image}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {offer ? 'Edit Offer' : 'Create New Offer'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Name *</label>
                <input
                  type="text"
                  name="name"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price (LKR) *</label>
                <input
                  type="number"
                  name="discountedPrice"
                  min="1"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    errors.discountedPrice ? 'border-red-500' : ''
                  }`}
                  value={formData.discountedPrice}
                  onChange={handleInputChange}
                />
                {errors.discountedPrice && <p className="text-red-500 text-xs mt-1">{errors.discountedPrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                <input
                  type="date"
                  name="expiryDate"
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    errors.expiryDate ? 'border-red-500' : ''
                  }`}
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
                {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  rows="3"
                  name="description"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    errors.description ? 'border-red-500' : ''
                  }`}
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Offer Image URL (Optional)</label>
                <input
                  type="url"
                  name="image"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">If not provided, product images will be used automatically</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Add Products to Bundle *</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 mb-2"
                  onChange={(e) => handleProductSelect(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Select a product</option>
                  {products.filter(p => !selectedProducts.some(sp => sp._id === p._id)).map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} - LKR {product.price.toLocaleString()}
                    </option>
                  ))}
                </select>
                {errors.products && <p className="text-red-500 text-xs mt-1">{errors.products}</p>}

                {selectedProducts.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Selected Products:</h4>
                    <ul className="space-y-2">
                      {selectedProducts.map(product => (
                        <li key={product._id} className="flex justify-between items-center bg-white p-2 rounded">
                          <div className="flex items-center">
                            {product.image && (
                              <img 
                                src={getImagePath(product.image)}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded mr-3"
                                onError={(e) => {
                                  e.target.src = `https://via.placeholder.com/40/CC7722/ffffff?text=${product.name.charAt(0)}`;
                                }}
                              />
                            )}
                            <span>{product.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-amber-600 font-medium mr-4">LKR {product.price.toLocaleString()}</span>
                            <button 
                              type="button"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeProduct(product._id)}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <div className="flex justify-between font-medium">
                        <span>Total Original Price:</span>
                        <span>LKR {totalPrice.toLocaleString()}</span>
                      </div>
                      {formData.discountedPrice && (
                        <>
                          <div className="flex justify-between text-green-600">
                            <span>Discounted Price:</span>
                            <span>LKR {parseFloat(formData.discountedPrice).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-amber-600">
                            <span>You Save:</span>
                            <span>LKR {(totalPrice - parseFloat(formData.discountedPrice)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-blue-600">
                            <span>Discount Percentage:</span>
                            <span>{Math.round(((totalPrice - parseFloat(formData.discountedPrice)) / totalPrice) * 100)}%</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (offer ? 'Update Offer' : 'Create Offer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OfferForm;