import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaMinus, FaPlus, FaTag } from 'react-icons/fa';

const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#F5EFE6",
};

const Cart = () => {
  const { userId: routeUserId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?._id || routeUserId;

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    fetchCart();
    
    const handleCartUpdate = () => {
      fetchCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [userId]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      // If there's no authenticated user and no route userId, show an empty cart page
      if (!user && !routeUserId) {
        setCart(null);
        setCartItemCount(0);
        // Ensure header badge clears
        window.dispatchEvent(new CustomEvent('cartCountUpdate', { detail: 0 }));
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/cart/${userId || 'default'}`);
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        
        // Calculate total items count for badge
        const productCount = data.items ? data.items.reduce((sum, item) => sum + (item.qty || 0), 0) : 0;
        const offerCount = data.offerItems ? data.offerItems.reduce((sum, item) => sum + (item.qty || 0), 0) : 0;
        setCartItemCount(productCount + offerCount);
        
        // Update cart badge in header
        window.dispatchEvent(new CustomEvent('cartCountUpdate', { detail: productCount + offerCount }));
      } else {
        setError('Failed to fetch cart');
      }
    } catch (err) {
      setError('Error fetching cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQty, itemType = 'product') => {
    if (newQty < 1) return;

    try {
      const endpoint = itemType === 'offer' ? 'http://localhost:5000/api/cart/offer' : 'http://localhost:5000/api/cart';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user: userId || 'default', 
          [itemType === 'offer' ? 'offerId' : 'productId']: itemId, 
          qty: newQty 
        }),
      });
      
      if (response.ok) {
        fetchCart();
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const removeItem = async (itemId, itemType = 'product') => {
    try {
      const endpoint = itemType === 'offer' ? 'http://localhost:5000/api/cart/offer' : 'http://localhost:5000/api/cart';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user: userId || 'default', 
          [itemType === 'offer' ? 'offerId' : 'productId']: itemId, 
          qty: 0 
        }),
      });
      
      if (response.ok) {
        fetchCart();
        window.dispatchEvent(new Event('cartUpdated'));
      }
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
        setCartItemCount(0);
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new CustomEvent('cartCountUpdate', { detail: 0 }));
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  // Safe price formatting function
  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0.00';
    return typeof price === 'number' ? price.toFixed(2) : parseFloat(price || 0).toFixed(2);
  };

  // Function to get correct image path
  const getImagePath = (image) => {
    if (!image) return '';
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
      return image;
    }
    return `http://localhost:5000/uploads/${image}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinnamon mx-auto mb-4"></div>
            <p className="text-lg">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || (!cart.items && !cart.offerItems) || 
      (cart.items && cart.items.length === 0 && cart.offerItems && cart.offerItems.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
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
      </div>
    );
  }

  // Calculate subtotal with discounts safely
  const productSubtotal = cart.items ? cart.items.reduce((sum, item) => {
    const price = item.priceAtAdd || (item.product && item.product.price) || 0;
    const qty = item.qty || 0;
    return sum + price * qty;
  }, 0) : 0;

  const offerSubtotal = cart.offerItems ? cart.offerItems.reduce((sum, item) => {
    const price = item.discountedPrice || (item.offer && item.offer.discountedPrice) || 0;
    const qty = item.qty || 0;
    return sum + price * qty;
  }, 0) : 0;

  const subtotal = productSubtotal + offerSubtotal;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: COLORS.DARK_SLATE }}>
              Shopping Cart
            </h1>
            <p className="text-gray-600">Review your selected cinnamon products and offers</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold" style={{ color: COLORS.DARK_SLATE }}>
                    Cart Items ({cart.items ? cart.items.length : 0} products, {cart.offerItems ? cart.offerItems.length : 0} offers)
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {/* Regular Products */}
                  {cart.items && cart.items.map((item, index) => {
                    const productPrice = item.priceAtAdd || (item.product && item.product.price) || 0;
                    const productName = item.product && item.product.name ? item.product.name : 'Unknown Product';
                    const productType = item.product && item.product.type ? item.product.type : '';
                    const productGrade = item.product && item.product.grade ? item.product.grade : '';
                    const productImage = item.product && item.product.image ? item.product.image : null;
                    
                    return (
                      <div key={`product-${index}`} className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                            {productImage ? (
                              <img
                                src={getImagePath(productImage)}
                                alt={productName}
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
                              {productName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {productType} • {productGrade}
                            </p>
                            <p className="text-lg font-semibold mt-1" style={{ color: COLORS.DEEP_CINNAMON }}>
                              Rs: {formatPrice(productPrice)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.product && item.product._id, (item.qty || 1) - 1, 'product')}
                              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                              disabled={(item.qty || 1) <= 1}
                            >
                              <FaMinus size={12} />
                            </button>
                            
                            <span className="w-12 text-center font-semibold">{item.qty || 1}</span>
                            
                            <button
                              onClick={() => updateQuantity(item.product && item.product._id, (item.qty || 1) + 1, 'product')}
                              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold" style={{ color: COLORS.DEEP_CINNAMON }}>
                              Rs: {formatPrice((item.qty || 1) * productPrice)}
                            </p>
                            <button
                              onClick={() => removeItem(item.product && item.product._id, 'product')}
                              className="mt-2 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Offer Items */}
                  {cart.offerItems && cart.offerItems.map((item, index) => {
                    const offer = item.offer || {};
                    const offerProducts = offer.products || [];
                    const originalPrice = item.originalPrice || offerProducts.reduce((sum, product) => sum + (product.price || 0), 0);
                    const discountedPrice = item.discountedPrice || (offer.discountedPrice || 0);
                    const savings = originalPrice - discountedPrice;
                    const offerName = offer.name || 'Special Offer';
                    const offerImage = offer.image || null;
                    
                    return (
                      <div key={`offer-${index}`} className="p-6 bg-amber-50">
                        <div className="flex items-start mb-4">
                          <div className="flex-shrink-0 w-16 h-16 bg-white rounded-lg overflow-hidden mr-4 border border-amber-200">
                            {offerImage ? (
                              <img
                                src={getImagePath(offerImage)}
                                alt={offerName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/64x64/f5efe6/cc7722?text=Offer';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white">
                                <FaTag className="w-6 h-6 text-amber-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <FaTag className="text-amber-600 mr-2" />
                              <h3 className="text-lg font-semibold text-gray-900">
                                {offerName} (Special Bundle Offer)
                              </h3>
                              <span className="ml-auto bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                Save Rs: {formatPrice(savings)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Includes: {offerProducts.map(p => p.name).join(', ')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                          {offerProducts.map((product, idx) => {
                            const productName = product.name || 'Product';
                            const productPrice = product.price || 0;
                            const productImage = product.image || null;
                            
                            return (
                              <div key={idx} className="flex items-center bg-white p-2 rounded-lg border">
                                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden mr-2">
                                  {productImage ? (
                                    <img
                                      src={getImagePath(productImage)}
                                      alt={productName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/48x48/f5efe6/cc7722?text=Cinnamon';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{productName}</p>
                                  <p className="text-xs text-gray-500">Rs: {formatPrice(productPrice)}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-500 line-through">
                              Original: Rs: {formatPrice(originalPrice)}
                            </div>
                            <div className="text-lg font-semibold" style={{ color: COLORS.DEEP_CINNAMON }}>
                              Discounted: Rs: {formatPrice(discountedPrice)}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(offer._id, (item.qty || 1) - 1, 'offer')}
                              className="p-2 rounded-full hover:bg-amber-100 transition-colors"
                              disabled={(item.qty || 1) <= 1}
                            >
                              <FaMinus size={12} />
                            </button>
                            
                            <span className="w-12 text-center font-semibold">{item.qty || 1}</span>
                            
                            <button
                              onClick={() => updateQuantity(offer._id, (item.qty || 1) + 1, 'offer')}
                              className="p-2 rounded-full hover:bg-amber-100 transition-colors"
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-semibold" style={{ color: COLORS.DEEP_CINNAMON }}>
                              Rs: {formatPrice((item.qty || 1) * discountedPrice)}
                            </div>
                            <button
                              onClick={() => removeItem(offer._id, 'offer')}
                              className="mt-1 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                  {cart.items && cart.items.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Products Subtotal</span>
                      <span className="font-semibold">Rs: {formatPrice(productSubtotal)}</span>
                    </div>
                  )}
                  
                  {cart.offerItems && cart.offerItems.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Offers Subtotal</span>
                      <span className="font-semibold">Rs: {formatPrice(offerSubtotal)}</span>
                    </div>
                  )}
                  
                  {cart.offerItems && cart.offerItems.length > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Total Savings from Offers</span>
                      <span className="font-semibold">
                        Rs: {formatPrice(cart.offerItems.reduce((sum, item) => {
                          const originalPrice = item.originalPrice || ((item.offer && item.offer.products) ? item.offer.products.reduce((sum, product) => sum + (product.price || 0), 0) : 0);
                          const discountedPrice = item.discountedPrice || (item.offer && item.offer.discountedPrice) || 0;
                          return sum + (originalPrice - discountedPrice) * (item.qty || 1);
                        }, 0))}
                      </span>
                    </div>
                  )}
                  
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
                        Rs: {formatPrice(subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: COLORS.DEEP_CINNAMON }}
                  disabled={(!cart.items || cart.items.length === 0) && (!cart.offerItems || cart.offerItems.length === 0)}
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
    </div>
  );
};

export default Cart;