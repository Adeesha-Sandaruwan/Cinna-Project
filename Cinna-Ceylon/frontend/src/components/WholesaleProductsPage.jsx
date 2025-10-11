import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const WholesaleProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierNameCache, setSupplierNameCache] = useState({});

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [materialsRes, suppliersRes] = await Promise.all([
        fetch('http://localhost:5000/api/raw-materials'),
        fetch('http://localhost:5000/api/suppliers'),
      ]);

      if (materialsRes.ok) {
        const data = await materialsRes.json();
        const availableProducts = data.filter(
          product => product.status === 'available' && product.visibility === 'public'
        );
        setProducts(availableProducts);
      }

      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData);
        const initialCache = (Array.isArray(suppliersData) ? suppliersData : []).reduce((acc, s) => {
          if (s && s._id) acc[s._id] = s.name || 'Unknown Supplier';
          return acc;
        }, {});
        setSupplierNameCache(initialCache);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSupplierName = (supplierId) => {
    if (!supplierId) return 'Unknown Supplier';
    if (supplierNameCache[supplierId]) return supplierNameCache[supplierId];
    const supplier = suppliers.find(s => s._id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
  };

  useEffect(() => {
    if (!products.length) return;
    const ids = Array.from(new Set(
      products
        .map(p => (typeof p.supplier === 'string' ? p.supplier : p.supplier?._id))
        .filter(id => id && !supplierNameCache[id])
    ));
    if (!ids.length) return;
    Promise.all(
      ids.map(id => fetch(`http://localhost:5000/api/suppliers/${id}`).then(r => (r.ok ? r.json() : null)))
    )
      .then(list => {
        const add = {};
        list.filter(Boolean).forEach(s => {
          if (s && s._id) add[s._id] = s.name || 'Unknown Supplier';
        });
        if (Object.keys(add).length) setSupplierNameCache(prev => ({ ...prev, ...add }));
      })
      .catch(() => {});
  }, [products, suppliers]);

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
            {products.map((product) => {
              const supplierId = typeof product.supplier === 'string' ? product.supplier : product.supplier?._id;
              const supplierName = product.supplier?.name || getSupplierName(supplierId);
              const supplierDisplayName = supplierName === 'Unknown Supplier' ? '' : supplierName;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-amber-100"
                >
                  {/* Product Image */}
                  <div className="relative">
                    <div className="w-full aspect-square bg-white flex items-center justify-center">
                      {product.materialPhoto ? (
                        <img
                          src={`http://localhost:5000/uploads/${product.materialPhoto}`}
                          alt={product.materialName || product.quality || 'Cinnamon Product'}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl text-amber-400">🌿</span>
                        </div>
                      )}
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
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {supplierDisplayName ? supplierDisplayName.charAt(0) : 'S'}
                      </div>
                      <div>
                        {supplierDisplayName && (
                          <h3 className="text-md font-semibold text-gray-800">
                            {supplierDisplayName}
                          </h3>
                        )}
                        <p className="text-xs text-gray-500">{product.location || 'Sri Lanka'}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#8B4513] text-center mb-4">
                      LKR {Number(product.pricePerKg || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-sm font-normal text-gray-500">/kg</span>
                    </p>
                    {/* View Product Button */}
                    <button
                      onClick={() => navigate(`/wholesale/product/${product._id}`)}
                      className="w-full text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                      style={{ backgroundColor: '#c5a35a' }}
                    >
                      View Product
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default WholesaleProductsPage;