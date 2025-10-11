import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const WholesaleProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Build a robust image URL regardless of how the path is stored
  const getImageUrl = (p) => {
    const raw = p?.materialPhoto || p?.image || p?.photo || p?.materialImage;
    if (!raw || typeof raw !== 'string') return null;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    // Extract filename from any path (handles windows/backslashes too)
    const basename = raw.split(/[\\\/]+/).filter(Boolean).pop();
    if (!basename) return null;
    return `http://localhost:5000/uploads/${basename}`;
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/raw-materials');
      if (res.ok) {
        const data = await res.json();
        const availableProducts = data.filter(
          product => product.status === 'available' && product.visibility === 'public'
        );
        setProducts(availableProducts);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading products...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Header />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">🌿</span>
            <h1 className="text-4xl md:text-5xl font-bold">Raw Cinnamon Products</h1>
          </div>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto">
            Premium Ceylon Cinnamon Raw Materials - Directly from Sri Lankan Suppliers
          </p>
        </div>
      </div>
      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Products Available</h3>
            <p className="text-gray-600">Check back later for new products</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-amber-100"
              >
                {/* Product Image (match ProductList sizing) */}
                <div className="relative">
                  <div className="w-full aspect-square bg-white flex items-center justify-center">
                    {(() => {
                      const img = getImageUrl(product);
                      if (!img) {
                        return (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl text-amber-400">🌿</span>
                          </div>
                        );
                      }
                      return (
                        <img
                          src={img}
                          alt={product.materialName || product.quality || 'Cinnamon Product'}
                          className="max-h-full max-w-full object-contain"
                        />
                      );
                    })()}
                  </div>
                  {/* Quality Badge */}
                  {product.quality && (
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold shadow-md">
                        {product.quality}
                      </span>
                    </div>
                  )}
                </div>
                {/* Product Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                    {product.materialName || product.quality || 'Cinnamon Raw Material'}
                  </h3>
                  <p className="text-2xl font-bold text-[#8B4513] text-center mb-4">
                    LKR {product.pricePerKg ? product.pricePerKg.toLocaleString() : '0'}
                  </p>
                  {/* View Product Button */}
                  <button
                    onClick={() => navigate(`/wholesale/product/${product._id}`)}
                    className="w-full text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    style={{ backgroundColor: '#c5a35a' }}
                  >
                    View Product
                  </button>

                  {/* Contact info and buttons are hidden on listing; available on product detail page */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default WholesaleProductsPage;
