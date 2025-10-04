import React, { useEffect, useState } from "react";

const cinnamon = {
  primary: "#A0522D", // cinnamon brown
  accent: "#D2691E", // lighter cinnamon
  bg: "#FFF8F0", // soft background
  highlight: "#FFDAB3", // highlight
};

const DeliveryManagerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assigning, setAssigning] = useState({});
  const [message, setMessage] = useState("");

  // Fetch orders, drivers, vehicles
  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => setOrders(data))
      .catch(err => console.error("Error fetching orders:", err));
      
    fetch("http://localhost:5000/api/users?role=driver")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => setDrivers(data))
      .catch(err => console.error("Error fetching drivers:", err));
      
    fetch("http://localhost:5000/api/vehicles")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => setVehicles(data))
      .catch(err => console.error("Error fetching vehicles:", err));
  }, []);

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

  // Assign driver and vehicle to order
  const handleAssign = async (orderId) => {
    setMessage("");
    const { driverId, vehicleId } = assigning[orderId] || {};
    if (!driverId || !vehicleId) {
      setMessage("Please select both driver and vehicle.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/deliveries/${orderId}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, vehicleId })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Order assigned successfully!");
        setOrders(orders.map(o => o._id === orderId ? { ...o, driver: driverId, vehicle: vehicleId } : o));
      } else {
        setMessage(data.message || "Error assigning order.");
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div style={{ background: cinnamon.bg, minHeight: "100vh", padding: "2rem" }}>
      <h2 style={{ color: cinnamon.primary, fontWeight: "bold", fontSize: "2rem", marginBottom: "1rem" }}>Delivery Management Dashboard</h2>
      {message && <div style={{ color: cinnamon.accent, marginBottom: "1rem" }}>{message}</div>}
      <table style={{ width: "100%", background: cinnamon.highlight, borderRadius: "8px", boxShadow: "0 2px 8px #A0522D22" }}>
        <thead>
          <tr style={{ background: cinnamon.primary, color: "white" }}>
            <th style={{ padding: "0.75rem" }}>Order ID</th>
            <th style={{ padding: "0.75rem" }}>Status</th>
            <th style={{ padding: "0.75rem" }}>Driver</th>
            <th style={{ padding: "0.75rem" }}>Vehicle</th>
            <th style={{ padding: "0.75rem" }}>Assign</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <React.Fragment key={order._id}>
              <tr style={{ borderBottom: "1px solid #A0522D33" }}>
                <td style={{ padding: "0.75rem" }}>{order._id}</td>
                <td style={{ padding: "0.75rem" }}>{order.status}</td>
                <td style={{ padding: "0.75rem" }}>{order.driver || "Unassigned"}</td>
                <td style={{ padding: "0.75rem" }}>{order.vehicle || "Unassigned"}</td>
                <td style={{ padding: "0.75rem" }}>
                  <select
                    value={assigning[order._id]?.driverId || ""}
                    onChange={e => handleChange(order._id, "driverId", e.target.value)}
                    style={{ marginRight: "0.5rem", padding: "0.5rem", borderRadius: "4px", border: `1px solid ${cinnamon.primary}` }}
                  >
                    <option value="">Select Driver</option>
                    {drivers.map(driver => (
                      <option key={driver._id} value={driver._id}>{driver.firstName} {driver.lastName}</option>
                    ))}
                  </select>
                  <select
                    value={assigning[order._id]?.vehicleId || ""}
                    onChange={e => handleChange(order._id, "vehicleId", e.target.value)}
                    style={{ marginRight: "0.5rem", padding: "0.5rem", borderRadius: "4px", border: `1px solid ${cinnamon.primary}` }}
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>{vehicle.vehicleType} ({vehicle.insuranceNo})</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssign(order._id)}
                    style={{ background: cinnamon.accent, color: "white", padding: "0.5rem 1rem", borderRadius: "4px", border: "none", fontWeight: "bold" }}
                  >Assign</button>
                </td>
              </tr>
              {/* Buyer details form for each order */}
              <tr>
                <td colSpan={5} style={{ padding: "2rem", background: cinnamon.bg }}>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      const buyerData = {
                        vehicle: assigning[order._id]?.vehicleId || "",
                        phoneNumber: assigning[order._id]?.phoneNumber || "",
                        postalCode: assigning[order._id]?.postalCode || "",
                        houseNo: assigning[order._id]?.houseNo || "",
                        email: assigning[order._id]?.email || "",
                        lastName: assigning[order._id]?.lastName || "",
                        firstName: assigning[order._id]?.firstName || ""
                      };
                      fetch(`http://localhost:5000/api/deliveries/${order._id}/buyer`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(buyerData)
                      })
                        .then(res => res.json())
                        .then(data => setMessage(data.message || "Buyer details updated!"))
                        .catch(() => setMessage("Network error. Please try again."));
                    }}
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
                  >
                    <input name="phoneNumber" placeholder="Phone Number" value={assigning[order._id]?.phoneNumber || ""} onChange={e => handleChange(order._id, "phoneNumber", e.target.value)} required style={{ padding: "0.75rem", borderRadius: "4px", border: `1px solid ${cinnamon.primary}` }} />
                    <input name="postalCode" placeholder="Postal Code" value={assigning[order._id]?.postalCode || ""} onChange={e => handleChange(order._id, "postalCode", e.target.value)} required style={{ padding: "0.75rem", borderRadius: "4px", border: `1px solid ${cinnamon.primary}` }} />
                    <input name="houseNo" placeholder="House No" value={assigning[order._id]?.houseNo || ""} onChange={e => handleChange(order._id, "houseNo", e.target.value)} required style={{ padding: "0.75rem", borderRadius: "4px", border: `1px solid ${cinnamon.primary}` }} />
                    <input name="email" type="email" placeholder="Email" value={assigning[order._id]?.email || ""} onChange={e => handleChange(order._id, "email", e.target.value)} required style={{ padding: "0.75rem", borderRadius: "4px", border: `1px solid ${cinnamon.primary}` }} />
                    <input name="lastName" placeholder="Last Name" value={assigning[order._id]?.lastName || ""} onChange={e => handleChange(order._id, "lastName", e.target.value)} required style={{ padding: "0.75rem", borderRadius: "4px", border: `1px solid ${cinnamon.primary}` }} />
                    <input name="firstName" placeholder="First Name" value={assigning[order._id]?.firstName || ""} onChange={e => handleChange(order._id, "firstName", e.target.value)} required style={{ padding: "0.75rem", borderRadius: "4px", border: `1px solid ${cinnamon.primary}` }} />
                    <button type="submit" style={{ gridColumn: "span 2", background: cinnamon.primary, color: "white", padding: "0.75rem", borderRadius: "4px", border: "none", fontWeight: "bold" }}>Save Buyer Details</button>
                  </form>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeliveryManagerDashboard;
