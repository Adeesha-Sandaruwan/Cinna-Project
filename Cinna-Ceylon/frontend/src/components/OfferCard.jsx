import React, { useState, useEffect } from 'react';

const COLORS = { 
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#FCFBF8",
};

// OfferCard component displays a single offer bundle card
// Handles calculation of discount, countdown timer, image rendering, and action buttons
const OfferCard = ({ offer, isBuyerView = false, onEdit, onDelete, onAddToCart, onBuyNow }) => {
  // Calculate time left for offer expiry
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(offer.expiryDate));

  // Update countdown timer every second if offer is active
  useEffect(() => {
    if (offer.status === 'Active') {
      const timer = setTimeout(() => {
        setTimeLeft(calculateTimeLeft(offer.expiryDate));
      }, 1000);
      return () => clearTimeout(timer);
    }
  });

  // Calculate time left until expiry
  function calculateTimeLeft(expiryDate) {
    const difference = new Date(expiryDate) - new Date();
    let timeLeft = {};
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  }

  // Calculate total original price, discount amount, and percentage
  const totalOriginalPrice = offer.products.reduce((sum, product) => sum + product.price, 0);
  const discountAmount = totalOriginalPrice - offer.discountedPrice;
  const discountPercentage = Math.round((discountAmount / totalOriginalPrice) * 100);

  // Get correct image path for product or offer
  const getImagePath = (image) => {
    if (!image) return '';
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
      return image;
    }
    return `http://localhost:5000/uploads/${image}`;
  };

  // Handle image loading errors for product images
  const handleImageError = (e, productName) => {
    e.target.src = `https://via.placeholder.com/300x200/f5efe6/cc7722?text=${encodeURIComponent(productName)}`;
  };

  // Render product images as a bundle (custom image, 1-3, or more)
  const renderProductBundle = () => {
    if (offer.products.length === 0) return null;

    const renderStatusBadges = () => (
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {offer.status === 'Active' && (
          <div className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            {discountPercentage}% OFF
          </div>
        )}
        <div className={`text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${
          offer.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {offer.status === 'Active' ? 
            `${timeLeft.days || 0}d ${timeLeft.hours || 0}h left` : 
            'Expired'
          }
        </div>
      </div>
    );

    // If there's a custom offer image, use it
    if (offer.image) {
      return (
        <div className="relative h-48 overflow-hidden">
          <img
            src={getImagePath(offer.image)}
            alt={offer.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/300x200/f5efe6/cc7722?text=${encodeURIComponent(offer.name)}`;
            }}
          />
          {renderStatusBadges()}
        </div>
      );
    }
    
    // For 1-3 products, display them in a specific layout
    if (offer.products.length <= 3) {
      return (
        <div className="relative h-48 overflow-hidden bg-amber-50 flex items-center justify-center p-4">
          <div className={`grid ${offer.products.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2 w-full h-full`}>
            {offer.products.map((product, index) => (
              <div 
                key={index} 
                className={`${offer.products.length === 1 ? 'col-span-1' : index === 0 && offer.products.length === 3 ? 'row-span-2' : ''} overflow-hidden rounded-lg`}
              >
                <img
                  src={getImagePath(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, product.name)}
                />
              </div>
            ))}
          </div>
          {renderStatusBadges()}
        </div>
      );
    }
    
    // For more than 3 products, show the first 3 with a +X indicator
    return (
      <div className="relative h-48 overflow-hidden bg-amber-50 flex items-center justify-center p-4">
        <div className="grid grid-cols-2 gap-2 w-full h-full">
          {offer.products.slice(0, 3).map((product, index) => (
            <div 
              key={index} 
              className={`${index === 0 ? 'row-span-2' : ''} overflow-hidden rounded-lg relative`}
            >
              <img
                src={getImagePath(product.image)}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, product.name)}
              />
              {index === 2 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">+{offer.products.length - 3}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        {renderStatusBadges()}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-transform hover:scale-105 ${offer.status === 'Expired' ? 'opacity-70' : ''}`}>
      {/* Offer Badge - Show in both admin and buyer view */}
      <div className={`px-4 py-2 text-center text-white font-semibold ${offer.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}>
        {offer.status === 'Active' ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Limited Time Offer</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Offer Expired</span>
          </div>
        )}
      </div>

      {/* Offer Image Bundle */}
      {renderProductBundle()}

      {/* Offer Details */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2 text-gray-800">{offer.name}</h3>
        <p className="text-gray-600 mb-4 flex-grow">{offer.description}</p>
        
        {/* Products in Bundle */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Includes:</h4>
          <ul className="text-sm text-gray-600">
            {offer.products.map((product, index) => (
              <li key={index} className="flex items-center mb-1">
                <svg className="w-4 h-4 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                {product.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-center">
            <span className="text-lg line-through text-gray-500 mr-3">LKR {totalOriginalPrice.toLocaleString()}</span>
            <span className="text-2xl font-bold" style={{ color: COLORS.DEEP_CINNAMON }}>
              LKR {offer.discountedPrice.toLocaleString()}
            </span>
          </div>
          <div className="text-green-600 font-semibold mt-1">
            You save LKR {discountAmount.toLocaleString()}
          </div>
        </div>

        {/* Countdown Timer */}
        {offer.status === 'Active' && (
          <div className="bg-amber-50 p-3 rounded-lg mb-4">
            <p className="text-xs text-amber-800 font-semibold mb-2">Offer expires in:</p>
            <div className="flex justify-between text-center">
              <div>
                <div className="bg-amber-600 text-white rounded py-1 text-sm font-bold">{timeLeft.days || 0}</div>
                <div className="text-xs text-amber-700 mt-1">Days</div>
              </div>
              <div>
                <div className="bg-amber-600 text-white rounded py-1 text-sm font-bold">{timeLeft.hours || 0}</div>
                <div className="text-xs text-amber-700 mt-1">Hours</div>
              </div>
              <div>
                <div className="bg-amber-600 text-white rounded py-1 text-sm font-bold">{timeLeft.minutes || 0}</div>
                <div className="text-xs text-amber-700 mt-1">Mins</div>
              </div>
              <div>
                <div className="bg-amber-600 text-white rounded py-1 text-sm font-bold">{timeLeft.seconds || 0}</div>
                <div className="text-xs text-amber-700 mt-1">Secs</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-auto">
          {isBuyerView ? (
            // Buyer view - Show Add to Cart and Buy Now buttons
            <>
              <button 
                className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition text-center"
                disabled={offer.status === 'Expired'}
                onClick={() => onAddToCart && onAddToCart(offer)}
              >
                {offer.status === 'Active' ? 'Add to Cart' : 'Expired'}
              </button>
              <button 
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-center"
                disabled={offer.status === 'Expired'}
                onClick={() => onBuyNow && onBuyNow(offer)}
              >
                Buy Now
              </button>
            </>
          ) : (
            // Admin view - Show Edit and Delete buttons only
            <div className="flex space-x-2 w-full">
              <button 
                className="flex-1 flex items-center justify-center bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition"
                onClick={onEdit}
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </button>
              <button 
                className="flex-1 flex items-center justify-center bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                onClick={onDelete}
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferCard;