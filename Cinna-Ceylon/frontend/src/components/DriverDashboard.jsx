import React, { useEffect, useState } from "react";

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

  // Fetch deliveries assigned to this driver
  const fetchDriverDeliveries = async (driverId, token) => {
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
        } else {
          setMessage(data.message || "Error fetching deliveries");
        }
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
      <div style={{ background: cinnamon.bg, minHeight: "100vh", padding: "2rem", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ color: cinnamon.primary, fontSize: "1.2rem" }}>Loading driver dashboard...</div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div style={{ background: cinnamon.bg, minHeight: "100vh", padding: "2rem" }}>
        <div style={{ color: cinnamon.danger, fontSize: "1.2rem", textAlign: "center" }}>
          {message || "Driver access required. Please log in as a driver."}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: cinnamon.bg, minHeight: "100vh", padding: "2rem" }}>
      {/* Driver Profile Section */}
      <div style={{ 
        background: "white", 
        borderRadius: "8px", 
        padding: "2rem", 
        marginBottom: "2rem",
        boxShadow: "0 2px 8px #A0522D22",
        border: `2px solid ${cinnamon.highlight}`
      }}>
        <h2 style={{ color: cinnamon.primary, fontWeight: "bold", fontSize: "2rem", marginBottom: "1rem" }}>
          Driver Dashboard
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <h3 style={{ color: cinnamon.accent, marginBottom: "0.5rem" }}>Driver Information</h3>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Name:</strong> {driver.profile?.name || driver.username}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Email:</strong> {driver.email}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Phone:</strong> {driver.profile?.phone || "Not provided"}
            </div>
            <div>
              <strong>Address:</strong> {driver.profile?.address || "Not provided"}
            </div>
          </div>
          
          <div>
            <h3 style={{ color: cinnamon.accent, marginBottom: "0.5rem" }}>Delivery Statistics</h3>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Total Deliveries:</strong> {deliveries.length}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Pending:</strong> {deliveries.filter(d => ['assigned', 'accepted', 'in-transit'].includes(d.status)).length}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Completed:</strong> {deliveries.filter(d => d.status === 'delivered').length}
            </div>
            <div>
              <strong>Cancelled:</strong> {deliveries.filter(d => d.status === 'cancelled').length}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div style={{ 
          color: message.includes("Error") || message.includes("denied") ? cinnamon.danger : cinnamon.success, 
          marginBottom: "1rem", 
          padding: "1rem", 
          background: message.includes("Error") || message.includes("denied") ? "#ffe6e6" : "#e6ffe6",
          borderRadius: "4px",
          border: `1px solid ${message.includes("Error") || message.includes("denied") ? cinnamon.danger : cinnamon.success}`
        }}>
          {message}
        </div>
      )}

      {/* Deliveries Section */}
      <div style={{ 
        background: "white", 
        borderRadius: "8px", 
        padding: "2rem",
        boxShadow: "0 2px 8px #A0522D22" 
      }}>
        <h3 style={{ color: cinnamon.primary, marginBottom: "1rem" }}>
          My Deliveries ({deliveries.length})
        </h3>

        {deliveries.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            color: cinnamon.primary, 
            padding: "2rem",
            background: cinnamon.highlight,
            borderRadius: "4px"
          }}>
            No deliveries assigned yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: cinnamon.primary, color: "white" }}>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>Delivery ID</th>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>Order Details</th>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>Customer</th>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>Vehicle</th>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>Assigned Date</th>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map(delivery => (
                  <tr key={delivery._id} style={{ borderBottom: `1px solid ${cinnamon.highlight}` }}>
                    <td style={{ padding: "0.75rem" }}>
                      {delivery._id.slice(-8)}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <div>
                        <strong>Order:</strong> {delivery.order?._id?.slice(-8) || "N/A"}
                      </div>
                      <div>
                        <strong>Total:</strong> ${delivery.order?.total || "N/A"}
                      </div>
                      {delivery.order?.items && (
                        <div style={{ fontSize: "0.875rem", color: cinnamon.accent }}>
                          {delivery.order.items.length} item(s)
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      {delivery.order?.shippingAddress ? (
                        <div>
                          <div>{delivery.order.shippingAddress.firstName} {delivery.order.shippingAddress.lastName}</div>
                          <div style={{ fontSize: "0.875rem", color: cinnamon.accent }}>
                            {delivery.order.shippingAddress.address}
                          </div>
                          <div style={{ fontSize: "0.875rem", color: cinnamon.accent }}>
                            {delivery.order.shippingAddress.city}, {delivery.order.shippingAddress.postalCode}
                          </div>
                          <div style={{ fontSize: "0.875rem", color: cinnamon.accent }}>
                            {delivery.order.shippingAddress.phone}
                          </div>
                        </div>
                      ) : (
                        delivery.order?.user || "N/A"
                      )}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      {delivery.vehicle ? (
                        <div>
                          <div>{delivery.vehicle.vehicleType}</div>
                          <div style={{ fontSize: "0.875rem", color: cinnamon.accent }}>
                            {delivery.vehicle.insuranceNo}
                          </div>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{ 
                        background: getStatusColor(delivery.status), 
                        color: 'white', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        fontSize: "0.875rem"
                      }}>
                        {delivery.status}
                      </span>
                      {delivery.status === 'delivered' && delivery.actualDelivery && (
                        <div style={{ fontSize: "0.75rem", color: cinnamon.accent, marginTop: "0.25rem" }}>
                          Delivered: {new Date(delivery.actualDelivery).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      {new Date(delivery.assignedAt || delivery.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      {getNextStatusOptions(delivery.status).map(option => (
                        <button
                          key={option.value}
                          onClick={() => updateDeliveryStatus(delivery._id, option.value)}
                          disabled={updatingStatus[delivery._id]}
                          style={{ 
                            background: cinnamon.accent, 
                            color: "white", 
                            padding: "0.5rem 1rem", 
                            borderRadius: "4px", 
                            border: "none", 
                            fontWeight: "bold",
                            cursor: updatingStatus[delivery._id] ? 'not-allowed' : 'pointer',
                            opacity: updatingStatus[delivery._id] ? 0.6 : 1,
                            marginBottom: "0.25rem",
                            display: "block",
                            width: "100%"
                          }}
                        >
                          {updatingStatus[delivery._id] ? 'Updating...' : option.label}
                        </button>
                      ))}
                      {getNextStatusOptions(delivery.status).length === 0 && delivery.status !== 'cancelled' && (
                        <span style={{ color: cinnamon.accent, fontSize: "0.875rem" }}>
                          {delivery.status === 'delivered' ? 'Complete' : 'No actions available'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
