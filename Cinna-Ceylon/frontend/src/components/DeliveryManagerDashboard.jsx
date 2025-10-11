import React, { useEffect, useState } from "react";
import { FaTruck, FaUser, FaClipboardList, FaPlus, FaReceipt, FaSpinner } from "react-icons/fa";
import "./DeliveryManagerDashboard.css";

const cinnamon = {
  primary: "#8B4513", // Rich cinnamon brown
  secondary: "#A0522D", // Medium cinnamon
  accent: "#D2691E", // Warm cinnamon orange
  light: "#F4E4BC", // Light cinnamon cream
  bg: "#FAFAFA", // Professional light gray background
  cardBg: "#FFFFFF", // Pure white for cards
  highlight: "#FFEEDD", // Soft highlight
  success: "#10B981", // Modern success green
  warning: "#F59E0B", // Warning amber
  error: "#EF4444", // Error red
  info: "#3B82F6", // Info blue
  text: {
    primary: "#111827", // Professional dark text
    secondary: "#6B7280", // Medium gray text
    light: "#9CA3AF", // Light gray text
  },
  shadow: "0 4px 25px rgba(0, 0, 0, 0.08)", // Professional shadow
  shadowLight: "0 2px 8px rgba(0, 0, 0, 0.04)", // Light professional shadow
  shadowCard: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)", // Card shadow
};

const DeliveryManagerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [assigning, setAssigning] = useState({});
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("assign"); // "assign" or "deliveries"
  const [assigningInProgress, setAssigningInProgress] = useState({}); // Track loading state for each order

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    } : {
      'Content-Type': 'application/json'
    };
  };



  // Fetch orders, drivers, vehicles, and deliveries
  useEffect(() => {
    fetchData();
  }, []);

  // Safely parse responses that might not be JSON
  const safeParseResponse = async (res) => {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (parseErr) {
      // non-JSON response, return raw text
      return text;
    }
  };

  const fetchData = async () => {
    // Fetch all orders with authentication (robust to non-JSON responses)
    try {
      const ordersRes = await fetch('/api/orders', { method: 'GET', headers: getAuthHeaders() });
      const ordersData = await safeParseResponse(ordersRes);
      if (!ordersRes.ok) {
        const errMsg = (ordersData && typeof ordersData === 'object' && ordersData.message) || (typeof ordersData === 'string' ? ordersData : `status ${ordersRes.status}`);
        throw new Error(`Failed to fetch orders: ${errMsg}`);
      }
      if (Array.isArray(ordersData)) {
        const pendingOrders = ordersData.filter(order => order.status === 'pending' || order.status === 'confirmed');
        setOrders(pendingOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setOrders([]);
      setMessage('Failed to fetch orders. Please check your connection or refresh the page.');
    }

    // Fetch all users and filter for drivers
    try {
      const usersRes = await fetch('/api/admin/users', { method: 'GET', headers: getAuthHeaders() });
      const usersData = await safeParseResponse(usersRes);
      if (!usersRes.ok) {
        const errMsg = (usersData && typeof usersData === 'object' && usersData.message) || (typeof usersData === 'string' ? usersData : `status ${usersRes.status}`);
        throw new Error(`Failed to fetch users: ${errMsg}`);
      }
      if (Array.isArray(usersData)) {
        const driversList = usersData.filter(user => user.userType === 'driver');
        setDrivers(driversList);
      } else {
        setDrivers([]);
      }
    } catch (err) {
      console.error('❌ Error fetching drivers:', err);
      setDrivers([]);
      setMessage('Failed to fetch drivers. Please ensure you have admin access or refresh the page.');
    }
    // Fetch available vehicles with authentication
    try {
      const vehiclesRes = await fetch('/api/vehicles', { method: 'GET', headers: getAuthHeaders() });
      const vehiclesData = await safeParseResponse(vehiclesRes);
      if (!vehiclesRes.ok) {
        const errMsg = (vehiclesData && typeof vehiclesData === 'object' && vehiclesData.message) || (typeof vehiclesData === 'string' ? vehiclesData : `status ${vehiclesRes.status}`);
        throw new Error(errMsg);
      }
      const vehicleArray = Array.isArray(vehiclesData) ? vehiclesData : [];
      setVehicles(vehicleArray.filter(v => v.status === 'Available'));
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setVehicles([]);
    }

    // Fetch existing deliveries with authentication
    try {
      const deliveriesRes = await fetch('/api/deliveries', { method: 'GET', headers: getAuthHeaders() });
      const deliveriesData = await safeParseResponse(deliveriesRes);
      if (!deliveriesRes.ok) {
        const errMsg = (deliveriesData && typeof deliveriesData === 'object' && deliveriesData.message) || (typeof deliveriesData === 'string' ? deliveriesData : `status ${deliveriesRes.status}`);
        throw new Error(errMsg);
      }
      setDeliveries(Array.isArray(deliveriesData) ? deliveriesData : []);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      setDeliveries([]);
    }
  };

  // Handle assignment form changes
  const handleChange = (orderId, field, value) => {
    setAssigning(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value
      }
    }));
  };

  // Add notes field for each assignment
  const handleNotesChange = (orderId, notes) => {
    setAssigning(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        notes
      }
    }));
  };

  // Assign driver and vehicle to order
  const handleAssign = async (orderId) => {
    setMessage("");
    
    // Prevent double submissions
    if (assigningInProgress[orderId]) {
      return;
    }
    
    const assignment = assigning[orderId];
    const { driverId, vehicleId } = assignment || {};
    
    if (!driverId || !vehicleId) {
      setMessage("Please select both driver and vehicle.");
      return;
    }

    // Set loading state for this specific order
    setAssigningInProgress(prev => ({ ...prev, [orderId]: true }));

    try {
      // Find the current order to get customer information
      const currentOrder = orders.find(order => order._id === orderId);
      if (!currentOrder) {
        setMessage("❌ Order not found. Please refresh the page.");
        return;
      }

      // Extract customer information from order
      const customerInfo = currentOrder.shippingAddress || {};
      const userInfo = currentOrder.user || {};

      // Create delivery assignment with proper structure including required customer fields
      const deliveryData = {
        // Required customer fields from Delivery model
        firstName: customerInfo.firstName || userInfo.firstName || 'Unknown',
        lastName: customerInfo.lastName || userInfo.lastName || 'Customer',
        email: customerInfo.email || userInfo.email || 'unknown@example.com',
        phoneNumber: customerInfo.phone || userInfo.phone || '+1234567890',
        houseNo: customerInfo.address || customerInfo.houseNo || 'N/A',
        postalCode: customerInfo.postalCode || '00000',
        
        // System fields
        driver: driverId,
        vehicle: vehicleId,
        status: 'assigned',
        
        // Optional fields for tracking (if model supports them)
        order: orderId,
        assignedAt: new Date().toISOString(),
        notes: assignment.notes || `Delivery assigned for order #${orderId.slice(-8)}`,
        estimatedDelivery: null,
        actualDelivery: null
      };

      const res = await fetch("/api/deliveries", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(deliveryData)
      });

      const data = await safeParseResponse(res);

      if (res.ok) {
        // Also update the order status to 'assigned' so it doesn't show in pending orders
        try {
          await fetch(`/api/orders/${orderId}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
              status: 'assigned' // Update order status
            })
          });
        } catch (orderUpdateErr) {
          console.warn("Could not update order status:", orderUpdateErr);
        }

        setMessage(`✅ Order #${orderId.slice(-8)} successfully assigned to driver and moved to deliveries!`);
        
        // Refresh data to update both available orders and deliveries
        fetchData();
        
        // Clear the assignment form for this order
        setAssigning(prev => {
          const newState = { ...prev };
          delete newState[orderId];
          return newState;
        });
      } else {
        const errMsg = (data && typeof data === 'object' && data.message) || (typeof data === 'string' ? data : `status ${res.status}`);
        setMessage(errMsg || "❌ Error creating delivery assignment.");
      }
    } catch (err) {
      console.error("Assignment error:", err);
      setMessage("❌ Network error. Please try again.");
    } finally {
      // Clear loading state for this specific order
      setAssigningInProgress(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Professional Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 animate-slideDown">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce hover:animate-pulse transition-transform duration-300 hover:scale-110">
                  <FaTruck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Delivery Management Center
                  </h1>
                  <p className="text-gray-600 mt-1 font-medium">
                    Comprehensive order assignment and delivery tracking system
                  </p>
                </div>
              </div>
            </div>
            
            {/* Professional Stats Cards */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="bg-blue-50 rounded-xl px-4 py-3 border border-blue-200 animate-slideInRight transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 animate-countUp">{Array.isArray(orders) ? orders.length : 0}</div>
                  <div className="text-sm text-blue-600 font-medium">Pending Orders</div>
                </div>
              </div>
              <div className="bg-amber-50 rounded-xl px-4 py-3 border border-amber-200 animate-slideInRight transition-all duration-300 hover:shadow-lg hover:-translate-y-1" style={{animationDelay: '0.1s'}}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-700 animate-countUp">{Array.isArray(deliveries) ? deliveries.length : 0}</div>
                  <div className="text-sm text-amber-600 font-medium">Active Deliveries</div>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl px-4 py-3 border border-green-200 animate-slideInRight transition-all duration-300 hover:shadow-lg hover:-translate-y-1" style={{animationDelay: '0.2s'}}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700 animate-countUp">{Array.isArray(drivers) ? drivers.length : 0}</div>
                  <div className="text-sm text-green-600 font-medium">Available Drivers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Panel removed - cleaned up debugInfo references */}

        {/* Professional Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border shadow-sm animate-slideDown ${
            message.includes("Error") 
              ? "bg-red-50 border-red-200 text-red-800" 
              : "bg-green-50 border-green-200 text-green-800 success-pulse"
          }`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 transition-transform duration-300 ${
                message.includes("Error") ? "text-red-500" : "text-green-500 animate-bounce"
              }`}>
                {message.includes("Error") ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3 font-medium">
                {message}
              </div>
            </div>
          </div>
        )}

        {/* Modern Tab Navigation */}
        <div className="mb-8 animate-slideInLeft">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("assign")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                  activeTab === "assign"
                    ? "border-amber-500 text-amber-600 animate-tabActive"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FaClipboardList className={`w-5 h-5 transition-transform duration-300 ${activeTab === "assign" ? "animate-wiggle" : ""}`} />
                  <span>Order Assignments</span>
                  <span className={`bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${activeTab === "assign" ? "animate-pulse" : ""}`}>
                    {Array.isArray(orders) ? orders.length : 0}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("deliveries")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                  activeTab === "deliveries"
                    ? "border-amber-500 text-amber-600 animate-tabActive"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FaTruck className={`w-5 h-5 transition-transform duration-300 ${activeTab === "deliveries" ? "animate-wiggle" : ""}`} />
                  <span>Active Deliveries</span>
                  <span className={`bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${activeTab === "deliveries" ? "animate-pulse" : ""}`}>
                    {Array.isArray(deliveries) ? deliveries.length : 0}
                  </span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Professional Assignment Tab */}
        {activeTab === "assign" && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-slideInLeft transition-all duration-300 hover:shadow-md">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FaClipboardList className="w-6 h-6 mr-3 text-amber-600 animate-bounce" />
                  Orders Ready for Assignment
                </h2>
                <p className="text-gray-600 mt-1 animate-slideInLeft" style={{animationDelay: '0.2s'}}>Assign drivers and vehicles to pending orders</p>
              </div>
              <div className="text-right animate-slideInRight">
                <div className="text-3xl font-bold text-amber-600 animate-countUp">{Array.isArray(orders) ? orders.length : 0}</div>
                <div className="text-sm text-gray-500 font-medium">Pending Orders</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-slideInUp transition-all duration-300 hover:shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Details</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assignment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {Array.isArray(orders) && orders.map((order, index) => (
                      <tr 
                        key={order._id} 
                        className="hover:bg-gray-50 transition-all duration-300 animate-fadeInUp hover:shadow-sm transform hover:-translate-y-1"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                              <span className="text-white text-xs font-bold">
                                #{order._id.slice(-4)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{order._id.slice(-8)}</div>
                              <div className="text-xs text-gray-500">Order ID</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                              <FaUser className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.shippingAddress ? 
                                  `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : 
                                  (order.user?.username || order.user?.email || 'Unknown Customer')}
                              </div>
                              {order.shippingAddress && (
                                <div className="text-xs text-gray-500">
                                  {order.shippingAddress.city}, {order.shippingAddress.state}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-lg font-semibold text-gray-900">${order.total}</div>
                          <div className="text-xs text-gray-500">Total Amount</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'pending' 
                              ? "bg-yellow-100 text-yellow-800" 
                              : order.status === 'confirmed'
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            (order.paymentStatus === 'paid' || order.status === 'paid')
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {(order.paymentStatus === 'paid' || order.status === 'paid') ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-3 min-w-80">
                            <div className="grid grid-cols-1 gap-3 stagger-animation">
                              <div className="relative animate-slideInLeft">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Driver</label>
                                <select
                                  value={assigning[order._id]?.driverId || ""}
                                  onChange={e => handleChange(order._id, "driverId", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all duration-300 hover:border-amber-400"
                                >
                                  <option value="">Choose a driver...</option>
                                  {!Array.isArray(drivers) || drivers.length === 0 ? (
                                    <option value="" disabled>No drivers available</option>
                                  ) : (
                                    drivers.map(driver => (
                                      <option key={driver._id || driver.id} value={driver._id || driver.id}>
                                        {driver.profile?.name || 
                                         driver.username || 
                                         driver.email || 
                                         'Unknown Driver'}
                                      </option>
                                    ))
                                  )}
                                </select>
                              </div>
                              <div className="relative animate-slideInRight">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle</label>
                                <select
                                  value={assigning[order._id]?.vehicleId || ""}
                                  onChange={e => handleChange(order._id, "vehicleId", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all duration-300 hover:border-amber-400"
                                >
                                  <option value="">Choose a vehicle...</option>
                                  {!Array.isArray(vehicles) || vehicles.length === 0 ? (
                                    <option value="" disabled>No vehicles available</option>
                                  ) : (
                                    vehicles.map(vehicle => (
                                      <option key={vehicle._id} value={vehicle._id}>
                                        {vehicle.vehicleType} - {vehicle.insuranceNo}
                                      </option>
                                    ))
                                  )}
                                </select>
                              </div>
                            </div>
                            {!(order.paymentStatus === 'paid' || order.status === 'paid') && (
                              <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-medium">Payment pending</span>
                              </div>
                            )}
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Add delivery notes (optional)"
                                value={assigning[order._id]?.notes || ""}
                                onChange={e => handleNotesChange(order._id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                              />
                              <button
                                onClick={() => handleAssign(order._id)}
                                disabled={!assigning[order._id]?.driverId || !assigning[order._id]?.vehicleId || assigningInProgress[order._id]}
                                className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                                  (!assigning[order._id]?.driverId || !assigning[order._id]?.vehicleId || assigningInProgress[order._id])
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : (order.paymentStatus === 'paid' || order.status === 'paid')
                                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm'
                                }`}
                                title={!(order.paymentStatus === 'paid' || order.status === 'paid') ? 'Warning: Order not yet paid' : ''}
                              >
                                {assigningInProgress[order._id] ? (
                                  <>
                                    <FaSpinner className="animate-spin w-4 h-4" />
                                    <span className="animate-pulse">Assigning...</span>
                                  </>
                                ) : (
                                  <>
                                    <FaPlus className="w-4 h-4 transition-transform duration-300 hover:rotate-90" />
                                    <span>Assign Delivery</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!Array.isArray(orders) || orders.length === 0) && (
                  <div className="text-center py-16 bg-gray-50">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <FaClipboardList className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Pending</h3>
                        <p className="text-gray-500 max-w-md">
                          All orders have been assigned or no new orders are available for assignment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Professional Deliveries Tab */}
        {activeTab === "deliveries" && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-slideInLeft transition-all duration-300 hover:shadow-md">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FaTruck className="w-6 h-6 mr-3 text-amber-600 animate-bounce" />
                  Active Delivery Tracking
                </h2>
                <p className="text-gray-600 mt-1 animate-slideInLeft" style={{animationDelay: '0.2s'}}>Monitor ongoing deliveries and status updates</p>
              </div>
              <div className="text-right animate-slideInRight">
                <div className="text-3xl font-bold text-blue-600 animate-countUp">{Array.isArray(deliveries) ? deliveries.length : 0}</div>
                <div className="text-sm text-gray-500 font-medium">Active Deliveries</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-slideInUp transition-all duration-300 hover:shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Delivery</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {Array.isArray(deliveries) && deliveries.map((delivery, index) => (
                      <tr 
                        key={delivery._id} 
                        className="hover:bg-gray-50 transition-all duration-300 animate-fadeInUp hover:shadow-sm transform hover:-translate-y-1"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                              <span className="text-white text-xs font-bold">
                                #{delivery._id.slice(-4)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{delivery._id.slice(-8)}</div>
                              <div className="text-xs text-gray-500">Delivery ID</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                              <FaReceipt className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">#{delivery.order?._id?.slice(-8) || "N/A"}</div>
                              <div className="text-xs text-gray-500">Order Ref</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <FaUser className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {delivery.driver ? 
                                  (delivery.driver.profile?.name || delivery.driver.username) : 
                                  "Unknown Driver"}
                              </div>
                              <div className="text-xs text-gray-500">Driver</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                              <FaTruck className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {delivery.vehicle ? 
                                  delivery.vehicle.vehicleType : 
                                  "Unknown Vehicle"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {delivery.vehicle?.insuranceNo || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            delivery.status === 'assigned' 
                              ? "bg-yellow-100 text-yellow-800" 
                              : delivery.status === 'accepted'
                              ? "bg-blue-100 text-blue-800"
                              : delivery.status === 'on-delivery' 
                              ? "bg-indigo-100 text-indigo-800"
                              : delivery.status === 'delivered' 
                              ? "bg-green-100 text-green-800" 
                              : delivery.status === 'completed'
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {delivery.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            (delivery.order?.paymentStatus === 'paid' || delivery.order?.status === 'paid')
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {(delivery.order?.paymentStatus === 'paid' || delivery.order?.status === 'paid') ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">
                            {new Date(delivery.assignedAt || delivery.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(delivery.assignedAt || delivery.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {delivery.notes ? (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                                <p className="text-sm text-amber-800">{delivery.notes}</p>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-sm">No notes</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!Array.isArray(deliveries) || deliveries.length === 0) && (
                  <div className="text-center py-16 bg-gray-50">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <FaTruck className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Deliveries</h3>
                        <p className="text-gray-500 max-w-md">
                          No deliveries are currently assigned. Create assignments from the orders tab.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryManagerDashboard;
