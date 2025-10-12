import React, { useState, useEffect } from 'react';
import OfferCard from './OfferCard.jsx';
import OfferForm from './OfferForm.jsx';

const COLORS = { 
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#FCFBF8",
};

// OffersPage component displays all bundle offers for admin/finance management
// Handles data fetching, filtering, offer creation/editing, and UI rendering
const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch offers and products on mount
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Fetches offers and products from the backend.
   * Handles loading and error states, and updates local state.
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      const [offersResponse, productsResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/offers?filter=${filter}`),
        fetch('http://localhost:5000/api/products')
      ]);

      if (!offersResponse.ok || !productsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const offersData = await offersResponse.json();
      const productsData = await productsResponse.json();

      setOffers(offersData);
      setProducts(productsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load offers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes an offer by ID from the backend and updates the offers list in state.
   * Shows a confirmation dialog before deleting.
   */
  const handleDeleteOffer = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/offers/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete offer');
        }

        setOffers(offers.filter(offer => offer._id !== id));
      } catch (err) {
        console.error('Error deleting offer:', err);
        alert('Failed to delete offer. Please try again.');
      }
    }
  };

  /**
   * Callback after an offer is created or edited.
   * Closes the form and refreshes the offers list from the backend.
   */
  const handleSaveOffer = () => {
    setShowForm(false);
    setEditingOffer(null);
    fetchData(); // Refresh the offers list
  };

  // useEffect to fetch data when filter changes
  useEffect(() => {
    fetchData();
  }, [filter]);

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
      <div className="container mx-auto px-4 py-8">
        {/* Fixed Header Section */}
        <div className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between">
          {/* Back Button - Left aligned */}
          <div className="w-full md:w-auto mb-6 md:mb-0 md:mr-4">
            <button
              onClick={() => window.location.href = '/financial-officer-dashboard'}
              className="flex items-center text-amber-600 hover:text-amber-700 transition-colors px-4 py-2 bg-white/80 rounded-xl shadow-sm"
            >
              &#8592; Back to Dashboard
            </button>
          </div>
          
          {/* Title and Description - Centered */}
          <div className="flex-1 flex flex-col items-center justify-center text-center mx-auto">
            <h1 className="text-4xl font-bold mb-4" style={{ color: COLORS.DARK_SLATE }}>
              Special Cinnamon Bundles
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Discover our exclusive cinnamon product bundles. Save more when you buy these specially curated combinations.
            </p>
          </div>
          
          {/* Empty div to balance the layout */}
          <div className="w-full md:w-auto md:ml-4 hidden md:block"></div>
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
            <button 
              className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition flex items-center"
              onClick={() => setShowForm(true)}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create Offer
            </button>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {offers.map(offer => (
            <OfferCard 
              key={offer._id} 
              offer={offer} 
              onEdit={() => {
                setEditingOffer(offer);
                setShowForm(true);
              }}
              onDelete={() => handleDeleteOffer(offer._id)}
            />
          ))}
        </div>

        {offers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <svg className="w-16 h-16 text-amber-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No offers available</h3>
            <p className="text-gray-600 mb-4">Check back later for special bundle offers.</p>
            <button 
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
              onClick={() => setShowForm(true)}
            >
              Create Your First Offer
            </button>
          </div>
        )}
      </div>

      {/* Offer Form Modal */}
      {showForm && (
        <OfferForm 
          offer={editingOffer}
          products={products}
          onClose={() => {
            setShowForm(false);
            setEditingOffer(null);
          }}
          onSave={handleSaveOffer}
        />
      )}
    </div>
  );
};

export default OffersPage;