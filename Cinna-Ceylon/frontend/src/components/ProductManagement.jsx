import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

const COLORS = {
  RICH_GOLD: '#c5a35a',
  DEEP_CINNAMON: '#CC7722',
  WARM_BEIGE: '#F5EFE6',
  DARK_SLATE: '#2d2d2d',
  SOFT_WHITE: '#FCFBF8',
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage('❌ Error loading products');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || product.type === filterType;
    return matchesSearch && matchesType;
  });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Handle edit
  const handleEdit = (product) => {
    setEditingProduct({ ...product });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      Object.keys(editingProduct).forEach(key => {
        if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
          formData.append(key, editingProduct[key]);
        }
      });

      const response = await fetch(`http://localhost:5000/api/products/${editingProduct._id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        setMessage('✅ Product updated successfully!');
        fetchProducts();
        setEditingProduct(null);
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error updating product: ${error.message}`);
    }
  };

  // Handle delete
  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('✅ Product deleted successfully!');
        fetchProducts();
      } else {
        setMessage('❌ Error deleting product');
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get stock status
  const getStockStatus = (stock) => {
    if (stock <= 5) return { text: 'Low', color: 'text-red-600' };
    if (stock <= 20) return { text: 'Medium', color: 'text-yellow-600' };
    return { text: 'Good', color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: COLORS.SOFT_WHITE }} className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: COLORS.DEEP_CINNAMON }}></div>
            <p className="mt-4" style={{ color: COLORS.DARK_SLATE }}>Loading products...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: COLORS.SOFT_WHITE }} className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 
                className="text-3xl font-bold"
                style={{ color: COLORS.DARK_SLATE, fontFamily: "'Cormorant Garamond', serif" }}
              >
                🍂 Product Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your cinnamon products inventory
              </p>
            </div>
            <Link
              to="/product_form"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition transform hover:scale-105"
              style={{ backgroundColor: COLORS.RICH_GOLD }}
            >
              <PlusIcon className="w-5 h-5" />
              Add New Product
            </Link>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={message.includes('✅') ? 'text-green-800' : 'text-red-800'}>{message}</p>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="spice">Spice</option>
              <option value="powder">Powder</option>
              <option value="other">Other</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-end text-gray-600">
              {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: COLORS.WARM_BEIGE }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.DARK_SLATE }}>
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.DARK_SLATE }}>
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.DARK_SLATE }}>
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.DARK_SLATE }}>
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.DARK_SLATE }}>
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.DARK_SLATE }}>
                    Expiry
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: COLORS.DARK_SLATE }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold" style={{ color: COLORS.DARK_SLATE }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.grade} Grade</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.sku || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {product.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold" style={{ color: COLORS.RICH_GOLD }}>
                      LKR {product.price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(product.expiryDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatus(product.stock).color} bg-opacity-10`}>
                        {getStockStatus(product.stock).text}
                      </span>
                    </td>
                                         <td className="px-6 py-4">
                       <div className="flex items-center justify-center space-x-2">
                         <button
                           onClick={() => handleEdit(product)}
                           className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                           title="Edit"
                         >
                           <PencilIcon className="w-5 h-5" />
                         </button>
                         <button
                           onClick={() => handleDelete(product)}
                           className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                           title="Delete"
                         >
                           <TrashIcon className="w-5 h-5" />
                         </button>
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {currentProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first product.'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <Link
                  to="/product_form"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: COLORS.RICH_GOLD }}
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Product
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm border rounded-lg ${
                    currentPage === page
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.DARK_SLATE }}>
                Edit Product: {editingProduct.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={editingProduct.type}
                      onChange={(e) => setEditingProduct({...editingProduct, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                    >
                      <option value="spice">Spice</option>
                      <option value="powder">Powder</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                    <select
                      value={editingProduct.grade}
                      onChange={(e) => setEditingProduct({...editingProduct, grade: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                    >
                      <option value="A">Grade A</option>
                      <option value="B">Grade B</option>
                      <option value="C">Grade C</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editingProduct.expiryDate ? new Date(editingProduct.expiryDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingProduct({...editingProduct, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-white rounded-lg font-medium"
                  style={{ backgroundColor: COLORS.RICH_GOLD }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Product
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductManagement;
