import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaCarSide, FaCalendarAlt, FaClipboardCheck, FaExclamationTriangle, FaFileAlt, FaCog, FaChartLine } from 'react-icons/fa';
import DownloadVehiclePDFButton from './DownloadVehiclePDFButton';
import LoadingSpinner from './common/LoadingSpinner';

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [loading, setLoading] = useState(false);
  const [maintenanceFile, setMaintenanceFile] = useState(null);
  const [accidentFile, setAccidentFile] = useState(null);
  const [maintenanceCost, setMaintenanceCost] = useState("");
  const [accidentCost, setAccidentCost] = useState("");
  const [accidentDate, setAccidentDate] = useState("");
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [accidentHistory, setAccidentHistory] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const maintenanceFileRef = useRef(null);
  const accidentFileRef = useRef(null);

  const fetchData = async (endpoint, setter, errorMessage) => {
    try {
      const res = await fetch(`http://localhost:5000/api/${endpoint}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setter(data);
      return true;
    } catch (err) {
      console.error(errorMessage, err);
      setMessage(errorMessage);
      setMessageType("error");
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load all data in parallel
        const results = await Promise.all([
          fetchData(`vehicles/${id}`, setVehicle, "Error loading vehicle details"),
          fetchData(`vehicles/${id}/maintenance-history`, setMaintenanceHistory, "Error loading maintenance history"),
          fetchData(`vehicles/${id}/accident-history`, setAccidentHistory, "Error loading accident history")
        ]);
        
        // Check if any fetch failed
        if (results.some(result => !result)) {
          setMessage("Some data could not be loaded. Please refresh to try again.");
          setMessageType("error");
        }
        
        // Trigger entrance animation
        setTimeout(() => setIsVisible(true), 100);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Fetch maintenance history
    fetch(`http://localhost:5000/api/vehicles/${id}/maintenance-history`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setMaintenanceHistory(data))
      .catch(err => console.error("Error fetching maintenance history:", err));
    
    // Fetch accident history
    fetch(`http://localhost:5000/api/vehicles/${id}/accident-history`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setAccidentHistory(data))
      .catch(err => console.error("Error fetching accident history:", err));
  }, [id]);

  const handleFileChange = (setter) => (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setMessage('Please upload only PDF, JPEG, or PNG files.');
      setMessageType('error');
      e.target.value = '';
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setMessage('File size must be less than 5MB.');
      setMessageType('error');
      e.target.value = '';
      return;
    }

    setter(file);
    setMessage('');
    setMessageType('');
  };

  const validateForm = (type) => {
    if (type === "maintenance") {
      if (!maintenanceFile) {
        setMessage("Please select a maintenance report file");
        setMessageType("error");
        return false;
      }
      if (!maintenanceCost || isNaN(maintenanceCost) || Number(maintenanceCost) <= 0) {
        setMessage("Please enter a valid maintenance cost");
        setMessageType("error");
        return false;
      }
    }
    
    if (type === "accident") {
      if (!accidentFile) {
        setMessage("Please select an accident report file");
        setMessageType("error");
        return false;
      }
      if (!accidentCost || isNaN(accidentCost) || Number(accidentCost) <= 0) {
        setMessage("Please enter a valid accident cost");
        setMessageType("error");
        return false;
      }
      if (!accidentDate) {
        setMessage("Please select the accident date");
        setMessageType("error");
        return false;
      }
      const selectedDate = new Date(accidentDate);
      const today = new Date();
      if (selectedDate > today) {
        setMessage("Accident date cannot be in the future");
        setMessageType("error");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (type) => {
    setMessage("");
    setMessageType("");
    
    // Validate form before submission
    if (!validateForm(type)) {
      return;
    }
    
    setLoading(true);
    console.log(`Submitting ${type} report...`);
    
    const formData = new FormData();
    let endpoint = "";
    
    if (type === "maintenance") {
      if (!maintenanceFile || !maintenanceCost) {
        setMessage("Please provide both a file and cost for maintenance.");
        setMessageType("error");
        setLoading(false);
        return;
      }
      formData.append("maintenanceReport", maintenanceFile);
      formData.append("maintenanceCost", maintenanceCost);
      endpoint = `http://localhost:5000/api/vehicles/${id}/maintenance`;
      console.log("Frontend maintenance - FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
    }
    
    if (type === "accident") {
      if (!accidentFile || !accidentCost || !accidentDate) {
        setMessage("Please provide file, cost, and date for accident.");
        setMessageType("error");
        setLoading(false);
        return;
      }
      console.log('Sending accident data:', { accidentCost, accidentDate, accidentFile });
      formData.append("accidentReport", accidentFile);
      formData.append("accidentCost", accidentCost);
      formData.append("accidentDate", accidentDate);
      formData.append("severity", "Minor"); // Default severity
      endpoint = `http://localhost:5000/api/vehicles/${id}/accident`;
      console.log("Frontend accident - FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
    }
    
    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Report submitted successfully!");
        setMessageType("success");
        setVehicle(data.vehicle);
        
        // Refresh history after successful submission
        if (type === "maintenance") {
          fetch(`http://localhost:5000/api/vehicles/${id}/maintenance-history`)
            .then(res => res.json())
            .then(data => setMaintenanceHistory(data))
            .catch(err => console.error("Error refreshing maintenance history:", err));
        }
        
        if (type === "accident") {
          fetch(`http://localhost:5000/api/vehicles/${id}/accident-history`)
            .then(res => res.json())
            .then(data => setAccidentHistory(data))
            .catch(err => console.error("Error refreshing accident history:", err));
        }
        
        // Clear form fields after successful submission
        if (type === "maintenance") {
          setMaintenanceFile(null);
          setMaintenanceCost("");
          if (maintenanceFileRef.current) maintenanceFileRef.current.value = '';
        }
        if (type === "accident") {
          setAccidentFile(null);
          setAccidentCost("");
          setAccidentDate("");
          if (accidentFileRef.current) accidentFileRef.current.value = '';
        }
      } else {
        setMessage(data.message || "Error submitting report.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage("Network error. Please try again.");
      setMessageType("error");
    }
    
    setLoading(false);
  };

  if (!vehicle) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-lg text-[#8B4513] font-medium animate-pulse">Loading vehicle details...</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Animated Header */}
        <div className={`transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="bg-gradient-to-r from-[#A0522D] to-[#D2691E] rounded-2xl p-8 mb-8 shadow-2xl relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-12 translate-y-12"></div>
            
            <div className="relative z-10">
              <h1 className="text-4xl font-extrabold text-white mb-4 flex items-center gap-4">
                <FaCarSide className="text-5xl animate-bounce" />
                <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                  Vehicle Details
                </span>
              </h1>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-yellow-100 font-semibold">ID: {vehicle.vehicleId || vehicle._id}</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-yellow-100 font-semibold">{vehicle.vehicleType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message with enhanced animation */}
        {message && (
          <div className={`transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'} mb-6`}>
            <div className={`px-6 py-4 rounded-xl shadow-lg border-l-4 ${
              messageType === "success" 
                ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-400 shadow-green-200" 
                : "bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-400 shadow-red-200"
            } animate-pulse`}>
              <div className="flex items-center gap-3">
                {messageType === "success" ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          </div>
        )}

        {/* PDF Download Button with stagger animation */}
        <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} mb-8`}>
          <DownloadVehiclePDFButton vehicle={vehicle} />
        </div>
        {/* Vehicle Information Card with hover effects */}
        <div 
          className={`transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} mb-8`}
          onMouseEnter={() => setActiveSection('info')}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100 transition-all duration-300 ${
            activeSection === 'info' ? 'shadow-2xl transform scale-105' : ''
          }`}>
            <div className="bg-gradient-to-r from-orange-400 to-amber-400 p-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <FaFileAlt className="text-white animate-pulse" />
                Vehicle Information
                <FaChartLine className="ml-auto animate-bounce" />
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Type", value: vehicle.vehicleType, icon: "🚛" },
                  { label: "Capacity", value: vehicle.capacity, icon: "📦" },
                  { label: "Status", value: vehicle.status, icon: "🔄" },
                  { label: "Insurance No", value: vehicle.insuranceNo, icon: "🛡️" },
                  { label: "Insurance Expiry", value: vehicle.insuranceExpDate ? new Date(vehicle.insuranceExpDate).toLocaleDateString() : "N/A", icon: "📅" },
                  { label: "Service Date", value: vehicle.serviceDate ? new Date(vehicle.serviceDate).toLocaleDateString() : "N/A", icon: "🔧" }
                ].map((item, index) => (
                  <div 
                    key={item.label}
                    className={`bg-gradient-to-r from-gray-50 to-orange-50 p-4 rounded-lg border border-orange-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                      activeSection === 'info' ? 'animate-pulse' : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-500">{item.label}</p>
                        <p className="text-lg font-bold text-gray-800">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Status Indicators */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border-l-4 transition-all duration-300 ${
                  vehicle.maintenanceReport 
                    ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50" 
                    : "border-gray-400 bg-gradient-to-r from-gray-50 to-slate-50"
                }`}>
                  <div className="flex items-center gap-3">
                    <FaClipboardCheck className={`text-2xl ${vehicle.maintenanceReport ? 'text-green-600 animate-bounce' : 'text-gray-500'}`} />
                    <div>
                      <p className="font-semibold text-gray-800">Maintenance Status</p>
                      <p className={`text-sm ${vehicle.maintenanceReport ? "text-green-700" : "text-gray-500"}`}>
                        {vehicle.maintenanceReport 
                          ? `Submitted (Cost: LKR ${vehicle.maintenanceCost !== undefined && vehicle.maintenanceCost !== null ? vehicle.maintenanceCost : 'N/A'})` 
                          : "Not Submitted"
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg border-l-4 transition-all duration-300 ${
                  vehicle.accidentReport 
                    ? "border-red-500 bg-gradient-to-r from-red-50 to-rose-50" 
                    : "border-gray-400 bg-gradient-to-r from-gray-50 to-slate-50"
                }`}>
                  <div className="flex items-center gap-3">
                    <FaExclamationTriangle className={`text-2xl ${vehicle.accidentReport ? 'text-red-600 animate-pulse' : 'text-gray-500'}`} />
                    <div>
                      <p className="font-semibold text-gray-800">Accident Status</p>
                      <p className={`text-sm ${vehicle.accidentReport ? "text-red-700" : "text-gray-500"}`}>
                        {vehicle.accidentReport 
                          ? `Submitted (Cost: LKR ${vehicle.accidentCost !== undefined && vehicle.accidentCost !== null ? vehicle.accidentCost : 'N/A'})` 
                          : "Not Submitted"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Maintenance Report Section */}
        <div 
          className={`transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} mb-8`}
          onMouseEnter={() => setActiveSection('maintenance')}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100 transition-all duration-300 ${
            activeSection === 'maintenance' ? 'shadow-2xl transform scale-102' : ''
          }`}>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <FaClipboardCheck className="text-white animate-pulse" />
                Submit Maintenance Report
                <FaCog className="ml-auto animate-spin" />
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Report File</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.png" 
                    ref={maintenanceFileRef}
                    onChange={handleFileChange(setMaintenanceFile)} 
                    className="block w-full text-sm text-gray-900 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-4 transition-all duration-300 group-hover:border-blue-400" 
                    required 
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-8 h-8 text-blue-400 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Cost</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">LKR</span>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={maintenanceCost} 
                    onChange={e => setMaintenanceCost(e.target.value)} 
                    className="pl-12 pr-4 py-3 border-2 border-blue-200 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 group-hover:shadow-md" 
                    required 
                  />
                </div>
              </div>
              
              <button 
                onClick={() => handleSubmit("maintenance")} 
                disabled={loading}
                className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all duration-300 transform ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 hover:shadow-xl focus:ring-4 focus:ring-blue-300'
                } ${activeSection === 'maintenance' ? 'animate-pulse' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <LoadingSpinner size="small" light={true} />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <FaClipboardCheck className="animate-bounce" />
                    Submit Maintenance Report
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Accident Report Section */}
        <div 
          className={`transform transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} mb-8`}
          onMouseEnter={() => setActiveSection('accident')}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100 transition-all duration-300 ${
            activeSection === 'accident' ? 'shadow-2xl transform scale-102' : ''
          }`}>
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <FaExclamationTriangle className="text-white animate-pulse" />
                Submit Accident Report
                <FaCalendarAlt className="ml-auto animate-bounce" />
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Accident Report File</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.png" 
                    ref={accidentFileRef}
                    onChange={handleFileChange(setAccidentFile)} 
                    className="block w-full text-sm text-gray-900 border-2 border-dashed border-red-300 rounded-lg cursor-pointer bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 p-4 transition-all duration-300 group-hover:border-red-400" 
                    required 
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-8 h-8 text-red-400 group-hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accident Cost</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">LKR</span>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={accidentCost} 
                      onChange={e => setAccidentCost(e.target.value)} 
                      className="pl-12 pr-4 py-3 border-2 border-red-200 rounded-lg w-full focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:border-red-300 group-hover:shadow-md" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accident Date</label>
                  <input 
                    type="date" 
                    max={new Date().toISOString().split('T')[0]}
                    value={accidentDate} 
                    onChange={e => setAccidentDate(e.target.value)} 
                    className="py-3 px-4 border-2 border-red-200 rounded-lg w-full focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:border-red-300 group-hover:shadow-md" 
                    required 
                  />
                </div>
              </div>
              
              <button 
                onClick={() => handleSubmit("accident")} 
                disabled={loading}
                className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all duration-300 transform ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 hover:-translate-y-1 hover:shadow-xl focus:ring-4 focus:ring-red-300'
                } ${activeSection === 'accident' ? 'animate-pulse' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <LoadingSpinner size="small" light={true} />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <FaExclamationTriangle className="animate-bounce" />
                    Submit Accident Report
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Maintenance History */}
        {maintenanceHistory.length > 0 && (
          <div className={`transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} mb-8`}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FaClipboardCheck className="text-white animate-pulse" />
                  Maintenance History
                  <span className="ml-auto bg-white/20 rounded-full px-3 py-1 text-sm">
                    {maintenanceHistory.length} Records
                  </span>
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {maintenanceHistory.map((record, index) => (
                  <div 
                    key={index} 
                    className="group border-l-4 border-green-400 pl-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-r-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <p className="font-bold text-gray-800 text-lg group-hover:text-green-700 transition-colors">
                          {record.description}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-green-500" />
                            <span>{new Date(record.serviceDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-500 font-bold">LKR</span>
                            <span className="font-semibold">{record.serviceCost}</span>
                          </div>
                          {record.mechanicName && (
                            <div className="flex items-center gap-2">
                              <FaCog className="text-green-500" />
                              <span>{record.mechanicName}</span>
                            </div>
                          )}
                          {record.partsReplaced && (
                            <div className="flex items-center gap-2">
                              <span className="text-green-500">🔧</span>
                              <span>{record.partsReplaced}</span>
                            </div>
                          )}
                        </div>
                        {record.maintenanceReportUrl && (
                          <a
                            href={record.maintenanceReportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-2 text-green-700 hover:text-green-900 font-medium underline transition-colors"
                          >
                            <FaFileAlt />
                            Download Report
                          </a>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                        record.status === 'Completed' ? 'bg-green-200 text-green-800 group-hover:bg-green-300' : 
                        record.status === 'In Progress' ? 'bg-yellow-200 text-yellow-800 group-hover:bg-yellow-300' : 
                        'bg-gray-200 text-gray-800 group-hover:bg-gray-300'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Accident History */}
        {accidentHistory.length > 0 && (
          <div className={`transform transition-all duration-1000 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} mb-8`}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FaExclamationTriangle className="text-white animate-pulse" />
                  Accident History
                  <span className="ml-auto bg-white/20 rounded-full px-3 py-1 text-sm">
                    {accidentHistory.length} Records
                  </span>
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {accidentHistory.map((record, index) => (
                  <div 
                    key={index} 
                    className="group border-l-4 border-red-400 pl-6 py-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-r-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <p className="font-bold text-gray-800 text-lg group-hover:text-red-700 transition-colors">
                          {record.description}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-red-500" />
                            <span>{new Date(record.accidentDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-red-500 font-bold">LKR</span>
                            <span className="font-semibold">{record.accidentCost}</span>
                          </div>
                          {record.location && (
                            <div className="flex items-center gap-2">
                              <span className="text-red-500">📍</span>
                              <span>{record.location}</span>
                            </div>
                          )}
                          {record.driverName && (
                            <div className="flex items-center gap-2">
                              <span className="text-red-500">👤</span>
                              <span>{record.driverName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                          record.severity === 'Critical' ? 'bg-red-200 text-red-800 group-hover:bg-red-300' : 
                          record.severity === 'Major' ? 'bg-orange-200 text-orange-800 group-hover:bg-orange-300' : 
                          'bg-yellow-200 text-yellow-800 group-hover:bg-yellow-300'
                        }`}>
                          {record.severity}
                        </span>
                        <br />
                        <span className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                          record.repairStatus === 'Completed' ? 'bg-green-200 text-green-800 group-hover:bg-green-300' : 
                          record.repairStatus === 'In Progress' ? 'bg-blue-200 text-blue-800 group-hover:bg-blue-300' : 
                          'bg-gray-200 text-gray-800 group-hover:bg-gray-300'
                        }`}>
                          {record.repairStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
