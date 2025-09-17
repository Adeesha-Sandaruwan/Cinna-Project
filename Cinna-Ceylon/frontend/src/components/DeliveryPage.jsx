import React, { useState } from "react";

const DeliveryPage = ({ order }) => {
  const [form, setForm] = useState({
    vehicle: "",
    phoneNumber: "",
    postalCode: "",
    houseNo: "",
    email: "",
    lastName: "",
    firstName: ""
  });
  const [message, setMessage] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit delivery details
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        setMessage("Server error: Invalid response format. Please check your input and try again.");
        return;
      }
      if (res.ok) {
        setMessage("Delivery details submitted successfully!");
      } else {
        setMessage(data.message || "Error submitting delivery details.");
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Delivery Details</h2>
      {order && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Order Info</h3>
          <p>Product: {order.productName}</p>
          <p>Amount Paid: {order.amount}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="vehicle" placeholder="Vehicle ObjectId" value={form.vehicle} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input name="postalCode" placeholder="Postal Code" value={form.postalCode} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input name="houseNo" placeholder="House No" value={form.houseNo} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required className="w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Submit Delivery</button>
      </form>
      {message && <div className="mt-4 text-center text-red-600">{message}</div>}
    </div>
  );
};

export default DeliveryPage;
