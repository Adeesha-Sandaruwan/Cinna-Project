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

// Professional animations
const animations = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(60px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-60px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes gentleBounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }

  @keyframes professionalPulse {
    0% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
    }
    70% {
      box-shadow: 0 0 0 15px rgba(59, 130, 246, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -468px 0;
    }
    100% {
      background-position: 468px 0;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .animate-slideInRight {
    animation: slideInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .animate-slideInLeft {
    animation: slideInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .animate-scaleIn {
    animation: scaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .animate-gentleBounce {
    animation: gentleBounce 2s infinite;
  }

  .animate-professionalPulse {
    animation: professionalPulse 2s infinite;
  }

  .animate-shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .stagger-animation {
    animation-delay: calc(var(--stagger) * 150ms);
  }

  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hover-lift:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  }

  .gradient-border {
    position: relative;
    background: linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4);
    background-size: 400% 400%;
    animation: gradientShift 3s ease infinite;
  }

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .card-reveal {
    opacity: 0;
    transform: translateY(30px);
    animation: cardReveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes cardReveal {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = animations;
  document.head.appendChild(styleSheet);
}

const professionalTheme = {
  primary: "#1E40AF", // Professional blue
  secondary: "#3B82F6", // Lighter blue
  accent: "#06B6D4", // Cyan accent
  success: "#10B981", // Modern green
  warning: "#F59E0B", // Amber warning
  error: "#EF4444", // Red error
  info: "#3B82F6", // Info blue
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827"
  },
  gradient: {
    primary: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
    success: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    warning: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    error: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)"
  }
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
        console.log('Setting driver object:', JSON.stringify(loggedUser, null, 2));
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
      const response = await fetch(`/api/deliveries/driver/${driverId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      // Safely attempt to parse JSON, but fall back to text if the response isn't JSON
      let data;
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          try {
            data = text ? JSON.parse(text) : {};
          } catch (err) {
            data = { message: text || response.statusText };
          }
        }
      } catch (err) {
        console.error('Error parsing response body:', err);
        data = { message: response.statusText || 'Unexpected response' };
      }

      console.log('Response data:', data);

      if (response.ok) {
        // If backend returned something other than an array, be defensive
        if (Array.isArray(data)) {
          console.log('Setting deliveries array:', data.length, 'deliveries');
          console.log('Sample delivery structure:', data[0] ? Object.keys(data[0]) : 'No deliveries');
          setDeliveries(data);
        } else if (data && data.deliveries && Array.isArray(data.deliveries)) {
          console.log('Setting nested deliveries array:', data.deliveries.length, 'deliveries');
          setDeliveries(data.deliveries);
        } else {
          // If empty or unexpected, set empty array and log
          console.warn('Deliveries response shape unexpected, defaulting to empty array', data);
          setDeliveries([]);
        }
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
  }, []);

  // Update delivery status with optimized refresh
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
      const response = await fetch(`/api/deliveries/${deliveryId}`, {
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
      
      // Safely parse response body (may be text/html or empty)
      let data;
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          try {
            data = text ? JSON.parse(text) : {};
          } catch (err) {
            data = { message: text || response.statusText };
          }
        }
      } catch (err) {
        console.error('Error parsing response body:', err);
        data = { message: response.statusText || 'Unexpected response' };
      }

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
      await fetch(`/api/deliveries/${deliveryId}/notify`, {
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
    if (status === 'assigned') return professionalTheme.warning;
    if (status === 'accepted') return professionalTheme.info;
    if (status === 'in-transit') return professionalTheme.accent;
    if (status === 'delivered') return professionalTheme.success;
    if (status === 'cancelled') return professionalTheme.error;
    return professionalTheme.primary;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Professional Executive Header */}
          <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-slideInRight">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 opacity-50"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600"></div>
            
            <div className="relative p-10">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center space-x-8 mb-8 xl:mb-0">
                  <div className="relative group">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl animate-gentleBounce group-hover:shadow-blue-500/25 transition-all duration-500">
                      <FaTruck className="text-3xl text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center animate-professionalPulse shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-4 mb-3">
                      <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 animate-fadeInUp">
                        Driver Portal
                      </h1>
                      <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-full shadow-lg animate-scaleIn">
                        PREMIUM
                      </div>
                    </div>
                    <div className="text-xl text-gray-700 font-semibold animate-fadeInUp flex items-center space-x-3" style={{animationDelay: '0.1s'}}>
                      <span>Welcome back,</span>
                      <span className="text-blue-700 font-black">
                        {(typeof driver.profile?.name === 'string' ? driver.profile.name : null) || 
                         (typeof driver.username === 'string' ? driver.username : 'Driver')}
                      </span>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    </div>
                    <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Driver ID: <span className="font-mono font-bold text-blue-700">{driver.id?.slice(-6) || 'N/A'}</span></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaClock className="text-gray-500" />
                        <span>Last Login: <span className="font-semibold">Today</span></span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col xl:flex-row items-center space-y-4 xl:space-y-0 xl:space-x-8">
                  <div className="text-center animate-scaleIn bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border border-blue-200 hover-lift" style={{animationDelay: '0.2s'}}>
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                      {deliveries.filter(d => ['assigned', 'accepted', 'in-transit'].includes(d.status)).length}
                    </div>
                    <div className="text-sm text-blue-700 font-bold uppercase tracking-wider">Active Tasks</div>
                    <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2"></div>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <div className="px-8 py-4 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700 text-white rounded-2xl shadow-xl animate-scaleIn hover-lift transform hover:scale-105 transition-all duration-300" style={{animationDelay: '0.3s'}}>
                      <div className="flex items-center space-x-4">
                        <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                        <span className="font-black text-lg tracking-wider">ACTIVE & ONLINE</span>
                        <div className="w-4 h-4 bg-white/30 rounded-full animate-ping"></div>
                      </div>
                    </div>
                    
                    <div className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-lg animate-scaleIn text-center" style={{animationDelay: '0.4s'}}>
                      <div className="flex items-center justify-center space-x-2">
                        <FaCheckCircle className="text-sm" />
                        <span className="font-bold text-sm">Verified Driver</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Profile Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {/* Executive Driver Information Card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden card-reveal hover-lift group" style={{animationDelay: '0.4s'}}>
              <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-8 py-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                <div className="relative flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl">
                    <FaUser className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Executive Profile</h3>
                    <p className="text-blue-200 font-medium">Professional Driver Information</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold rounded-full shadow-lg">
                    VERIFIED
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="flex items-center space-x-6 p-6 bg-white rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-500 group/item shadow-lg hover:shadow-xl border border-gray-100 stagger-animation" style={{'--stagger': 1}}>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300 shadow-lg">
                    <FaIdCard className="text-white text-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Full Name</div>
                    <div className="text-gray-900 font-black text-lg">
                      {(typeof driver.profile?.name === 'string' ? driver.profile.name : null) || 
                       (typeof driver.username === 'string' ? driver.username : 'Driver')}
                    </div>
                    <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 p-6 bg-white rounded-2xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all duration-500 group/item shadow-lg hover:shadow-xl border border-gray-100 stagger-animation" style={{'--stagger': 2}}>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300 shadow-lg">
                    <FaEnvelope className="text-white text-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Email Address</div>
                    <div className="text-gray-900 font-black text-lg break-all">
                      {typeof driver.email === 'string' ? driver.email : 'Email not available'}
                    </div>
                    <div className="w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mt-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 p-6 bg-white rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-500 group/item shadow-lg hover:shadow-xl border border-gray-100 stagger-animation" style={{'--stagger': 3}}>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300 shadow-lg">
                    <FaPhone className="text-white text-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Phone Number</div>
                    <div className="text-gray-900 font-black text-lg">{driver.profile?.phone || "Not provided"}</div>
                    <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mt-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 p-6 bg-white rounded-2xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-500 group/item shadow-lg hover:shadow-xl border border-gray-100 stagger-animation" style={{'--stagger': 4}}>
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300 shadow-lg">
                    <FaMapMarkerAlt className="text-white text-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Service Address</div>
                    <div className="text-gray-900 font-black text-lg">{driver.profile?.address || "Not provided"}</div>
                    <div className="w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full mt-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Analytics Dashboard */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden card-reveal hover-lift group" style={{animationDelay: '0.5s'}}>
              <div className="relative bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 px-8 py-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl">
                      <FaClipboardList className="text-2xl text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">Performance Analytics</h3>
                      <p className="text-emerald-200 font-medium">Real-time delivery metrics</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-white">{((deliveries.filter(d => d.status === 'delivered').length / Math.max(deliveries.length, 1)) * 100).toFixed(0)}%</div>
                    <div className="text-emerald-200 text-sm font-bold">Success Rate</div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 bg-gradient-to-br from-slate-50 to-emerald-50">
                <div className="grid grid-cols-2 gap-6">
                  {/* Total Deliveries */}
                  <div className="group/stat relative bg-white p-8 rounded-3xl border-2 border-blue-100 hover:border-blue-300 hover-lift cursor-pointer stagger-animation transform hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-2xl" style={{'--stagger': 1}}>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/10 rounded-3xl opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center animate-float shadow-2xl group-hover/stat:shadow-blue-500/25">
                          <FaBox className="text-white text-2xl" />
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">{deliveries.length}</div>
                          <div className="text-xs text-blue-600 font-black uppercase tracking-widest">Total Tasks</div>
                        </div>
                      </div>
                      <div className="text-sm text-blue-700 font-bold uppercase tracking-wider">Total Deliveries</div>
                      <div className="w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-3 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>

                  {/* Active Deliveries */}
                  <div className="group/stat relative bg-white p-8 rounded-3xl border-2 border-amber-100 hover:border-amber-300 hover-lift cursor-pointer stagger-animation transform hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-2xl" style={{'--stagger': 2}}>
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-600/10 rounded-3xl opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center animate-float shadow-2xl group-hover/stat:shadow-amber-500/25" style={{animationDelay: '0.5s'}}>
                          <FaClock className="text-white text-2xl" />
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-700">{deliveries.filter(d => ['assigned', 'accepted', 'in-transit'].includes(d.status)).length}</div>
                          <div className="text-xs text-amber-600 font-black uppercase tracking-widest">Active Now</div>
                        </div>
                      </div>
                      <div className="text-sm text-amber-700 font-bold uppercase tracking-wider">In Progress</div>
                      <div className="w-full h-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full mt-3 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>

                  {/* Completed Deliveries */}
                  <div className="group/stat relative bg-white p-8 rounded-3xl border-2 border-emerald-100 hover:border-emerald-300 hover-lift cursor-pointer stagger-animation transform hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-2xl" style={{'--stagger': 3}}>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-600/10 rounded-3xl opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center animate-float shadow-2xl group-hover/stat:shadow-emerald-500/25" style={{animationDelay: '1s'}}>
                          <FaCheckCircle className="text-white text-2xl" />
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-700">{deliveries.filter(d => d.status === 'delivered').length}</div>
                          <div className="text-xs text-emerald-600 font-black uppercase tracking-widest">Delivered</div>
                        </div>
                      </div>
                      <div className="text-sm text-emerald-700 font-bold uppercase tracking-wider">Completed</div>
                      <div className="w-full h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mt-3 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>

                  {/* Cancelled Deliveries */}
                  <div className="group/stat relative bg-white p-8 rounded-3xl border-2 border-red-100 hover:border-red-300 hover-lift cursor-pointer stagger-animation transform hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-2xl" style={{'--stagger': 4}}>
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/10 rounded-3xl opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center animate-float shadow-2xl group-hover/stat:shadow-red-500/25" style={{animationDelay: '1.5s'}}>
                          <FaTimes className="text-white text-2xl" />
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-700">{deliveries.filter(d => d.status === 'cancelled').length}</div>
                          <div className="text-xs text-red-600 font-black uppercase tracking-widest">Cancelled</div>
                        </div>
                      </div>
                      <div className="text-sm text-red-700 font-bold uppercase tracking-wider">Failed Tasks</div>
                      <div className="w-full h-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full mt-3 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Messages */}
          {message && (
            <div className={`p-4 rounded-xl border shadow-sm ${
              message.includes("Error") || message.includes("denied") 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : 'bg-green-50 border-green-200 text-green-800'
            } animate-slideInLeft`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.includes("Error") || message.includes("denied") 
                    ? 'bg-red-100' 
                    : 'bg-green-100'
                }`}>
                  {message.includes("Error") || message.includes("denied") ? (
                    <FaTimes className="text-red-600 text-sm" />
                  ) : (
                    <FaCheckCircle className="text-green-600 text-sm" />
                  )}
                </div>
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          {/* Executive Deliveries Management Section */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden card-reveal" style={{animationDelay: '0.6s'}}>
            <div className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 px-10 py-8">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-18 h-18 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl">
                    <FaShippingFast className="text-3xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white mb-2">Delivery Management Center</h3>
                    <p className="text-indigo-200 font-medium text-lg">Professional task coordination and execution</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-300 text-sm font-bold">Live Updates</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                        <span className="text-blue-300 text-sm font-bold">Real-time Sync</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-black text-white">{deliveries.length}</div>
                  <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest">Total Tasks</div>
                  <div className="mt-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold rounded-full shadow-lg">
                    ACTIVE QUEUE
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              {deliveries.length === 0 ? (
                <div className="text-center py-16 animate-fadeInUp">
                  <div className="relative mb-6">
                    <div className="inline-block p-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full animate-gentleBounce">
                      <FaRoute className="text-4xl text-gray-400" />
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">No Deliveries Assigned</h4>
                  <p className="text-gray-500">Your delivery queue is empty. New assignments will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {deliveries.map((delivery, index) => (
                    <div key={delivery._id} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 card-reveal stagger-animation" style={{'--stagger': index + 1}}>
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-slate-800 via-gray-900 to-slate-800 px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                              #{index + 1}
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-white">Task ID: {delivery._id.slice(-8)}</h3>
                              <p className="text-blue-200 font-medium">Delivery Assignment</p>
                            </div>
                          </div>
                          <div className={`px-4 py-2 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg ${
                            delivery.status === 'assigned' ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white' :
                            delivery.status === 'accepted' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' :
                            delivery.status === 'in-transit' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' :
                            delivery.status === 'delivered' ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' :
                            delivery.status === 'cancelled' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                            'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                          }`}>
                            {delivery.status}
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                          {/* Order Details */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-black text-gray-900 flex items-center">
                              <FaBox className="text-emerald-500 mr-2" />
                              Order Details
                            </h4>
                            <div className="space-y-3">
                              <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                                <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Order ID</div>
                                <div className="font-black text-emerald-700">{delivery.order?._id?.slice(-8) || "N/A"}</div>
                              </div>
                              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Total Amount</div>
                                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-700">${delivery.order?.total || "N/A"}</div>
                              </div>
                              {delivery.order?.items && (
                                <div className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full shadow-lg">
                                  <span className="font-black text-sm">{delivery.order.items.length} Items</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-black text-gray-900 flex items-center">
                              <FaUser className="text-purple-500 mr-2" />
                              Customer Info
                            </h4>
                            {delivery.order?.shippingAddress ? (
                              <div className="space-y-3">
                                <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                                  <div className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">Name</div>
                                  <div className="font-black text-gray-900">
                                    {delivery.order.shippingAddress.firstName} {delivery.order.shippingAddress.lastName}
                                  </div>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                                  <div className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Address</div>
                                  <div className="text-sm font-medium text-gray-700">
                                    <div>{delivery.order.shippingAddress.address}</div>
                                    <div className="text-orange-600 font-semibold">{delivery.order.shippingAddress.city}, {delivery.order.shippingAddress.postalCode}</div>
                                  </div>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                  <div className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Phone</div>
                                  <div className="font-bold text-green-700">{delivery.order.shippingAddress.phone}</div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 bg-gray-100 rounded-xl text-center">
                                <span className="text-gray-500 font-medium">
                                  {delivery.order?.user?.username || 
                                   (delivery.firstName && delivery.lastName ? `${delivery.firstName} ${delivery.lastName}` : null) ||
                                   "Customer Info Not Available"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Vehicle & Actions */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-black text-gray-900 flex items-center">
                              <FaTruck className="text-orange-500 mr-2" />
                              Vehicle & Actions
                            </h4>
                            {delivery.vehicle ? (
                              <div className="space-y-3">
                                <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                                  <div className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Vehicle Type</div>
                                  <div className="font-black text-gray-900">{delivery.vehicle.vehicleType}</div>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-slate-100 to-gray-200 rounded-xl border border-gray-300">
                                  <div className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">Insurance No</div>
                                  <div className="font-black text-gray-900">{delivery.vehicle.insuranceNo}</div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 bg-gray-100 rounded-xl text-center">
                                <span className="text-gray-500 font-medium">No Vehicle Assigned</span>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-4 border-t border-gray-200">
                              {getNextStatusOptions(delivery.status).map(option => (
                                <button
                                  key={option.value}
                                  onClick={() => updateDeliveryStatus(delivery._id, option.value)}
                                  disabled={updatingStatus[delivery._id]}
                                  className={`w-full group relative px-6 py-4 text-white rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 font-black text-sm hover-lift overflow-hidden ${
                                    updatingStatus[delivery._id] 
                                      ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                                      : option.value === 'accepted'
                                      ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800'
                                      : option.value === 'in-transit'
                                      ? 'bg-gradient-to-r from-orange-600 via-orange-700 to-red-700 hover:from-orange-700 hover:via-red-700 hover:to-red-800'
                                      : 'bg-gradient-to-r from-emerald-600 via-green-700 to-teal-700 hover:from-emerald-700 hover:via-green-800 hover:to-teal-800'
                                  }`}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                  <div className="relative flex items-center justify-center space-x-3">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/20">
                                      {option.value === 'accepted' && <FaCheckCircle className="text-white text-sm" />}
                                      {option.value === 'in-transit' && <FaShippingFast className="text-white text-sm" />}
                                      {option.value === 'delivered' && <FaCheckCircle className="text-white text-sm" />}
                                    </div>
                                    <span className="uppercase tracking-wider">
                                      {updatingStatus[delivery._id] ? 'PROCESSING...' : option.label.toUpperCase()}
                                    </span>
                                  </div>
                                </button>
                              ))}
                              {getNextStatusOptions(delivery.status).length === 0 && delivery.status !== 'cancelled' && (
                                <div className="w-full text-center py-4 px-6 bg-gradient-to-br from-slate-100 to-gray-200 rounded-2xl border-2 border-gray-300 shadow-lg">
                                  <div className="flex items-center justify-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      delivery.status === 'delivered' 
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                                        : 'bg-gradient-to-r from-gray-500 to-gray-600'
                                    }`}>
                                      {delivery.status === 'delivered' ? (
                                        <FaCheckCircle className="text-white text-sm" />
                                      ) : (
                                        <FaClock className="text-white text-sm" />
                                      )}
                                    </div>
                                    <span className={`text-sm font-black uppercase tracking-wider ${
                                      delivery.status === 'delivered' 
                                        ? 'text-emerald-700' 
                                        : 'text-gray-700'
                                    }`}>
                                      {delivery.status === 'delivered' ? 'TASK COMPLETED' : 'NO ACTIONS AVAILABLE'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Assignment Date */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FaClock className="text-indigo-500" />
                              <span className="font-bold text-gray-700">Assignment Date:</span>
                            </div>
                            <div className="text-right">
                              <div className="font-black text-indigo-900 text-lg">
                                {new Date(delivery.assignedAt || delivery.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-indigo-600 font-semibold">
                                {new Date(delivery.assignedAt || delivery.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          {delivery.status === 'delivered' && delivery.actualDelivery && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Completed On:</span>
                                <span className="font-black text-emerald-700">{new Date(delivery.actualDelivery).toLocaleDateString()}</span>
                              </div>
                            </div>
                          )}
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