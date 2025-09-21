import React, { useEffect, useState } from "react";
import { FaTruck, FaUser, FaPhone, FaMapMarkerAlt, FaClipboardCheck, FaClock, FaCheckCircle, FaRoute, FaBox, FaSpinner, FaStar, FaArrowRight } from "react-icons/fa";

const DriverDashboard = () => {
  const [driver, setDriver] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  // Animate on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Get logged-in driver info from localStorage or context
  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    console.log('DriverDashboard - Checking authentication...');
    console.log('Logged user:', loggedUser);
    console.log('Token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token) {
      setMessage("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }
    
    if (loggedUser && loggedUser.userType === 'driver') {
      // Backend sends 'id' instead of '_id'
      const driverId = loggedUser.id || loggedUser._id;
      
      console.log('Driver ID:', driverId);
      
      if (driverId) {
        setDriver(loggedUser);
        fetchDriverDeliveries(driverId, token);
      } else {
        setMessage("Driver ID not found. Please log in again.");
        setLoading(false);
      }
    } else {
      setMessage("Driver access required. Please log in as a driver.");
      setLoading(false);
    }
  }, []);

  // Fetch driver's deliveries
  const fetchDriverDeliveries = async (driverId, token) => {
    try {
      setLoading(true);
      console.log('Fetching deliveries for driver:', driverId);
      console.log('Using token:', token ? token.substring(0, 20) + '...' : 'No token');
      
      const response = await fetch(`http://localhost:5000/api/deliveries/driver/${driverId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Deliveries fetch response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          setMessage("Session expired. Please log in again.");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Deliveries data received:', data);
      
      if (Array.isArray(data)) {
        setDeliveries(data);
        console.log('Set deliveries:', data.length, 'items');
      } else {
        console.warn('Expected array but got:', typeof data, data);
        setDeliveries([]);
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update delivery status
  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [deliveryId]: true }));
    setMessage("");

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage("Authentication token required. Please log in again.");
      setUpdatingStatus(prev => ({ ...prev, [deliveryId]: false }));
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/deliveries/${deliveryId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          actualDelivery: newStatus === 'delivered' ? new Date() : undefined
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Delivery status updated to ${newStatus} successfully!`);
        // Refresh deliveries
        const driverId = driver.id || driver._id;
        fetchDriverDeliveries(driverId, token);
        
        // Send email notification to buyer
        await sendEmailNotification(deliveryId, newStatus, token);
      } else {
        if (response.status === 401) {
          setMessage("Session expired. Please log in again.");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          setMessage(data.message || "Error updating status");
        }
      }
    } catch (error) {
      console.error("Error updating delivery status:", error);
      setMessage("Error updating status. Please try again.");
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [deliveryId]: false }));
    }
  };

  // Send email notification
  const sendEmailNotification = async (deliveryId, status, token) => {
    try {
      await fetch("http://localhost:5000/api/deliveries/send-notification", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deliveryId, status })
      });
    } catch (error) {
      console.log("Email notification failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <FaTruck className="text-6xl text-amber-600 animate-bounce" />
            <div className="absolute -top-2 -right-2">
              <FaSpinner className="text-2xl text-orange-500 animate-spin" />
            </div>
          </div>
          <div className="text-xl font-semibold text-amber-700 animate-pulse">
            Loading driver dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-200">
          <div className="text-center space-y-4">
            <FaUser className="text-6xl text-red-500 mx-auto" />
            <div className="text-xl font-semibold text-red-600">
              {message || "Driver access required. Please log in as a driver."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header with floating animation */}
        <div className={`transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="text-center space-y-4 mb-8">
            <div className="relative inline-block">
              <FaTruck className="text-6xl text-amber-600 animate-bounce" />
              <div className="absolute -top-2 -right-2">
                <FaStar className="text-2xl text-yellow-500 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Driver Dashboard
            </h1>
            <p className="text-lg text-gray-600">Welcome back, manage your deliveries efficiently</p>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'} mb-6`}>
            <div className={`px-6 py-4 rounded-xl shadow-lg border-l-4 ${
              message.includes('success') || message.includes('updated') 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 text-green-700' 
                : message.includes('error') || message.includes('Error')
                ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500 text-red-700'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500 text-blue-700'
            }`}>
              <div className="flex items-center gap-3">
                {message.includes('success') || message.includes('updated') ? (
                  <FaCheckCircle className="text-xl animate-bounce" />
                ) : (
                  <FaClipboardCheck className="text-xl animate-pulse" />
                )}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          </div>
        )}

        {/* Driver Profile Section */}
        <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <FaUser className="animate-pulse" />
                Driver Information
              </h2>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b border-orange-200 pb-2">
                    <FaUser className="text-amber-600" />
                    Personal Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                      <FaUser className="text-amber-600 text-lg" />
                      <div>
                        <span className="text-sm text-gray-500 block">Full Name</span>
                        <span className="font-semibold text-gray-800">{driver.profile?.name || driver.username}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                      <FaPhone className="text-amber-600 text-lg" />
                      <div>
                        <span className="text-sm text-gray-500 block">Phone Number</span>
                        <span className="font-semibold text-gray-800">{driver.profile?.phone || "Not provided"}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                      <FaMapMarkerAlt className="text-amber-600 text-lg" />
                      <div>
                        <span className="text-sm text-gray-500 block">Address</span>
                        <span className="font-semibold text-gray-800">{driver.profile?.address || "Not provided"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Delivery Statistics */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b border-orange-200 pb-2">
                    <FaClipboardCheck className="text-amber-600" />
                    Delivery Statistics
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-xl text-center border border-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <FaCheckCircle className="text-3xl text-green-600 mx-auto mb-2 animate-pulse" />
                      <div className="text-2xl font-bold text-green-700">
                        {deliveries.filter(d => d.status === 'delivered').length}
                      </div>
                      <div className="text-sm text-green-600 font-medium">Completed</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-6 rounded-xl text-center border border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <FaClock className="text-3xl text-blue-600 mx-auto mb-2 animate-pulse" />
                      <div className="text-2xl font-bold text-blue-700">
                        {deliveries.filter(d => d.status === 'in_transit').length}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">In Transit</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-100 to-amber-100 p-6 rounded-xl text-center border border-yellow-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <FaRoute className="text-3xl text-yellow-600 mx-auto mb-2 animate-pulse" />
                      <div className="text-2xl font-bold text-yellow-700">
                        {deliveries.filter(d => d.status === 'assigned').length}
                      </div>
                      <div className="text-sm text-yellow-600 font-medium">Assigned</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-100 to-violet-100 p-6 rounded-xl text-center border border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <FaBox className="text-3xl text-purple-600 mx-auto mb-2 animate-pulse" />
                      <div className="text-2xl font-bold text-purple-700">
                        {deliveries.length}
                      </div>
                      <div className="text-sm text-purple-600 font-medium">Total</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deliveries Section */}
        <div className={`transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                <FaRoute className="animate-pulse" />
                My Deliveries
                <span className="ml-auto bg-white/20 rounded-full px-4 py-2 text-lg">
                  {deliveries.length} Total
                </span>
              </h3>
            </div>
            
            <div className="p-6">
              {deliveries.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <FaBox className="text-6xl text-gray-400 mx-auto animate-pulse" />
                  <p className="text-xl text-gray-600">No deliveries assigned yet</p>
                  <p className="text-gray-500">Check back later for new delivery assignments</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {deliveries.map((delivery, index) => (
                    <div 
                      key={delivery._id}
                      className={`group bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="p-6 space-y-4">
                        {/* Header Row */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-3 rounded-full">
                              <FaRoute className="text-blue-600 text-xl" />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-gray-800">
                                Delivery #{delivery._id.slice(-8)}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Order #{delivery.order?._id?.slice(-8) || "N/A"}
                              </p>
                            </div>
                          </div>
                          
                          <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                            delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            delivery.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                            delivery.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {delivery.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Order Details */}
                          <div className="space-y-3">
                            <h5 className="font-semibold text-gray-700 flex items-center gap-2">
                              <FaBox className="text-amber-600" />
                              Order Details
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total:</span>
                                <span className="font-semibold text-green-600">
                                  LKR {delivery.order?.total || "N/A"}
                                </span>
                              </div>
                              {delivery.order?.items && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Items:</span>
                                  <span className="font-semibold">{delivery.order.items.length}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="space-y-3">
                            <h5 className="font-semibold text-gray-700 flex items-center gap-2">
                              <FaUser className="text-amber-600" />
                              Customer
                            </h5>
                            {delivery.order?.shippingAddress ? (
                              <div className="space-y-1 text-sm">
                                <p className="font-semibold">
                                  {delivery.order.shippingAddress.firstName} {delivery.order.shippingAddress.lastName}
                                </p>
                                <p className="text-gray-600 flex items-center gap-1">
                                  <FaMapMarkerAlt className="text-red-500" />
                                  {delivery.order.shippingAddress.address}
                                </p>
                                <p className="text-gray-600">
                                  {delivery.order.shippingAddress.city}, {delivery.order.shippingAddress.postalCode}
                                </p>
                                <p className="text-gray-600 flex items-center gap-1">
                                  <FaPhone className="text-green-500" />
                                  {delivery.order.shippingAddress.phone}
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">{delivery.order?.user || "N/A"}</p>
                            )}
                          </div>

                          {/* Vehicle Info */}
                          <div className="space-y-3">
                            <h5 className="font-semibold text-gray-700 flex items-center gap-2">
                              <FaTruck className="text-amber-600" />
                              Vehicle
                            </h5>
                            {delivery.vehicle ? (
                              <div className="space-y-1 text-sm">
                                <p className="font-semibold">{delivery.vehicle.vehicleType}</p>
                                <p className="text-gray-600">{delivery.vehicle.insuranceNo}</p>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">Not assigned</p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                          {delivery.status === 'assigned' && (
                            <button
                              onClick={() => updateDeliveryStatus(delivery._id, 'in_transit')}
                              disabled={updatingStatus[delivery._id]}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus[delivery._id] ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaArrowRight />
                              )}
                              Start Transit
                            </button>
                          )}
                          
                          {delivery.status === 'in_transit' && (
                            <button
                              onClick={() => updateDeliveryStatus(delivery._id, 'delivered')}
                              disabled={updatingStatus[delivery._id]}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingStatus[delivery._id] ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaCheckCircle />
                              )}
                              Mark Delivered
                            </button>
                          )}

                          <div className="text-sm text-gray-600 flex items-center gap-2 ml-auto">
                            <FaClock className="text-gray-400" />
                            Assigned: {new Date(delivery.assignedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;