import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaCarSide, 
  FaTruck, 
  FaIdCard, 
  FaShieldAlt, 
  FaCalendarAlt, 
  FaTools, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaSave,
  FaTimes,
  FaArrowLeft,
  FaSpinner,
  FaEdit,
  FaCogs,
  FaCalendarCheck
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

  .animate-fadeInUp {
    animation: fadeInUp 0.8s ease-out;
  }

  .animate-slideInRight {
    animation: slideInRight 0.8s ease-out;
  }

  .animate-bounceIn {
    animation: bounceIn 0.8s ease-out;
  }
`;

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

  // Inject styles once when component mounts
  useEffect(() => {
    const styleId = 'vehicle-update-styles';
    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement("style");
      styleSheet.id = styleId;
      styleSheet.type = "text/css";
      styleSheet.innerText = animations;
      document.head.appendChild(styleSheet);
    }
  }, []);

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
          <p className="text-[#A0522D] text-xl font-semibold">Loading vehicle data...</p>
        </div>
      </div>
    );
  }
  
  if (!vehicle) {
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
        <div className="max-w-md w-full p-8 bg-white/95 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20 text-center animate-bounceIn">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Vehicle Not Found</h2>
          <p className="text-gray-700 mb-6">{message}</p>
          <button
            onClick={() => navigate("/vehicles")}
            className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-[#A0522D] to-[#CD853F] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            <FaArrowLeft />
            <span>Back to Vehicles</span>
          </button>
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
      <div className="max-w-4xl w-full p-8 bg-gradient-to-br from-white/95 to-amber-50/95 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20 animate-bounceIn">
        {/* Enhanced Header */}
        <div className="relative mb-8 p-6 bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#CD853F] rounded-2xl shadow-xl overflow-hidden animate-slideInRight">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FaEdit className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Update Vehicle
                </h1>
                <p className="text-amber-100 font-medium">
                  Modify vehicle information and settings
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/vehicles")}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
              >
                <FaArrowLeft />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle Information Card */}
        <div className="mb-8 p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm border border-white/50 animate-fadeInUp">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
              <FaCarSide className="text-xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#8B4513]">Current Vehicle Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FaIdCard className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Vehicle ID</p>
                <p className="text-lg font-bold text-blue-700">{vehicle.vehicleId || vehicle._id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <FaTruck className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Vehicle Type</p>
                <p className="text-lg font-bold text-emerald-700">{vehicle.vehicleType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border animate-fadeInUp ${
            message.includes("successfully") 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-3">
              {message.includes("successfully") ? (
                <FaCheckCircle className="text-green-500 text-xl" />
              ) : (
                <FaExclamationTriangle className="text-red-500 text-xl" />
              )}
              <span className="font-semibold">{message}</span>
            </div>
          </div>
        )}
        
        {/* Enhanced Update Form */}
        <div className="bg-white/80 rounded-xl shadow-lg p-6 backdrop-blur-sm border border-white/50 animate-fadeInUp">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-[#8B4513] to-[#A0522D] rounded-xl">
              <FaCogs className="text-xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#8B4513]">Update Vehicle Details</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Capacity Field */}
            <div className="group">
              <label htmlFor="capacity" className="flex items-center space-x-2 font-semibold text-[#8B4513] mb-3">
                <FaTruck className="text-[#A0522D]" />
                <span>Vehicle Capacity (kg)</span>
              </label>
              <div className="relative">
                <input 
                  id="capacity" 
                  name="capacity" 
                  type="number" 
                  placeholder="e.g. 2000" 
                  value={form.capacity} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#A0522D] focus:border-[#A0522D] transition-all duration-300 bg-white/90 backdrop-blur-sm group-hover:shadow-md" 
                />
                <FaTruck className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A0522D] opacity-50" />
              </div>
            </div>

            {/* Status Field */}
            <div className="group">
              <label htmlFor="status" className="flex items-center space-x-2 font-semibold text-[#8B4513] mb-3">
                <FaCheckCircle className="text-[#A0522D]" />
                <span>Vehicle Status</span>
              </label>
              <div className="relative">
                <select 
                  id="status" 
                  name="status" 
                  value={form.status} 
                  onChange={handleChange} 
                  className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#A0522D] focus:border-[#A0522D] transition-all duration-300 bg-white/90 backdrop-blur-sm group-hover:shadow-md appearance-none"
                >
                  <option value="Available">🟢 Available</option>
                  <option value="In Use">🔵 In Use</option>
                  <option value="Maintenance">🟡 Maintenance</option>
                  <option value="Inactive">🔴 Inactive</option>
                </select>
                <FaCheckCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A0522D] opacity-50" />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-[#A0522D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Insurance Number Field */}
            <div className="group">
              <label htmlFor="insuranceNo" className="flex items-center space-x-2 font-semibold text-[#8B4513] mb-3">
                <FaShieldAlt className="text-[#A0522D]" />
                <span>Insurance Number</span>
              </label>
              <div className="relative">
                <input 
                  id="insuranceNo" 
                  name="insuranceNo" 
                  placeholder="e.g. INS123456" 
                  value={form.insuranceNo} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#A0522D] focus:border-[#A0522D] transition-all duration-300 bg-white/90 backdrop-blur-sm group-hover:shadow-md" 
                />
                <FaShieldAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A0522D] opacity-50" />
              </div>
            </div>

            {/* Insurance Expiry Date Field */}
            <div className="group">
              <label htmlFor="insuranceExpDate" className="flex items-center space-x-2 font-semibold text-[#8B4513] mb-3">
                <FaCalendarAlt className="text-[#A0522D]" />
                <span>Insurance Expiry Date</span>
              </label>
              <div className="relative">
                <input 
                  id="insuranceExpDate" 
                  name="insuranceExpDate" 
                  type="date" 
                  value={form.insuranceExpDate} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#A0522D] focus:border-[#A0522D] transition-all duration-300 bg-white/90 backdrop-blur-sm group-hover:shadow-md" 
                />
                <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A0522D] opacity-50" />
              </div>
            </div>

            {/* Service Date Field */}
            <div className="group">
              <label htmlFor="serviceDate" className="flex items-center space-x-2 font-semibold text-[#8B4513] mb-3">
                <FaCalendarCheck className="text-[#A0522D]" />
                <span>Last Service Date</span>
              </label>
              <div className="relative">
                <input 
                  id="serviceDate" 
                  name="serviceDate" 
                  type="date" 
                  value={form.serviceDate} 
                  onChange={handleChange} 
                  className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#A0522D] focus:border-[#A0522D] transition-all duration-300 bg-white/90 backdrop-blur-sm group-hover:shadow-md" 
                />
                <FaCalendarCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A0522D] opacity-50" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button 
                type="submit" 
                className="group relative flex-1 bg-gradient-to-r from-[#A0522D] to-[#CD853F] text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  <FaSave className="text-lg" />
                  <span>Update Vehicle</span>
                </div>
              </button>
              
              <button 
                type="button" 
                onClick={() => navigate("/vehicles")} 
                className="group relative flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  <FaTimes className="text-lg" />
                  <span>Cancel</span>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleUpdatePage;
