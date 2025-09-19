import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import HeaderAfterLogin from './HeaderAfterLogin.jsx';
import Footer from './Footer.jsx';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#FCFBF8",
};

const Cart = () => {
  const { userId } = useParams();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart();
  }, [userId]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/cart/${userId || 'default'}`);
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      } else {
        setError('Failed to fetch cart');
      }
    } catch (err) {
      setError('Error fetching cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQty) => {
    if (newQty < 1) return;

    try {
      const response = await fetch(`http://localhost:5000/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userId || 'default', productId, qty: newQty }),
      });
      if (response.ok) fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userId || 'default', productId, qty: 0 }),
      });
      if (response.ok) fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${userId || 'default'}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCart(null);
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <HeaderAfterLogin />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinnamon mx-auto mb-4"></div>
            <p className="text-lg">Loading cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <HeaderAfterLogin />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <HeaderAfterLogin />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.DARK_SLATE }}>
                  Your Cart is Empty
                </h1>
                <p className="text-gray-600 mb-6">Start shopping to add some delicious cinnamon products!</p>
                <a
                  href="/products"
                  className="inline-block px-8 py-3 rounded-lg font-semibold text-white transition-colors"
                  style={{ backgroundColor: COLORS.DEEP_CINNAMON }}
                >
                  Browse Products
                </a>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate subtotal dynamically based on priceAtAdd
  const subtotal = cart.items.reduce((sum, item) => sum + item.priceAtAdd * item.qty, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <HeaderAfterLogin />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: COLORS.DARK_SLATE }}>
              Shopping Cart
            </h1>
            <p className="text-gray-600">Review your selected cinnamon products</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold" style={{ color: COLORS.DARK_SLATE }}>
                    Cart Items ({cart.items.length})
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item, index) => (
                    <div key={index} className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          {item.product.image ? (
                            <img
                              src={`http://localhost:5000/uploads/${item.product.image}`}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80x80/f5efe6/cc7722?text=Cinnamon';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.product.type} • {item.product.grade}
                          </p>
                          <p className="text-lg font-semibold mt-1" style={{ color: COLORS.DEEP_CINNAMON }}>
                            Rs: {item.priceAtAdd.toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.qty - 1)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            disabled={item.qty <= 1}
                          >
                            <FaMinus size={12} />
                          </button>
                          
                          <span className="w-12 text-center font-semibold">{item.qty}</span>
                          
                          <button
                            onClick={() => updateQuantity(item.product._id, item.qty + 1)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-semibold" style={{ color: COLORS.DEEP_CINNAMON }}>
                            Rs: {(item.qty * item.priceAtAdd).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeItem(item.product._id)}
                            className="mt-2 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-6 border-t border-gray-200">
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 font-medium transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
                <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.DARK_SLATE }}>
                  Order Summary
                </h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">Rs: {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold" style={{ color: COLORS.DARK_SLATE }}>
                        Total
                      </span>
                      <span className="text-lg font-bold" style={{ color: COLORS.DEEP_CINNAMON }}>
                        Rs: {subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => window.location.href = '/checkout'}
                  className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: COLORS.DEEP_CINNAMON }}
                >
                  Proceed to Checkout
                </button>
                
                <div className="mt-4 text-center">
                  <a
                    href="/products"
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Continue Shopping
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
