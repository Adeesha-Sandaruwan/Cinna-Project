import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  FaTruck, 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaBox, 
  FaCheckCircle, 
  FaClock, 
  FaTimes, 
  FaRoute,
  FaClipboardList,
  FaShippingFast,
  FaIdCard,
  FaEnvelope
} from 'react-icons/fa';

// Background image path
const cinnamonBg = '/cinnamon-bg.jpeg';

// Custom animations
const animations = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(160, 82, 45, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(160, 82, 45, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(160, 82, 45, 0);
    }
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.8s ease-out;
  }

  .animate-slideInRight {
    animation: slideInRight 0.8s ease-out;
  }

  .animate-bounceIn {
    animation: bounceIn 0.8s ease-out;
  }

  .animate-pulse {
    animation: pulse 2s infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = animations;
  document.head.appendChild(styleSheet);
}

const cinnamon = {
  primary: "#A0522D", // cinnamon brown
  accent: "#D2691E", // lighter cinnamon
  bg: "#FFF8F0", // soft background
  highlight: "#FFDAB3", // highlight
  success: "#28a745",
  warning: "#ffc107",
  info: "#17a2b8",
  danger: "#dc3545"
};

const DriverDashboard = () => {
  const [driver, setDriver] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState({});
  
  // Refs to prevent multiple API calls
  const fetchingRef = useRef(false);
  const lastFetchTime = useRef(0);
  const FETCH_DEBOUNCE_MS = 1000; // Minimum time between fetches

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
      setMessage("Access denied. Driver login required.");
      setLoading(false);
    }
  }, []);

  // Fetch deliveries assigned to this driver with debouncing
  const fetchDriverDeliveries = useCallback(async (driverId, token) => {
    if (!driverId) {
      setMessage("Invalid driver ID");
      setLoading(false);
      return;
    }

    if (!token) {
      setMessage("Authentication token required");
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous calls
    if (fetchingRef.current) {
      console.log("Fetch already in progress, skipping...");
      return;
    }

    // Debounce rapid successive calls
    const now = Date.now();
    if (now - lastFetchTime.current < FETCH_DEBOUNCE_MS) {
      console.log("Debouncing fetch call, too recent...");
      return;
    }

    fetchingRef.current = true;
    lastFetchTime.current = now;
    
    console.log(`Fetching deliveries for driver ${driverId} with token`);

    try {
      const response = await fetch(`http://localhost:5000/api/deliveries/driver/${driverId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);
      if (response.ok) {
        setDeliveries(data);
        setMessage("");
      } else {
        if (response.status === 401) {
          setMessage("Session expired. Please log in again.");
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else if (response.status === 429) {
          console.log("Rate limited, will retry after delay");
          setMessage("Loading... please wait");
          // Don't set error message for rate limiting
        } else {
          setMessage(data.message || "Error fetching deliveries");
        }
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);  // Update delivery status with optimized refresh
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
        
        // Update the specific delivery in state instead of refetching all
        setDeliveries(prevDeliveries => 
          prevDeliveries.map(delivery => 
            delivery._id === deliveryId 
              ? { ...delivery, status: newStatus, actualDelivery: newStatus === 'delivered' ? new Date() : delivery.actualDelivery }
              : delivery
          )
        );
        
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
      console.error("Error updating status:", error);
      setMessage("Network error. Please try again.");
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [deliveryId]: false }));
    }
  };

  // Send email notification to buyer
  const sendEmailNotification = async (deliveryId, status, token) => {
    try {
      await fetch(`http://localhost:5000/api/deliveries/${deliveryId}/notify`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    if (status === 'assigned') return cinnamon.warning;
    if (status === 'accepted') return cinnamon.info;
    if (status === 'in-transit') return cinnamon.accent;
    if (status === 'delivered') return cinnamon.success;
    if (status === 'cancelled') return cinnamon.danger;
    return cinnamon.primary;
  };

  // Get next status options
  const getNextStatusOptions = (currentStatus) => {
    if (currentStatus === 'assigned') {
      return [{ value: 'accepted', label: 'Accept Order' }];
    }
    if (currentStatus === 'accepted') {
      return [{ value: 'in-transit', label: 'Start Delivery' }];
    }
    if (currentStatus === 'in-transit') {
      return [{ value: 'delivered', label: 'Mark as Delivered' }];
    }
    return [];
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center py-8"
        style={{
          backgroundImage: `url(${cinnamonBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="text-center">
          <div className="relative mb-6">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#A0522D]/20 border-t-[#A0522D]"></div>
            <FaTruck className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#A0522D] text-xl" />
          </div>
          <p className="text-[#A0522D] text-xl font-semibold">Loading driver dashboard...</p>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center py-8"
        style={{
          backgroundImage: `url(${cinnamonBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="max-w-md w-full p-8 bg-white/95 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20 text-center">
          <FaTimes className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-700">
            {message || "Driver access required. Please log in as a driver."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-start py-8"
      style={{
        backgroundImage: `url(${cinnamonBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-7xl w-full p-8 bg-gradient-to-br from-white/95 to-amber-50/95 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20 animate-bounceIn">
        {/* Enhanced Header with Modern Design */}
        <div className="relative mb-8 p-6 bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#CD853F] rounded-2xl shadow-xl overflow-hidden animate-slideInRight">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FaTruck className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Driver Dashboard
                </h1>
                <p className="text-amber-100 font-medium">
                  Welcome back, {driver.profile?.name || driver.username}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-amber-100 text-sm font-medium">Active Deliveries</p>
                <p className="text-white text-2xl font-bold">
                  {deliveries.filter(d => ['assigned', 'accepted', 'in-transit'].includes(d.status)).length}
                </p>
              </div>
              <div className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-full shadow-lg animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  <span>ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Driver Information Card */}
          <div className="bg-white/80 rounded-xl shadow-lg p-6 backdrop-blur-sm border border-white/50 animate-fadeInUp">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <FaUser className="text-xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#8B4513]">Driver Information</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <FaIdCard className="text-[#A0522D]" />
                <div>
                  <span className="font-semibold text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{driver.profile?.name || driver.username}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <FaEnvelope className="text-[#A0522D]" />
                <div>
                  <span className="font-semibold text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">{driver.email}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <FaPhone className="text-[#A0522D]" />
                <div>
                  <span className="font-semibold text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">{driver.profile?.phone || "Not provided"}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <FaMapMarkerAlt className="text-[#A0522D]" />
                <div>
                  <span className="font-semibold text-gray-700">Address:</span>
                  <span className="ml-2 text-gray-900">{driver.profile?.address || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Statistics Cards */}
          <div className="bg-white/80 rounded-xl shadow-lg p-6 backdrop-blur-sm border border-white/50 animate-fadeInUp">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
                <FaClipboardList className="text-xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#8B4513]">Delivery Statistics</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Total Deliveries */}
              <div className="group relative transform hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse"></div>
                      <span className="text-blue-100 text-sm font-medium">Total</span>
                    </div>
                    <div className="text-2xl font-bold">{deliveries.length}</div>
                    <div className="text-blue-100 text-xs">Deliveries</div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                    <FaBox className="text-lg text-white" />
                  </div>
                </div>
              </div>

              {/* Pending Deliveries */}
              <div className="group relative transform hover:scale-105 transition-all duration-300 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white p-4 rounded-xl shadow-lg hover:shadow-xl cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-200 rounded-full animate-pulse"></div>
                      <span className="text-orange-100 text-sm font-medium">Pending</span>
                    </div>
                    <div className="text-2xl font-bold">{deliveries.filter(d => ['assigned', 'accepted', 'in-transit'].includes(d.status)).length}</div>
                    <div className="text-orange-100 text-xs">Active</div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                    <FaClock className="text-lg text-white" />
                  </div>
                </div>
              </div>

              {/* Completed Deliveries */}
              <div className="group relative transform hover:scale-105 transition-all duration-300 bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-200 rounded-full animate-pulse"></div>
                      <span className="text-emerald-100 text-sm font-medium">Completed</span>
                    </div>
                    <div className="text-2xl font-bold">{deliveries.filter(d => d.status === 'delivered').length}</div>
                    <div className="text-emerald-100 text-xs">Delivered</div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                    <FaCheckCircle className="text-lg text-white" />
                  </div>
                </div>
              </div>

              {/* Cancelled Deliveries */}
              <div className="group relative transform hover:scale-105 transition-all duration-300 bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-200 rounded-full animate-pulse"></div>
                      <span className="text-red-100 text-sm font-medium">Cancelled</span>
                    </div>
                    <div className="text-2xl font-bold">{deliveries.filter(d => d.status === 'cancelled').length}</div>
                    <div className="text-red-100 text-xs">Cancelled</div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                    <FaTimes className="text-lg text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.includes("Error") || message.includes("denied") 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-green-50 border-green-200 text-green-800'
          } animate-fadeInUp`}>
            <div className="flex items-center space-x-3">
              {message.includes("Error") || message.includes("denied") ? (
                <FaTimes className="text-red-500" />
              ) : (
                <FaCheckCircle className="text-green-500" />
              )}
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Deliveries Section */}
        <div className="bg-white/80 rounded-xl shadow-lg p-6 backdrop-blur-sm border border-white/50 animate-fadeInUp">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-[#8B4513] to-[#A0522D] rounded-xl">
                <FaShippingFast className="text-xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#8B4513]">
                My Deliveries ({deliveries.length})
              </h3>
            </div>
            <div className="px-4 py-2 bg-[#A0522D]/10 text-[#A0522D] text-sm font-semibold rounded-full border border-[#A0522D]/20">
              {deliveries.length} total
            </div>
          </div>

          {deliveries.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative mb-6">
                <div className="inline-block p-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full">
                  <FaRoute className="text-4xl text-[#A0522D]" />
                </div>
              </div>
              <h4 className="text-xl font-semibold text-[#8B4513] mb-2">No Deliveries Yet</h4>
              <p className="text-gray-600">No deliveries have been assigned to you at this time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white">
                    <th className="px-6 py-4 text-left font-semibold rounded-tl-lg">
                      <div className="flex items-center gap-2">
                        <FaIdCard className="text-amber-200" />
                        Delivery ID
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      <div className="flex items-center gap-2">
                        <FaBox className="text-amber-200" />
                        Order Details
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-amber-200" />
                        Customer
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      <div className="flex items-center gap-2">
                        <FaTruck className="text-amber-200" />
                        Vehicle
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-amber-200" />
                        Status
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      <div className="flex items-center gap-2">
                        <FaClock className="text-amber-200" />
                        Assigned Date
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center font-semibold rounded-tr-lg">
                      <div className="flex items-center justify-center gap-2">
                        <FaRoute className="text-amber-200" />
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deliveries.map((delivery, index) => (
                    <tr key={delivery._id} className="group hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#A0522D] to-[#CD853F] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-bold text-[#8B4513]">{delivery._id.slice(-8)}</p>
                            <p className="text-xs text-gray-500">Delivery ID</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FaBox className="text-[#A0522D] text-sm" />
                            <span className="font-semibold text-gray-800">Order:</span>
                            <span className="text-gray-600">{delivery.order?._id?.slice(-8) || "N/A"}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-800">Total:</span>
                            <span className="text-green-600 font-bold">${delivery.order?.total || "N/A"}</span>
                          </div>
                          {delivery.order?.items && (
                            <div className="text-sm text-[#A0522D] bg-amber-50 px-2 py-1 rounded">
                              {delivery.order.items.length} item(s)
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {delivery.order?.shippingAddress ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <FaUser className="text-[#A0522D] text-sm" />
                              <span className="font-semibold text-gray-800">
                                {delivery.order.shippingAddress.firstName} {delivery.order.shippingAddress.lastName}
                              </span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <FaMapMarkerAlt className="text-[#A0522D] text-sm mt-1" />
                              <div className="text-sm text-gray-600">
                                <div>{delivery.order.shippingAddress.address}</div>
                                <div>{delivery.order.shippingAddress.city}, {delivery.order.shippingAddress.postalCode}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FaPhone className="text-[#A0522D] text-sm" />
                              <span className="text-sm text-gray-600">{delivery.order.shippingAddress.phone}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">{delivery.order?.user || "N/A"}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {delivery.vehicle ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <FaTruck className="text-[#A0522D] text-sm" />
                              <span className="font-semibold text-gray-800">{delivery.vehicle.vehicleType}</span>
                            </div>
                            <div className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                              {delivery.vehicle.insuranceNo}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            delivery.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                            delivery.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                            delivery.status === 'in-transit' ? 'bg-orange-100 text-orange-800' :
                            delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            delivery.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {delivery.status === 'assigned' && <FaClock className="mr-1" />}
                            {delivery.status === 'accepted' && <FaCheckCircle className="mr-1" />}
                            {delivery.status === 'in-transit' && <FaShippingFast className="mr-1" />}
                            {delivery.status === 'delivered' && <FaCheckCircle className="mr-1" />}
                            {delivery.status === 'cancelled' && <FaTimes className="mr-1" />}
                            {delivery.status}
                          </span>
                          {delivery.status === 'delivered' && delivery.actualDelivery && (
                            <div className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded">
                              Delivered: {new Date(delivery.actualDelivery).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {new Date(delivery.assignedAt || delivery.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          {getNextStatusOptions(delivery.status).map(option => (
                            <button
                              key={option.value}
                              onClick={() => updateDeliveryStatus(delivery._id, option.value)}
                              disabled={updatingStatus[delivery._id]}
                              className={`group relative px-4 py-2 bg-gradient-to-r from-[#A0522D] to-[#CD853F] text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium text-sm ${
                                updatingStatus[delivery._id] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                            >
                              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
                              <div className="relative flex items-center justify-center space-x-2">
                                {option.value === 'accepted' && <FaCheckCircle />}
                                {option.value === 'in-transit' && <FaShippingFast />}
                                {option.value === 'delivered' && <FaCheckCircle />}
                                <span>{updatingStatus[delivery._id] ? 'Updating...' : option.label}</span>
                              </div>
                            </button>
                          ))}
                          {getNextStatusOptions(delivery.status).length === 0 && delivery.status !== 'cancelled' && (
                            <div className="text-center py-2">
                              <span className="text-[#A0522D] text-sm font-medium">
                                {delivery.status === 'delivered' ? '✓ Complete' : 'No actions available'}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
