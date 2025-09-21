import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OfferCard from './OfferCard';

const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#FCFBF8",
};

const BuyerOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchOffers();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/offers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch offers');
      }
      
      const offersData = await response.json();
      setOffers(offersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('Failed to load offers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (offer) => {
    try {
      // Get the current user ID
      const userId = localStorage.getItem('userId') || 'default';
      
      // Add the offer to cart
      const response = await fetch('http://localhost:5000/api/cart/offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userId,
          offerId: offer._id,
          qty: 1,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add offer to cart');
      }
      
      // Show success notification
      showNotification('Offer added to cart successfully!', 'success');
      
      // Trigger cart update event for other components
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Update cart count globally by fetching the updated cart
      const cartResponse = await fetch(`http://localhost:5000/api/cart/${userId || 'default'}`);
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        const offerCount = cartData.offerItems ? cartData.offerItems.reduce((sum, item) => sum + (item.qty || 0), 0) : 0;
        const productCount = cartData.items ? cartData.items.reduce((sum, item) => sum + (item.qty || 0), 0) : 0;
        const totalCount = offerCount + productCount;
        window.dispatchEvent(new CustomEvent('cartCountUpdate', { detail: totalCount }));
      }
      
    } catch (err) {
      console.error('Error adding to cart:', err);
      showNotification('Failed to add offer to cart. Please try again.', 'error');
    }
  };

  const handleBuyNow = async (offer) => {
    try {
      // Get the current user ID
      const userId = localStorage.getItem('userId') || 'default';
      
      // Add the offer to cart first
      const response = await fetch('http://localhost:5000/api/cart/offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userId,
          offerId: offer._id,
          qty: 1,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add offer to cart');
      }
      
      // Show success notification
      showNotification('Redirecting to checkout...', 'success');
      
      // Update cart count by fetching the updated cart
      const cartResponse = await fetch(`http://localhost:5000/api/cart/${userId || 'default'}`);
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        const offerCount = cartData.offerItems ? cartData.offerItems.reduce((sum, item) => sum + (item.qty || 0), 0) : 0;
        const productCount = cartData.items ? cartData.items.reduce((sum, item) => sum + (item.qty || 0), 0) : 0;
        const totalCount = offerCount + productCount;
        window.dispatchEvent(new CustomEvent('cartCountUpdate', { detail: totalCount }));
      }
      
      // Redirect to checkout page after a brief delay
      setTimeout(() => {
        window.location.href = '/checkout';
      }, 1000);
      
    } catch (err) {
      console.error('Error in buy now:', err);
      showNotification('Failed to process your request. Please try again.', 'error');
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (filter === 'all') return true;
    if (filter === 'active') return offer.status === 'Active';
    if (filter === 'expired') return offer.status === 'Expired';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading offers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: COLORS.DARK_SLATE }}>
            Special Cinnamon Bundles
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our exclusive cinnamon product bundles. Save more when you buy these specially curated combinations.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <span className="block sm:inline">{error}</span>
            <button 
              className="absolute top-0 right-0 p-3"
              onClick={() => setError(null)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-2 flex space-x-2">
            <button 
              className={`px-4 py-2 rounded-lg transition ${filter === 'all' ? 'bg-amber-100 text-amber-800' : 'text-gray-600 hover:bg-amber-50'}`}
              onClick={() => setFilter('all')}
            >
              All Offers
            </button>
            <button 
              className={`px-4 py-2 rounded-lg transition ${filter === 'active' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-green-50'}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button 
              className={`px-4 py-2 rounded-lg transition ${filter === 'expired' ? 'bg-red-100 text-red-800' : 'text-gray-600 hover:bg-red-50'}`}
              onClick={() => setFilter('expired')}
            >
              Expired
            </button>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredOffers.map(offer => (
            <OfferCard 
              key={offer._id} 
              offer={offer} 
              isBuyerView={true}
              onAddToCart={() => handleAddToCart(offer)}
              onBuyNow={() => handleBuyNow(offer)}
            />
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <svg className="w-16 h-16 text-amber-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No offers available</h3>
            <p className="text-gray-600 mb-4">Check back later for special bundle offers.</p>
            <Link 
              to="/products"
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default BuyerOffersPage;