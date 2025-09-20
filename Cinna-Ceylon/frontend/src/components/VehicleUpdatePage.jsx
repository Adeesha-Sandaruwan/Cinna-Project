import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCarSide } from 'react-icons/fa';

const VehicleUpdatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [form, setForm] = useState({
    capacity: "",
    status: "",
    insuranceNo: "",
    insuranceExpDate: "",
    serviceDate: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/vehicles/${id}`);
        if (response.ok) {
          const data = await response.json();
          setVehicle(data);
          setForm({
            capacity: data.capacity || "",
            status: data.status || "",
            insuranceNo: data.insuranceNo || "",
            insuranceExpDate: data.insuranceExpDate ? data.insuranceExpDate.slice(0,10) : "",
            serviceDate: data.serviceDate ? data.serviceDate.slice(0,10) : ""
          });
        } else {
          setMessage("Vehicle not found");
        }
      } catch (error) {
        setMessage("Error loading vehicle data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicle();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    
    try {
      const response = await fetch(`http://localhost:5000/api/vehicles/${id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      
      if (response.ok) {
        const updatedVehicle = await response.json();
        setMessage("Vehicle updated successfully!");
        setVehicle(updatedVehicle);
        setTimeout(() => navigate("/vehicles"), 1500);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Failed to update vehicle");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (!vehicle) return <div className="text-center p-8 text-red-600">{message}</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg">
      <h2 className="text-3xl font-extrabold mb-6 text-[#8B4513] tracking-tight flex items-center gap-2">
        <FaCarSide className="inline-block mr-2 text-[#CC7722]" /> Update Vehicle
      </h2>
      
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold text-[#CC7722] mb-2">Vehicle Information</h3>
        <p><strong>ID:</strong> {vehicle.vehicleId || vehicle._id}</p>
        <p><strong>Type:</strong> {vehicle.vehicleType}</p>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-2 rounded shadow ${
          message.includes("successfully") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="capacity" className="block font-semibold text-[#CC7722] mb-2">Capacity</label>
          <input 
            id="capacity" 
            name="capacity" 
            type="number" 
            placeholder="e.g. 2000" 
            value={form.capacity} 
            onChange={handleChange} 
            required 
            className="w-full p-3 border rounded focus:ring-2 focus:ring-amber-400" 
          />
        </div>
        
        <div>
          <label htmlFor="status" className="block font-semibold text-[#CC7722] mb-2">Status</label>
          <select 
            id="status" 
            name="status" 
            value={form.status} 
            onChange={handleChange} 
            className="w-full p-3 border rounded focus:ring-2 focus:ring-amber-400"
          >
            <option value="Available">Available</option>
            <option value="In Use">In Use</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="insuranceNo" className="block font-semibold text-[#CC7722] mb-2">Insurance Number</label>
          <input 
            id="insuranceNo" 
            name="insuranceNo" 
            placeholder="e.g. INS123456" 
            value={form.insuranceNo} 
            onChange={handleChange} 
            required 
            className="w-full p-3 border rounded focus:ring-2 focus:ring-amber-400" 
          />
        </div>
        
        <div>
          <label htmlFor="insuranceExpDate" className="block font-semibold text-[#CC7722] mb-2">Insurance Expiry Date</label>
          <input 
            id="insuranceExpDate" 
            name="insuranceExpDate" 
            type="date" 
            value={form.insuranceExpDate} 
            onChange={handleChange} 
            required 
            className="w-full p-3 border rounded focus:ring-2 focus:ring-amber-400" 
          />
        </div>
        
        <div>
          <label htmlFor="serviceDate" className="block font-semibold text-[#CC7722] mb-2">Last Service Date</label>
          <input 
            id="serviceDate" 
            name="serviceDate" 
            type="date" 
            value={form.serviceDate} 
            onChange={handleChange} 
            className="w-full p-3 border rounded focus:ring-2 focus:ring-amber-400" 
          />
        </div>
        
        <div className="flex gap-4">
          <button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-[#CC7722] to-[#c5a35a] text-white py-3 rounded font-bold shadow hover:scale-105 transition"
          >
            Update Vehicle
          </button>
          <button 
            type="button" 
            onClick={() => navigate("/vehicles")} 
            className="flex-1 bg-gray-500 text-white py-3 rounded font-bold shadow hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleUpdatePage;
