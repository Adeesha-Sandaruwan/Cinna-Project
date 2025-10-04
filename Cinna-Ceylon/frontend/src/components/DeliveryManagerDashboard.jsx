import React, { useEffect, useState } from "react";
import "./DeliveryManagerDashboard.css";

const cinnamon = {
  primary: "#8B4513", // Rich cinnamon brown
  secondary: "#A0522D", // Medium cinnamon
  accent: "#D2691E", // Warm cinnamon orange
  light: "#F4E4BC", // Light cinnamon cream
  bg: "#FDF8F0", // Warm off-white background
  cardBg: "#FFFFFF", // Pure white for cards
  highlight: "#FFEEDD", // Soft highlight
  success: "#22C55E", // Success green
  warning: "#F59E0B", // Warning amber
  error: "#EF4444", // Error red
  info: "#3B82F6", // Info blue
  text: {
    primary: "#2D1B0E", // Dark brown text
    secondary: "#6B5B4D", // Medium brown text
    light: "#A0918A", // Light brown text
  },
  shadow: "0 4px 20px rgba(139, 69, 19, 0.15)", // Cinnamon shadow
  shadowLight: "0 2px 10px rgba(139, 69, 19, 0.1)", // Light cinnamon shadow
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

  // Fetch orders, drivers, vehicles, and deliveries
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    // Fetch available orders (not yet assigned to deliveries)
    fetch("http://localhost:5000/api/deliveries/available-orders")
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error("Error fetching orders:", err));
    
    // Fetch drivers using the dedicated endpoint
    fetch("http://localhost:5000/api/users/drivers")
      .then(res => {
        console.log('Drivers response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Drivers data:', data);
        setDrivers(data);
      })
      .catch(err => {
        console.error("Error fetching drivers from /api/users/drivers:", err);
        // Fallback to query parameter approach
        return fetch("http://localhost:5000/api/users?role=driver")
          .then(res => {
            console.log('Fallback drivers response status:', res.status);
            return res.json();
          })
          .then(data => {
            console.log('Fallback drivers data:', data);
            setDrivers(data);
          });
      })
      .catch(err => {
        console.error("Error fetching drivers (both endpoints failed):", err);
        setDrivers([]); // Set empty array to show "No drivers available"
        setMessage("Failed to fetch drivers. Please ensure drivers are registered in the system or refresh the page.");
      });
    
    // Fetch available vehicles
    fetch("http://localhost:5000/api/vehicles")
      .then(res => res.json())
      .then(data => setVehicles(data.filter(v => v.status === 'Available')))
      .catch(err => console.error("Error fetching vehicles:", err));

    // Fetch existing deliveries
    fetch("http://localhost:5000/api/deliveries")
      .then(res => res.json())
      .then(data => setDeliveries(data))
      .catch(err => console.error("Error fetching deliveries:", err));
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
      // Create delivery assignment using the proper delivery endpoint
      const res = await fetch("http://localhost:5000/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId, 
          driverId, 
          vehicleId,
          notes: assignment.notes || `Assignment for order ${orderId}`
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage("Order assigned successfully and delivery record created!");
        // Refresh data to update both available orders and deliveries
        fetchData();
        // Clear the assignment form for this order
        setAssigning(prev => {
          const newState = { ...prev };
          delete newState[orderId];
          return newState;
        });
      } else {
        setMessage(data.message || "Error assigning order.");
      }
    } catch (err) {
      console.error("Assignment error:", err);
      setMessage("Network error. Please try again.");
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-800 via-orange-700 to-amber-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Delivery Management
                </h1>
                <p className="text-amber-100 mt-1">
                  Cinna Ceylon Distribution Hub
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-amber-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{orders.length}</div>
                <div className="text-sm">Pending Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{deliveries.length}</div>
                <div className="text-sm">Active Deliveries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{drivers.length}</div>
                <div className="text-sm">Available Drivers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Message Alert */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl border-l-4 shadow-lg ${
            message.includes("Error") 
              ? "bg-red-50 border-red-400 text-red-800" 
              : "bg-emerald-50 border-emerald-400 text-emerald-800"
          }`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${
                message.includes("Error") ? "text-red-400" : "text-emerald-400"
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

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white p-1 rounded-xl shadow-lg border border-amber-100">
            <button
              onClick={() => setActiveTab("assign")}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === "assign"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg transform scale-105"
                  : "text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Assign Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("deliveries")}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === "deliveries"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg transform scale-105"
                  : "text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Active Deliveries ({deliveries.length})
            </button>
          </nav>
        </div>

        {/* Assignment Tab */}
        {activeTab === "assign" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-amber-800 flex items-center">
                <svg className="w-7 h-7 mr-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Orders Available for Assignment
              </h3>
              <div className="text-amber-600 font-medium">
                {orders.length} pending orders
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden cinnamon-hover-lift">
              <div className="overflow-x-auto cinnamon-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-amber-700 to-orange-700 text-white">
                      <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                      <th className="px-6 py-4 text-left font-semibold">Customer</th>
                      <th className="px-6 py-4 text-left font-semibold">Total</th>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                      <th className="px-6 py-4 text-left font-semibold">Assignment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {orders.map((order, index) => (
                      <tr 
                        key={order._id} 
                        className={`hover:bg-amber-50 transition-colors duration-150 table-row-hover ${
                          index % 2 === 0 ? "bg-white" : "bg-amber-25"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white text-xs font-bold">
                                #{order._id.slice(-4)}
                              </span>
                            </div>
                            <span className="font-medium text-gray-700">{order._id.slice(-8)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-800 font-medium">
                            {order.shippingAddress ? 
                              `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : 
                              order.user}
                          </div>
                          {order.shippingAddress && (
                            <div className="text-sm text-gray-500 mt-1">
                              {order.shippingAddress.city}, {order.shippingAddress.state}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-green-600">${order.total}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium status-dot ${order.status} ${
                            order.status === 'pending' 
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200" 
                              : "bg-green-100 text-green-800 border border-green-200"
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              order.status === 'pending' ? "bg-yellow-400" : "bg-green-400"
                            }`}></div>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-3 max-w-md">
                            <div className="flex space-x-3">
                              <select
                                value={assigning[order._id]?.driverId || ""}
                                onChange={e => handleChange(order._id, "driverId", e.target.value)}
                                className="flex-1 px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-700 font-medium cinnamon-focus"
                              >
                                <option value="">Select Driver</option>
                                {drivers.length === 0 ? (
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
                              <select
                                value={assigning[order._id]?.vehicleId || ""}
                                onChange={e => handleChange(order._id, "vehicleId", e.target.value)}
                                className="flex-1 px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-700 font-medium cinnamon-focus"
                              >
                                <option value="">Select Vehicle</option>
                                {vehicles.length === 0 ? (
                                  <option value="" disabled>No vehicles available</option>
                                ) : (
                                  vehicles.map(vehicle => (
                                    <option key={vehicle._id} value={vehicle._id}>
                                      {vehicle.vehicleType} - {vehicle.insuranceNo} (Capacity: {vehicle.capacity})
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>
                            <div className="flex space-x-3">
                              <input
                                type="text"
                                placeholder="Assignment notes (optional)"
                                value={assigning[order._id]?.notes || ""}
                                onChange={e => handleNotesChange(order._id, e.target.value)}
                                className="flex-1 px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-700 cinnamon-focus"
                              />
                              <button
                                onClick={() => handleAssign(order._id)}
                                disabled={!assigning[order._id]?.driverId || !assigning[order._id]?.vehicleId || assigningInProgress[order._id]}
                                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 cinnamon-button ${
                                  (!assigning[order._id]?.driverId || !assigning[order._id]?.vehicleId || assigningInProgress[order._id])
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                }`}
                              >
                                {assigningInProgress[order._id] ? (
                                  <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="m12 6c3.314 0 6 2.686 6 6 0 1.657-.672 3.157-1.757 4.243l-1.414-1.414c.723-.723 1.171-1.722 1.171-2.829 0-2.209-1.791-4-4-4v-2z"></path>
                                    </svg>
                                    <span>Assigning...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Assign</span>
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
                {orders.length === 0 && (
                  <div className="text-center py-16">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-amber-800 mb-2">No Orders Available</h4>
                        <p className="text-amber-600 max-w-md">
                          All orders have been assigned or there are no pending orders at the moment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Deliveries Tab */}
        {activeTab === "deliveries" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-amber-800 flex items-center">
                <svg className="w-7 h-7 mr-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 8h4m-6 8V7a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2z" />
                </svg>
                Active Delivery Assignments
              </h3>
              <div className="text-amber-600 font-medium">
                {deliveries.length} active deliveries
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden cinnamon-hover-lift">
              <div className="overflow-x-auto cinnamon-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-amber-700 to-orange-700 text-white">
                      <th className="px-6 py-4 text-left font-semibold">Delivery ID</th>
                      <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                      <th className="px-6 py-4 text-left font-semibold">Driver</th>
                      <th className="px-6 py-4 text-left font-semibold">Vehicle</th>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                      <th className="px-6 py-4 text-left font-semibold">Assigned Date</th>
                      <th className="px-6 py-4 text-left font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {deliveries.map((delivery, index) => (
                      <tr 
                        key={delivery._id} 
                        className={`hover:bg-amber-50 transition-colors duration-150 table-row-hover delivery-card ${
                          index % 2 === 0 ? "bg-white" : "bg-amber-25"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white text-xs font-bold">
                                #{delivery._id.slice(-4)}
                              </span>
                            </div>
                            <span className="font-medium text-gray-700">{delivery._id.slice(-8)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-amber-100 text-amber-800">
                            #{delivery.order?._id?.slice(-8) || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-gray-800 font-medium">
                                {delivery.driver ? 
                                  (delivery.driver.profile?.name || delivery.driver.username) : 
                                  "Unknown Driver"}
                              </div>
                              <div className="text-sm text-gray-500">Driver</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-gray-800 font-medium">
                                {delivery.vehicle ? 
                                  delivery.vehicle.vehicleType : 
                                  "Unknown Vehicle"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {delivery.vehicle?.insuranceNo || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium status-dot ${delivery.status} ${
                            delivery.status === 'assigned' 
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200" 
                              : delivery.status === 'in-transit' 
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : delivery.status === 'delivered' 
                              ? "bg-green-100 text-green-800 border border-green-200" 
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              delivery.status === 'assigned' ? "bg-yellow-400" 
                              : delivery.status === 'in-transit' ? "bg-blue-400"
                              : delivery.status === 'delivered' ? "bg-green-400" 
                              : "bg-red-400"
                            }`}></div>
                            {delivery.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-700 font-medium">
                            {new Date(delivery.assignedAt || delivery.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(delivery.assignedAt || delivery.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {delivery.notes ? (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
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
                {deliveries.length === 0 && (
                  <div className="text-center py-16">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 8h4m-6 8V7a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-amber-800 mb-2">No Active Deliveries</h4>
                        <p className="text-amber-600 max-w-md">
                          There are currently no active delivery assignments to display.
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
