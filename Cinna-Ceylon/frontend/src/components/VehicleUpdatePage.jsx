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

// Enhanced Custom animations
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

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
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
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
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

  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.8s ease-out;
  }

  .animate-slideInRight {
    animation: slideInRight 0.8s ease-out;
  }

  .animate-slideInLeft {
    animation: slideInLeft 0.8s ease-out;
  }

  .animate-bounceIn {
    animation: bounceIn 0.8s ease-out;
  }

  .animate-pulse {
    animation: pulse 2s infinite;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    background-size: 200px 100%;
    animation: shimmer 2s infinite;
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
  }

  .glass-morphism {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hover-lift:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = animations;
  document.head.appendChild(styleSheet);
}

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

  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center py-8 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(160, 82, 45, 0.2) 50%, rgba(205, 133, 63, 0.1) 100%), url(${cinnamonBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-[#A0522D]/20 to-[#CD853F]/20 rounded-full animate-float"></div>
          <div className="absolute top-1/3 right-10 w-16 h-16 bg-gradient-to-r from-[#CD853F]/20 to-[#A0522D]/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-gradient-to-r from-[#A0522D]/20 to-[#CD853F]/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="text-center relative z-10">
          <div className="relative mb-8 animate-bounceIn">
            <div className="inline-block relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#A0522D] to-[#CD853F] animate-spin blur-sm"></div>
              <div className="relative bg-white rounded-full p-6 shadow-2xl">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#A0522D]/20 border-t-[#A0522D]"></div>
                <FaTruck className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#A0522D] text-xl animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="glass-morphism rounded-2xl p-8 shadow-2xl animate-fadeInUp">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#A0522D] to-[#CD853F] bg-clip-text text-transparent mb-2">
              Loading Vehicle Data
            </h2>
            <div className="flex items-center justify-center space-x-2 text-[#A0522D]">
              <div className="w-2 h-2 bg-[#A0522D] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#A0522D] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-[#A0522D] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
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
      className="min-h-screen flex flex-col items-center justify-start py-8 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(139, 69, 19, 0.05) 0%, rgba(160, 82, 45, 0.1) 50%, rgba(205, 133, 63, 0.05) 100%), url(${cinnamonBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[#A0522D]/10 to-[#CD853F]/10 rounded-full animate-float blur-xl"></div>
        <div className="absolute top-1/3 right-16 w-24 h-24 bg-gradient-to-r from-[#CD853F]/10 to-[#A0522D]/10 rounded-full animate-float blur-xl" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-gradient-to-r from-[#A0522D]/10 to-[#CD853F]/10 rounded-full animate-float blur-xl" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-r from-[#CD853F]/10 to-[#A0522D]/10 rounded-full animate-float blur-xl" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="max-w-5xl w-full p-8 relative z-10">
        {/* Main container with enhanced glass morphism */}
        <div className="bg-gradient-to-br from-white/95 via-white/90 to-amber-50/95 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/30 animate-bounceIn hover-lift overflow-hidden">
          {/* Decorative top border */}
          <div className="h-2 bg-gradient-to-r from-[#A0522D] via-[#CD853F] to-[#A0522D] animate-gradient"></div>
          {/* Enhanced Header */}
          <div className="relative mb-8 p-8 bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#CD853F] rounded-none shadow-xl overflow-hidden animate-slideInRight"
               style={{background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%)'}}>
            {/* Enhanced animated overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-12 animate-shimmer"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
            </div>
            
            {/* Floating decoration elements */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full animate-float"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/15 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-6 mb-6 md:mb-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-2xl blur-lg animate-pulse"></div>
                  <div className="relative p-4 bg-white/25 rounded-2xl backdrop-blur-sm border border-white/30 shadow-xl">
                    <FaEdit className="text-4xl text-white animate-float" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                    <span className="bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                      Update Vehicle
                    </span>
                  </h1>
                  <p className="text-amber-100 font-medium text-lg drop-shadow-md">
                    ✨ Modify vehicle information and settings with ease
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/vehicles")}
                  className="group flex items-center space-x-3 px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
                  <span className="font-semibold">Back to Vehicles</span>
                </button>
              </div>
            </div>
        </div>

          {/* Enhanced Vehicle Information Card */}
          <div className="mb-8 p-8 bg-gradient-to-br from-white/90 via-white/85 to-amber-50/90 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/40 animate-fadeInUp hover-lift relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#A0522D]/5 to-[#CD853F]/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#CD853F]/5 to-[#A0522D]/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                    <FaCarSide className="text-2xl text-white animate-float" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[#8B4513] to-[#A0522D] bg-clip-text text-transparent">
                    Current Vehicle Information
                  </h3>
                  <p className="text-gray-600 font-medium">📋 Review current vehicle details</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200/50 hover-lift">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className="relative p-6 flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500 rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative p-3 bg-blue-500 rounded-xl shadow-lg">
                        <FaIdCard className="text-white text-xl" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide mb-1">Vehicle ID</p>
                      <p className="text-xl font-bold text-blue-800 truncate">{vehicle.vehicleId || vehicle._id}</p>
                    </div>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl border border-emerald-200/50 hover-lift">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className="relative p-6 flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative p-3 bg-emerald-500 rounded-xl shadow-lg">
                        <FaTruck className="text-white text-xl" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wide mb-1">Vehicle Type</p>
                      <p className="text-xl font-bold text-emerald-800">{vehicle.vehicleType}</p>
                    </div>
                  </div>
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
          <div className="bg-gradient-to-br from-white/90 via-white/85 to-amber-50/90 rounded-2xl shadow-2xl p-8 backdrop-blur-xl border border-white/40 animate-slideInLeft relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-[#A0522D]/5 to-[#CD853F]/5 rounded-full -translate-y-20 -translate-x-20"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#CD853F]/5 to-[#A0522D]/5 rounded-full translate-y-16 translate-x-16"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8B4513] to-[#A0522D] rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative p-4 bg-gradient-to-r from-[#8B4513] to-[#A0522D] rounded-2xl shadow-xl">
                    <FaCogs className="text-2xl text-white animate-float" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[#8B4513] to-[#A0522D] bg-clip-text text-transparent">
                    Update Vehicle Details
                  </h3>
                  <p className="text-gray-600 font-medium">🚀 Modify and enhance vehicle information</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8"
                    style={{animation: 'fadeInUp 0.8s ease-out'}}>
              {/* Enhanced Capacity Field */}
              <div className="group transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="capacity" className="flex items-center space-x-3 font-bold text-[#8B4513] mb-4 text-lg">
                  <div className="p-2 bg-gradient-to-r from-[#A0522D] to-[#CD853F] rounded-xl shadow-lg">
                    <FaTruck className="text-white" />
                  </div>
                  <span>🚛 Vehicle Capacity (kg)</span>
                </label>
                <div className="relative">
                  <input 
                    id="capacity" 
                    name="capacity" 
                    type="number" 
                    placeholder="Enter capacity (e.g. 2000)" 
                    value={form.capacity} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-5 pl-14 pr-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#A0522D]/20 focus:border-[#A0522D] transition-all duration-300 bg-white/95 backdrop-blur-sm group-hover:shadow-xl group-hover:border-[#CD853F]/50 text-lg font-medium placeholder-gray-400" 
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 bg-[#A0522D]/10 rounded-lg">
                    <FaTruck className="text-[#A0522D] text-lg" />
                  </div>
                  {/* Animated focus indicator */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#A0522D]/0 via-[#CD853F]/10 to-[#A0522D]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Enhanced Status Field */}
              <div className="group transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="status" className="flex items-center space-x-3 font-bold text-[#8B4513] mb-4 text-lg">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <FaCheckCircle className="text-white" />
                  </div>
                  <span>📊 Vehicle Status</span>
                </label>
                <div className="relative">
                  <select 
                    id="status" 
                    name="status" 
                    value={form.status} 
                    onChange={handleChange} 
                    className="w-full p-5 pl-14 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#A0522D]/20 focus:border-[#A0522D] transition-all duration-300 bg-white/95 backdrop-blur-sm group-hover:shadow-xl group-hover:border-[#CD853F]/50 text-lg font-medium appearance-none cursor-pointer"
                  >
                    <option value="Available">🟢 Available - Ready for use</option>
                    <option value="In Use">🔵 In Use - Currently assigned</option>
                    <option value="Maintenance">🟡 Maintenance - Under service</option>
                    <option value="Inactive">🔴 Inactive - Out of service</option>
                  </select>
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 bg-green-500/10 rounded-lg">
                    <FaCheckCircle className="text-green-600 text-lg" />
                  </div>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-6 h-6 text-[#A0522D] group-hover:text-[#CD853F] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {/* Animated focus indicator */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/0 via-emerald-500/10 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Enhanced Insurance Number Field */}
              <div className="group transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="insuranceNo" className="flex items-center space-x-3 font-bold text-[#8B4513] mb-4 text-lg">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                    <FaShieldAlt className="text-white" />
                  </div>
                  <span>🛡️ Insurance Number</span>
                </label>
                <div className="relative">
                  <input 
                    id="insuranceNo" 
                    name="insuranceNo" 
                    placeholder="Enter insurance number (e.g. INS123456)" 
                    value={form.insuranceNo} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-5 pl-14 pr-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#A0522D]/20 focus:border-[#A0522D] transition-all duration-300 bg-white/95 backdrop-blur-sm group-hover:shadow-xl group-hover:border-[#CD853F]/50 text-lg font-medium placeholder-gray-400" 
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 bg-purple-500/10 rounded-lg">
                    <FaShieldAlt className="text-purple-600 text-lg" />
                  </div>
                  {/* Animated focus indicator */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-indigo-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Enhanced Insurance Expiry Date Field */}
              <div className="group transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="insuranceExpDate" className="flex items-center space-x-3 font-bold text-[#8B4513] mb-4 text-lg">
                  <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl shadow-lg">
                    <FaCalendarAlt className="text-white" />
                  </div>
                  <span>📅 Insurance Expiry Date</span>
                </label>
                <div className="relative">
                  <input 
                    id="insuranceExpDate" 
                    name="insuranceExpDate" 
                    type="date" 
                    value={form.insuranceExpDate} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-5 pl-14 pr-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#A0522D]/20 focus:border-[#A0522D] transition-all duration-300 bg-white/95 backdrop-blur-sm group-hover:shadow-xl group-hover:border-[#CD853F]/50 text-lg font-medium cursor-pointer" 
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 bg-red-500/10 rounded-lg">
                    <FaCalendarAlt className="text-red-600 text-lg" />
                  </div>
                  {/* Animated focus indicator */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/0 via-pink-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Enhanced Service Date Field */}
              <div className="group transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="serviceDate" className="flex items-center space-x-3 font-bold text-[#8B4513] mb-4 text-lg">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg">
                    <FaCalendarCheck className="text-white" />
                  </div>
                  <span>🔧 Last Service Date</span>
                </label>
                <div className="relative">
                  <input 
                    id="serviceDate" 
                    name="serviceDate" 
                    type="date" 
                    value={form.serviceDate} 
                    onChange={handleChange} 
                    className="w-full p-5 pl-14 pr-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#A0522D]/20 focus:border-[#A0522D] transition-all duration-300 bg-white/95 backdrop-blur-sm group-hover:shadow-xl group-hover:border-[#CD853F]/50 text-lg font-medium cursor-pointer" 
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 bg-orange-500/10 rounded-lg">
                    <FaCalendarCheck className="text-orange-600 text-lg" />
                  </div>
                  {/* Animated focus indicator */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/0 via-amber-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 pt-8">
                <button 
                  type="submit" 
                  className="group relative flex-1 bg-gradient-to-r from-[#A0522D] via-[#CD853F] to-[#A0522D] text-white py-5 px-8 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 overflow-hidden animate-gradient"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    <FaSave className="text-xl group-hover:rotate-12 transition-transform duration-300" />
                    <span className="text-lg">✨ Update Vehicle</span>
                  </div>
                  {/* Floating particles effect */}
                  <div className="absolute top-2 right-2 w-1 h-1 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                  <div className="absolute bottom-2 left-2 w-1 h-1 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{animationDelay: '0.5s'}}></div>
                </button>
                
                <button 
                  type="button" 
                  onClick={() => navigate("/vehicles")} 
                  className="group relative flex-1 bg-gradient-to-r from-slate-500 via-gray-600 to-slate-500 text-white py-5 px-8 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 overflow-hidden animate-gradient"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    <FaTimes className="text-xl group-hover:rotate-90 transition-transform duration-300" />
                    <span className="text-lg">🔙 Cancel</span>
                  </div>
                  {/* Floating particles effect */}
                  <div className="absolute top-2 left-2 w-1 h-1 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                  <div className="absolute bottom-2 right-2 w-1 h-1 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{animationDelay: '0.3s'}}></div>
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleUpdatePage;
