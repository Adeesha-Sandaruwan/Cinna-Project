import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { safeRequest, isOk } from '../../utils/api';

// Simple utility to format currency (fallback to raw number if invalid)
const fmt = (v) => {
  if (typeof v !== 'number') return v;
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
};

export default function BuyerDashboard() {
  const { user } = useAuth();
  const userId = user?._id || user?.id || user?.user?._id; // fallback patterns
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [prodError, setProdError] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const { addToCart } = useCart?.() || {}; // optional chaining in case context shape differs
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError('');
    safeRequest(`/api/orders/user/${userId}`)
      .then(({ res, data }) => {
        if (!isOk(res)) throw new Error(data?.message || data?.error || 'Failed to load orders');
        if (!Array.isArray(data)) throw new Error('Unexpected orders response');
        setOrders(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  // Fetch a small list of products for quick start shopping (public, non-expired already enforced server-side)
  useEffect(() => {
    setLoadingProducts(true);
    setProdError('');
    safeRequest('/api/products')
      .then(({ res, data }) => {
        if (!isOk(res)) throw new Error(data?.message || data?.error || 'Failed to load products');
        if (!Array.isArray(data)) throw new Error('Unexpected products response');
        // Take first 6 newest products for a concise display
        setProducts(data.slice(0, 6));
      })
      .catch(e => setProdError(e.message))
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (addToCart) {
      try {
        addToCart(product, 1);
      } catch (e) {
        console.error('Add to cart failed', e);
      }
    } else {
      // Fallback: navigate to product page
      navigate(`/products/${product._id}`);
    }
  };

  const totalOrders = orders.length;
  const pending = orders.filter(o => o.status === 'pending').length;
  const paid = orders.filter(o => o.status === 'paid').length;
  const lastOrder = orders[0];
  const totalSpent = orders.reduce((sum, o) => sum + (typeof o.total === 'number' ? o.total : 0), 0);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Buyer Dashboard</h1>
          <p className="text-gray-600 text-sm md:text-base mt-1">Welcome{user?.username ? `, ${user.username}` : ''}! Track your orders & explore products.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/products" className="px-4 py-2 bg-[#8B4513] text-white rounded-lg text-sm hover:bg-[#A0522D] transition">Browse Products</Link>
          <Link to="/cart" className="px-4 py-2 bg-yellow-500 text-black rounded-lg text-sm hover:bg-yellow-400 transition">View Cart</Link>
          <Link to="/buyer-offers" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500 transition">Special Offers</Link>
          <Link to="/profile" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300 transition">Profile</Link>
        </div>
      </div>

      {/* Start Shopping Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Start Shopping</h2>
          <Link to="/products" className="text-sm text-[#8B4513] hover:underline">View All</Link>
        </div>
        {loadingProducts && (
          <div className="text-sm text-gray-500">Loading products...</div>
        )}
        {prodError && !loadingProducts && (
          <div className="text-sm text-red-600">{prodError}</div>
        )}
        {!loadingProducts && !prodError && products.length === 0 && (
          <div className="text-sm text-gray-500">No products available yet.</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition"
            >
              <div className="w-full aspect-square bg-white flex items-center justify-center">
                <img
                  src={`http://localhost:5000/uploads/${product.image}`}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x400/f5efe6/cc7722?text=Product";
                  }}
                />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 text-center line-clamp-2">{product.name}</h3>
                {typeof product.price === 'number' && (
                  <p className="text-md font-bold mb-3 text-center text-[#CC7722]">
                    LKR {product.price.toLocaleString()}
                  </p>
                )}
                <div className="mt-auto">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full text-white py-2 rounded-lg hover:opacity-90 transition"
                    style={{ backgroundColor: '#c5a35a' }}
                  >Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
