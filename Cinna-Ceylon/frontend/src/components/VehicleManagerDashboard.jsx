import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaCarSide, 
  FaTruck, 
  FaCalendarAlt, 
  FaClipboardCheck, 
  FaHistory, 
  FaExclamationTriangle,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilter,
  FaSearch,
  FaDownload,
  FaTools,
  FaCheckCircle
} from 'react-icons/fa';

// Use the public background image
const cinnamonBg = '/cinnamon-bg.jpeg';

// Custom CSS for animations
const customStyles = `
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

  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.8s ease-out;
  }

  .animate-bounceIn {
    animation: bounceIn 0.6s ease-out;
  }

  .animate-slideInRight {
    animation: slideInRight 0.7s ease-out;
  }

  .animate-pulse-slow {
    animation: pulse 3s ease-in-out infinite;
  }

  .vehicle-card {
    animation: fadeInUp 0.8s ease-out;
    animation-fill-mode: both;
  }

  .vehicle-card:nth-child(1) { animation-delay: 0.1s; }
  .vehicle-card:nth-child(2) { animation-delay: 0.2s; }
  .vehicle-card:nth-child(3) { animation-delay: 0.3s; }
  .vehicle-card:nth-child(4) { animation-delay: 0.4s; }

  .table-row {
    animation: fadeInUp 0.5s ease-out;
    animation-fill-mode: both;
  }

  .glass-effect {
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }
`;

// Add styles to head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

const VehicleManagerDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showMaintenanceHistory, setShowMaintenanceHistory] = useState(false);
  const [showAccidentHistory, setShowAccidentHistory] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [accidentHistory, setAccidentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    vehicleType: "",
    capacity: "",
    status: "Available",
    insuranceNo: "",
    insuranceExpDate: "",
    insuranceFile: null,
    serviceDate: "",
    serviceFile: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState("");

  // Validate insurance number format
  const validateInsuranceNo = (value) => {
    const insurancePattern = /^INS\d{6}$/;
    return insurancePattern.test(value);
  };

  // Fetch vehicles
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/vehicles")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setVehicles(data);
        setFilteredVehicles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching vehicles:", err);
        setLoading(false);
        setMessage("Error loading vehicles");
      });
  }, []);

  // Filter vehicles based on search and status
  useEffect(() => {
    let filtered = vehicles;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vehicle => 
        vehicle.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.insuranceNo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter && statusFilter !== "") {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }
    
    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, statusFilter]);

  // Handle form input changes
  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value
    }));

    // Validate insurance number when it changes
    if (name === 'insuranceNo') {
      if (!value) {
        setFormErrors(prev => ({ ...prev, insuranceNo: 'Insurance number is required' }));
      } else if (!validateInsuranceNo(value)) {
        setFormErrors(prev => ({ ...prev, insuranceNo: 'Insurance number must start with "INS" followed by 6 digits' }));
      } else {
        setFormErrors(prev => ({ ...prev, insuranceNo: '' }));
      }
    }
  };

  // Generate and export PDF
  const generatePDF = () => {
    // Create PDF content with styling
    const printContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            h1 {
              color: #CC7722;
              text-align: center;
              margin-bottom: 30px;
            }
            .header-info {
              text-align: right;
              margin-bottom: 20px;
              font-size: 12px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #F5EFE6;
              color: #8B4513;
              padding: 12px;
              text-align: left;
              font-size: 14px;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
              font-size: 13px;
            }
            .status {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-available { background: #dcfce7; color: #166534; }
            .status-inuse { background: #dbeafe; color: #1e40af; }
            .status-maintenance { background: #fef9c3; color: #854d0e; }
            .status-outofservice { background: #fee2e2; color: #991b1b; }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>Vehicle Fleet Report</h1>
          <div class="header-info">
            <div>Generated on: ${new Date().toLocaleDateString()}</div>
            <div>Total Vehicles: ${filteredVehicles.length}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Insurance No</th>
                <th>Insurance Expiry</th>
              </tr>
            </thead>
            <tbody>
              ${filteredVehicles.map(vehicle => `
                <tr>
                  <td><strong>${vehicle.vehicleId || '-'}</strong></td>
                  <td>${vehicle.vehicleType || '-'}</td>
                  <td>${vehicle.capacity || '-'}</td>
                  <td>
                    <span class="status status-${vehicle.status?.toLowerCase().replace(/\s+/g, '')}">
                      ${vehicle.status || '-'}
                    </span>
                  </td>
                  <td>${vehicle.insuranceNo || '-'}</td>
                  <td>${vehicle.insuranceExpDate ? new Date(vehicle.insuranceExpDate).toLocaleDateString() : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Cinna Ceylon Vehicle Management System</p>
            <p>This is an automatically generated report. Please verify all information.</p>
          </div>
        </body>
      </html>
    `;
    
    // Open in new window and trigger print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Trigger print dialog after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      // Close the window after printing (optional)
      // printWindow.close();
    }, 250);
  };

  // Add vehicle
  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");

    // Validate insurance number before submission
    if (!validateInsuranceNo(form.insuranceNo)) {
      setFormErrors(prev => ({
        ...prev,
        insuranceNo: 'Insurance number must start with "INS" followed by 6 digits'
      }));
      setMessage("Please fix the errors before submitting.");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      // Skip vehicleId as it should be auto-generated by the backend
      if (value && key !== 'vehicleId') formData.append(key, value);
    });
    try {
      const res = await fetch("http://localhost:5000/api/vehicles", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Vehicle added successfully!");
        setForm({
          vehicleType: "",
          capacity: "",
          status: "Available",
          insuranceNo: "",
          insuranceExpDate: "",
          insuranceFile: null,
          serviceDate: "",
          serviceFile: null,
        });
        // Refresh vehicle list
        fetch("http://localhost:5000/api/vehicles")
          .then(res => res.json())
          .then(data => {
            setVehicles(data);
            setFilteredVehicles(data);
          })
          .catch(err => console.error("Error refreshing vehicles:", err));
      } else {
        setMessage(data.message || "Error adding vehicle.");
      }
    } catch {
      setMessage("Network error. Please try again.");
    }
  };

  // Delete vehicle
  const handleDelete = async id => {
    setMessage("");
    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Vehicle deleted.");
        setVehicles(v => v.filter(vehicle => vehicle._id !== id));
      } else {
        setMessage(data.message || "Error deleting vehicle.");
      }
    } catch {
      setMessage("Network error. Please try again.");
    }
  };

  // Fetch maintenance history
  const fetchMaintenanceHistory = async (vehicleId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}/maintenance-history`);
      const data = await res.json();
      setMaintenanceHistory(data);
      setSelectedVehicle(vehicleId);
      setShowMaintenanceHistory(true);
    } catch (error) {
      console.error("Error fetching maintenance history:", error);
    }
  };

  // Fetch accident history
  const fetchAccidentHistory = async (vehicleId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}/accident-history`);
      const data = await res.json();
      setAccidentHistory(data);
      setSelectedVehicle(vehicleId);
      setShowAccidentHistory(true);
    } catch (error) {
      console.error("Error fetching accident history:", error);
    }
  };

  // Close modals
  const closeModals = () => {
    setShowMaintenanceHistory(false);
    setShowAccidentHistory(false);
    setSelectedVehicle(null);
  };

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
      <div className="max-w-7xl w-full p-8 bg-gradient-to-br from-white/95 to-amber-50/95 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20 animate-bounceIn">
        {/* Enhanced Header with Modern Design */}
        <div className="relative mb-8 p-6 bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#CD853F] rounded-2xl shadow-xl overflow-hidden animate-slideInRight">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12"></div>
          </div>
          
          {/* Header Content */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FaTruck className="text-3xl text-white animate-bounce" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Vehicle Management
                </h1>
                <p className="text-amber-100 text-lg font-medium mt-1">
                  Fleet Control Center
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white text-sm font-medium">Last Updated</p>
                <p className="text-amber-100 text-xs">
                  {new Date().toLocaleString()}
                </p>
              </div>
              <div className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-full shadow-lg animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  <span>Live Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Available Vehicles Card */}
          <div className="vehicle-card group relative transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-200 rounded-full animate-pulse"></div>
                  <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">Available</p>
                </div>
                <p className="text-4xl font-bold font-mono tracking-tight">
                  {vehicles.filter(v => v.status === 'Available').length}
                </p>
                <p className="text-emerald-100 text-sm font-medium">Vehicles Ready for Deployment</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                <FaCheckCircle className="text-4xl text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-300 to-green-300"></div>
          </div>
          
          {/* In Use Vehicles Card */}
          <div className="vehicle-card group relative transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-200 rounded-full animate-pulse"></div>
                  <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">In Use</p>
                </div>
                <p className="text-4xl font-bold font-mono tracking-tight">
                  {vehicles.filter(v => v.status === 'In Use').length}
                </p>
                <p className="text-blue-100 text-sm font-medium">Currently Active Fleet</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                <FaTruck className="text-4xl text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-indigo-300"></div>
          </div>
          
          {/* Maintenance Vehicles Card */}
          <div className="vehicle-card group relative transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-200 rounded-full animate-pulse"></div>
                  <p className="text-yellow-100 text-sm font-semibold uppercase tracking-wider">Maintenance</p>
                </div>
                <p className="text-4xl font-bold font-mono tracking-tight">
                  {vehicles.filter(v => v.status === 'Maintenance').length}
                </p>
                <p className="text-yellow-100 text-sm font-medium">Under Service & Repair</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                <FaTools className="text-4xl text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 to-orange-300"></div>
          </div>
          
          {/* Total Fleet Card */}
          <div className="vehicle-card group relative transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-200 rounded-full animate-pulse"></div>
                  <p className="text-purple-100 text-sm font-semibold uppercase tracking-wider">Total Fleet</p>
                </div>
                <p className="text-4xl font-bold font-mono tracking-tight">{vehicles.length}</p>
                <p className="text-purple-100 text-sm font-medium">Complete Vehicle Inventory</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                <FaCarSide className="text-4xl text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-300 to-purple-300"></div>
          </div>
        </div>

        {/* Enhanced Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 shadow-lg ${
            message.includes("successfully") 
              ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-500 text-emerald-800" 
              : "bg-gradient-to-r from-red-50 to-pink-50 border-red-500 text-red-800"
          }`}>
            <div className="flex items-center space-x-3">
              {message.includes("successfully") ? (
                <FaCheckCircle className="text-emerald-600 text-xl" />
              ) : (
                <FaExclamationTriangle className="text-red-600 text-xl" />
              )}
              <p className="font-medium">{message}</p>
            </div>
          </div>
        )}

        {/* Accident History Modal */}
        {showAccidentHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-[#CC7722] flex items-center gap-2">
                    <FaExclamationTriangle className="inline-block mr-2" /> Accident History
                  </h3>
                  <button 
                    onClick={closeModals}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                {accidentHistory.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No accident records found.</p>
                ) : (
                  <div className="space-y-4">
                    {accidentHistory.map((record, index) => (
                      <div key={index} className="border-l-4 border-red-500 pl-4 py-4 bg-red-50 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">Accident Type: {record.accidentType || 'General Accident'}</p>
                            <p className="text-sm text-gray-600">Cost: ${record.cost || 'N/A'}</p>
                            <p className="text-sm text-gray-600">Date: {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</p>
                            <p className="text-sm text-gray-600 mt-2">Description: {record.description || 'No description available'}</p>
                          </div>
                          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                            Reported
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Vehicle Registration Form */}
        <div className="bg-gradient-to-br from-white/95 to-amber-50/80 rounded-2xl shadow-xl border border-white/50 p-8 mb-10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-[#CC7722] to-[#c5a35a] rounded-xl shadow-lg">
                <FaPlus className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8B4513]">Register New Vehicle</h3>
                <p className="text-[#CC7722] text-sm font-medium">Add a new vehicle to your fleet</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-[#CC7722]/10 text-[#CC7722] text-sm font-medium rounded-full">
              Fleet Expansion
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Type */}
              <div className="space-y-2">
                <label htmlFor="vehicleType" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Vehicle Type <span className="text-red-500">*</span>
                </label>
                <select 
                  id="vehicleType" 
                  name="vehicleType" 
                  value={form.vehicleType} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#CC7722] focus:ring-4 focus:ring-[#CC7722]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
                >
                  <option value="">Choose Vehicle Type</option>
                  <option value="Truck">🚛 Truck</option>
                  <option value="Van">🚐 Van</option>
                  <option value="Bike">🏍️ Bike</option>
                  <option value="Car">🚗 Car</option>
                </select>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <label htmlFor="capacity" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Capacity (kg) <span className="text-red-500">*</span>
                </label>
                <input 
                  id="capacity" 
                  name="capacity" 
                  type="number" 
                  placeholder="e.g. 2000" 
                  value={form.capacity} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#CC7722] focus:ring-4 focus:ring-[#CC7722]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Initial Status
                </label>
                <select 
                  id="status" 
                  name="status" 
                  value={form.status} 
                  onChange={handleChange} 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#CC7722] focus:ring-4 focus:ring-[#CC7722]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
                >
                  <option value="Available">✅ Available</option>
                  <option value="In Use">🚛 In Use</option>
                  <option value="Maintenance">🔧 Maintenance</option>
                  <option value="Out of Service">❌ Out of Service</option>
                </select>
              </div>

              {/* Insurance Number */}
              <div className="space-y-2">
                <label htmlFor="insuranceNo" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Insurance Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    id="insuranceNo" 
                    name="insuranceNo" 
                    placeholder="INS123456" 
                    value={form.insuranceNo} 
                    onChange={handleChange} 
                    required 
                    className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-[#CC7722]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium ${
                      formErrors.insuranceNo 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 focus:border-[#CC7722]'
                    }`}
                    pattern="INS\d{6}"
                    title="Insurance number must start with INS followed by 6 digits"
                  />
                  {formErrors.insuranceNo && (
                    <div className="absolute -bottom-6 left-0 flex items-center space-x-2 text-red-600">
                      <FaExclamationTriangle className="text-sm" />
                      <p className="text-xs font-medium">{formErrors.insuranceNo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Insurance Expiry Date */}
              <div className="space-y-2">
                <label htmlFor="insuranceExpDate" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Insurance Expiry <span className="text-red-500">*</span>
                </label>
                <input 
                  id="insuranceExpDate" 
                  name="insuranceExpDate" 
                  type="date" 
                  value={form.insuranceExpDate} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#CC7722] focus:ring-4 focus:ring-[#CC7722]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
                />
              </div>

              {/* Insurance File */}
              <div className="space-y-2">
                <label htmlFor="insuranceFile" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Insurance Document
                </label>
                <input 
                  id="insuranceFile" 
                  name="insuranceFile" 
                  type="file" 
                  accept=".pdf,.jpg,.png" 
                  onChange={handleChange} 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#CC7722] focus:ring-4 focus:ring-[#CC7722]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#CC7722] file:text-white file:font-medium hover:file:bg-[#A0522D] file:transition-colors"
                />
              </div>

              {/* Service Date */}
              <div className="space-y-2">
                <label htmlFor="serviceDate" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Last Service Date
                </label>
                <input 
                  id="serviceDate" 
                  name="serviceDate" 
                  type="date" 
                  value={form.serviceDate} 
                  onChange={handleChange} 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#CC7722] focus:ring-4 focus:ring-[#CC7722]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
                />
              </div>

              {/* Service File */}
              <div className="space-y-2">
                <label htmlFor="serviceFile" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Service Document
                </label>
                <input 
                  id="serviceFile" 
                  name="serviceFile" 
                  type="file" 
                  accept=".pdf,.jpg,.png" 
                  onChange={handleChange} 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#CC7722] focus:ring-4 focus:ring-[#CC7722]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#CC7722] file:text-white file:font-medium hover:file:bg-[#A0522D] file:transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button 
                type="submit" 
                className="w-full group relative overflow-hidden bg-gradient-to-r from-[#8B4513] via-[#CC7722] to-[#c5a35a] text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  <FaPlus className="text-xl group-hover:rotate-90 transition-transform duration-300" />
                  <span className="group-hover:tracking-wider transition-all duration-300">Register Vehicle</span>
                  <FaCarSide className="text-xl group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </button>
            </div>
          </form>
        </div>
        {/* Enhanced Vehicle Management Section */}
        <div className="bg-gradient-to-br from-white/95 to-amber-50/80 rounded-2xl shadow-xl border border-white/50 p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-[#8B4513] to-[#CC7722] rounded-xl shadow-lg">
                <FaEye className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8B4513]">Registered Vehicles</h3>
                <p className="text-[#CC7722] text-sm font-medium">Manage your complete fleet</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-[#CC7722]/10 text-[#CC7722] text-sm font-medium rounded-full">
              Fleet Overview
            </div>
          </div>
          
          {/* Enhanced Search and Filter Bar */}
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-50/80 to-orange-50/80 rounded-xl border border-amber-200/50 backdrop-blur-sm">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[280px]">
                <div className="relative group">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#CC7722] transition-colors duration-300" />
                  <input
                    type="text"
                    placeholder="Search by Vehicle ID, Type, or Insurance Number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#CC7722] focus:ring-4 focus:ring-[#CC7722]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium placeholder-gray-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FaFilter className="text-[#CC7722]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#CC7722] focus:ring-4 focus:ring-[#CC7722]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
                >
                  <option value="">All Status</option>
                  <option value="Available">✅ Available</option>
                  <option value="In Use">🚛 In Use</option>
                  <option value="Maintenance">🔧 Maintenance</option>
                  <option value="Out of Service">❌ Out of Service</option>
                </select>
              </div>
              
              <button
                onClick={generatePDF}
                className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                title="Generate PDF Report"
              >
                <FaDownload className="text-sm group-hover:-translate-y-1 transition-transform duration-300" />
                <span className="group-hover:tracking-wider transition-all duration-300">Generate Report</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
              </button>
              
              <div className="px-4 py-2 bg-[#CC7722]/10 text-[#CC7722] text-sm font-semibold rounded-full border border-[#CC7722]/20">
                {filteredVehicles.length} of {vehicles.length} vehicles
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#CC7722]/20 border-t-[#CC7722]"></div>
                <FaTruck className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#CC7722] text-xl" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading your fleet...</p>
            </div>
          ) : (
            <div className="bg-white/60 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm border border-white/50">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#8B4513] to-[#CC7722] text-white">
                      <th className="px-6 py-4 text-left font-semibold">
                        <div className="flex items-center gap-2">
                          <FaCarSide className="text-amber-200" />
                          Vehicle ID
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        <div className="flex items-center gap-2">
                          <FaTruck className="text-amber-200" />
                          Type
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-amber-200" />
                          Capacity
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        <div className="flex items-center gap-2">
                          <FaCheckCircle className="text-amber-200" />
                          Status
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">Insurance Details</th>
                      <th className="px-6 py-4 text-center font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <FaTools className="text-amber-200" />
                          Actions
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredVehicles.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <FaCarSide className="text-4xl text-gray-300" />
                            <p className="text-gray-500 font-medium">
                              {searchTerm || statusFilter ? 'No vehicles match your search criteria' : 'No vehicles registered yet'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredVehicles.map((vehicle, index) => (
                        <tr key={vehicle._id} className="group hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 cursor-pointer">
                          <td className="px-6 py-4" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-[#CC7722] to-[#c5a35a] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {vehicle.vehicleType?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-[#8B4513]">{vehicle.vehicleId || '-'}</p>
                                <p className="text-xs text-gray-500">Vehicle #{index + 1}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>
                            <div className="flex items-center space-x-2">
                              {vehicle.vehicleType === 'Truck' && <FaTruck className="text-[#CC7722]" />}
                              {vehicle.vehicleType === 'Van' && <FaCarSide className="text-[#CC7722]" />}
                              {vehicle.vehicleType === 'Car' && <FaCarSide className="text-[#CC7722]" />}
                              {vehicle.vehicleType === 'Bike' && <FaCarSide className="text-[#CC7722]" />}
                              <span className="font-semibold text-gray-700">{vehicle.vehicleType}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>
                            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-full">
                              {vehicle.capacity} kg
                            </span>
                          </td>
                          <td className="px-6 py-4" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              vehicle.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                              vehicle.status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                              vehicle.status === 'Maintenance' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                vehicle.status === 'Available' ? 'bg-emerald-400' :
                                vehicle.status === 'In Use' ? 'bg-blue-400' :
                                vehicle.status === 'Maintenance' ? 'bg-amber-400' :
                                'bg-red-400'
                              }`}></div>
                              {vehicle.status}
                            </span>
                          </td>
                          <td className="px-6 py-4" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>
                            <div className="space-y-1">
                              <p className="font-medium text-gray-700">{vehicle.insuranceNo}</p>
                              <p className="text-xs text-gray-500">
                                Expires: {vehicle.insuranceExpDate ? new Date(vehicle.insuranceExpDate).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(vehicle._id);
                                }} 
                                className="group relative p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                                title="Delete Vehicle"
                              >
                                <FaTrash className="text-sm group-hover:rotate-12 transition-transform duration-200" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/vehicle/${vehicle._id}/update`);
                                }}
                                className="group relative p-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                                title="Update Vehicle"
                              >
                                <FaEdit className="text-sm group-hover:rotate-12 transition-transform duration-200" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fetchMaintenanceHistory(vehicle._id);
                                }}
                                className="group relative p-2 bg-emerald-500 text-white rounded-lg shadow-lg hover:bg-emerald-600 hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                                title="Maintenance History"
                              >
                                <FaClipboardCheck className="text-sm group-hover:rotate-12 transition-transform duration-200" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fetchAccidentHistory(vehicle._id);
                                }}
                                className="group relative p-2 bg-amber-500 text-white rounded-lg shadow-lg hover:bg-amber-600 hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                                title="Accident History"
                              >
                                <FaExclamationTriangle className="text-sm group-hover:rotate-12 transition-transform duration-200" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Maintenance History Modal */}
        {showMaintenanceHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#CC7722] flex items-center gap-2">
                  <FaClipboardCheck className="inline-block mr-2" /> Maintenance History
                </h3>
                <button 
                  onClick={closeModals}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {maintenanceHistory.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No maintenance records found.</p>
              ) : (
                <div className="space-y-4">
                  {maintenanceHistory.map((record, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4 py-4 bg-green-50 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">{record.description}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Date:</strong> {new Date(record.serviceDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Cost:</strong> ${record.serviceCost}
                          </p>
                          {record.mechanicName && (
                            <p className="text-sm text-gray-600">
                              <strong>Mechanic:</strong> {record.mechanicName}
                            </p>
                          )}
                          {record.partsReplaced && (
                            <p className="text-sm text-gray-600">
                              <strong>Parts Replaced:</strong> {record.partsReplaced}
                            </p>
                          )}
                          {record.nextServiceDue && (
                            <p className="text-sm text-gray-600">
                              <strong>Next Service Due:</strong> {new Date(record.nextServiceDue).toLocaleDateString()}
                            </p>
                          )}
                          {record.maintenanceReportUrl && (
                            <a
                              href={record.maintenanceReportUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-1 text-blue-700 underline text-sm"
                            >
                              Download Report
                            </a>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded text-sm font-medium ${
                          record.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          record.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-[#CC7722] to-[#c5a35a] text-white w-12 h-12 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group relative"
          title="Add New Vehicle"
        >
          <FaPlus className="text-xl" />
          <span className="absolute right-full mr-3 bg-white text-[#CC7722] px-3 py-1 rounded-lg shadow-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Add New Vehicle
          </span>
        </button>
        
        <button
          onClick={generatePDF}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white w-12 h-12 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group relative"
          title="Generate PDF Report"
        >
          <FaDownload className="text-xl" />
          <span className="absolute right-full mr-3 bg-white text-green-600 px-3 py-1 rounded-lg shadow-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Generate PDF Report
          </span>
        </button>
      </div>
    </div>
  );
};

export default VehicleManagerDashboard;
