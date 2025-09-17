import React, { useEffect, useState } from "react";

const cinnamon = {
  primary: "#A0522D", // cinnamon brown
  accent: "#D2691E", // lighter cinnamon
  bg: "#FFF8F0", // soft background
  highlight: "#FFDAB3", // highlight
};

const DriverDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch deliveries assigned to this driver (replace driverId with auth context in real app)
    const driverId = localStorage.getItem("driverId");
    fetch(`http://localhost:5000/api/deliveries?driver=${driverId}`)
      .then(res => res.json())
      .then(data => setDeliveries(data));
  }, []);

  const handleAccept = async (deliveryId) => {
    setMessage("");
    try {
      const res = await fetch(`http://localhost:5000/api/deliveries/${deliveryId}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Delivery accepted!");
        setDeliveries(deliveries.map(d => d._id === deliveryId ? { ...d, status: "accepted" } : d));
      } else {
        setMessage(data.message || "Error accepting delivery.");
      }
    } catch {
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div style={{ background: cinnamon.bg, minHeight: "100vh", padding: "2rem" }}>
      <h2 style={{ color: cinnamon.primary, fontWeight: "bold", fontSize: "2rem", marginBottom: "1rem" }}>Driver Dashboard</h2>
      {message && <div style={{ color: cinnamon.accent, marginBottom: "1rem" }}>{message}</div>}
      <table style={{ width: "100%", background: cinnamon.highlight, borderRadius: "8px", boxShadow: "0 2px 8px #A0522D22" }}>
        <thead>
          <tr style={{ background: cinnamon.primary, color: "white" }}>
            <th style={{ padding: "0.75rem" }}>Delivery ID</th>
            <th style={{ padding: "0.75rem" }}>Buyer</th>
            <th style={{ padding: "0.75rem" }}>Status</th>
            <th style={{ padding: "0.75rem" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map(delivery => (
            <tr key={delivery._id} style={{ borderBottom: "1px solid #A0522D33" }}>
              <td style={{ padding: "0.75rem" }}>{delivery._id}</td>
              <td style={{ padding: "0.75rem" }}>{delivery.firstName} {delivery.lastName}</td>
              <td style={{ padding: "0.75rem" }}>{delivery.status || "pending"}</td>
              <td style={{ padding: "0.75rem" }}>
                {delivery.status === "accepted" ? (
                  <span style={{ color: cinnamon.primary, fontWeight: "bold" }}>Accepted</span>
                ) : (
                  <button
                    onClick={() => handleAccept(delivery._id)}
                    style={{ background: cinnamon.accent, color: "white", padding: "0.5rem 1rem", borderRadius: "4px", border: "none", fontWeight: "bold" }}
                  >Accept</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DriverDashboard;
