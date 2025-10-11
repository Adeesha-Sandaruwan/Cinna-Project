import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { safeRequest, isOk } from '../../utils/api';
import { generateReceiptPDF } from '../../components/ReceiptPDF';

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
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

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
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Paid</p>
          <p className="text-2xl font-bold text-green-600">{paid}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold text-[#CC7722]">LKR {totalSpent.toLocaleString()}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Recent Orders</h2>
          {/* Placeholder for a 'View All' if an orders page exists */}
        </div>
        {loading && (
          <div className="text-sm text-gray-500">Loading orders...</div>
        )}
        {error && !loading && (
          <div className="text-sm text-red-600">{error}</div>
        )}
        {!loading && !error && recentOrders.length === 0 && (
          <div className="text-sm text-gray-500">You have not placed any orders yet.</div>
        )}
        <div className="space-y-3">
          {recentOrders.map(o => (
            <div key={o._id} className="p-4 rounded-xl border border-amber-100 bg-white hover:shadow transition flex justify-between items-start gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-700">Order #{String(o._id).slice(-6)}</p>
                <p className="text-xs text-gray-600">Placed: {o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</p>
                <p className="text-xs text-gray-600">Items: {o.items?.length || 0}</p>
                <p className="text-xs">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`capitalize px-2 py-0.5 rounded text-xs ${o.status === 'paid' ? 'bg-green-100 text-green-700' : o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                    {o.status || 'unknown'}
                  </span>
                </p>
                <p className="text-sm font-bold text-amber-800">LKR {typeof o.total === 'number' ? o.total.toLocaleString() : o.total}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => generateReceiptPDF(o, { items: o.items?.filter(i=>i.product), offerItems: o.items?.filter(i=>i.offer) })}
                  className="text-xs px-3 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700"
                >Receipt</button>
              </div>
            </div>
          ))}
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
