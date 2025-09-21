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
      if (value) formData.append(key, value);
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
          vehicleId: "",
          type: "",
          model: "",
          year: "",
          plateNumber: "",
          capacity: "",
          status: "Available",
          lastMaintenanceDate: "",
          nextMaintenanceDate: "",
          fuelType: "",
          currentMileage: "",
          insuranceDetails: "",
          documents: null
        });
        await fetchVehicles(); // Refresh the vehicle list
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
      <div className="max-w-5xl w-full p-8 bg-gradient-to-br from-white/90 to-amber-50/90 rounded-xl shadow-lg">
        <h2 className="text-3xl font-extrabold mb-6 text-[#8B4513] tracking-tight flex items-center gap-2 hover:scale-105 transform transition-transform duration-300">
          <FaTruck className="inline-block mr-2 text-[#CC7722] animate-bounce-subtle" /> Vehicle Management
          <span className="ml-auto text-sm font-medium bg-[#CC7722] text-white px-3 py-1 rounded-full animate-pulse">
            Live Dashboard
          </span>
        </h2>
        
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="transform hover:scale-105 transition-all duration-300 bg-gradient-to-br from-emerald-400 via-green-500 to-green-600 text-white p-6 rounded-xl shadow-xl hover:shadow-2xl cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium uppercase tracking-wider">Available</p>
                <p className="text-3xl font-bold mt-2 font-mono">{vehicles.filter(v => v.status === 'Available').length}</p>
                <p className="text-green-100 text-xs mt-2">Vehicles Ready</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FaCheckCircle className="text-3xl text-white animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="transform hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-600 text-white p-6 rounded-xl shadow-xl hover:shadow-2xl cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">In Use</p>
                <p className="text-3xl font-bold mt-2 font-mono">{vehicles.filter(v => v.status === 'In Use').length}</p>
                <p className="text-blue-100 text-xs mt-2">Active Vehicles</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FaTruck className="text-3xl text-white animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="transform hover:scale-105 transition-all duration-300 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 text-white p-6 rounded-xl shadow-xl hover:shadow-2xl cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium uppercase tracking-wider">Maintenance</p>
                <p className="text-3xl font-bold mt-2 font-mono">{vehicles.filter(v => v.status === 'Maintenance').length}</p>
                <p className="text-yellow-100 text-xs mt-2">Under Service</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FaTools className="text-3xl text-white animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="transform hover:scale-105 transition-all duration-300 bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-500 text-white p-6 rounded-xl shadow-xl hover:shadow-2xl cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium uppercase tracking-wider">Total Fleet</p>
                <p className="text-3xl font-bold mt-2 font-mono">{vehicles.length}</p>
                <p className="text-purple-100 text-xs mt-2">All Vehicles</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FaCalendarAlt className="text-3xl text-white animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {message && <div className="mb-4 px-4 py-2 bg-green-100 text-green-800 rounded shadow">{message}</div>}
        <div className="bg-white/80 rounded-lg shadow p-6 mb-10">
          <h3 className="text-xl font-bold mb-4 text-[#CC7722] flex items-center gap-2">
            <FaCarSide className="inline-block mr-2" /> Register New Vehicle
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6" encType="multipart/form-data">
            <label htmlFor="vehicleType" className="font-semibold text-[#CC7722]">Vehicle Type</label>
            <select id="vehicleType" name="vehicleType" value={form.vehicleType} onChange={handleChange} required className="p-3 border rounded focus:ring-2 focus:ring-amber-400">
              <option value="">Select Type</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Bike">Bike</option>
              <option value="Car">Car</option>
            </select>
            <label htmlFor="capacity" className="font-semibold text-[#CC7722]">Capacity</label>
            <input id="capacity" name="capacity" type="number" placeholder="e.g. 2000kg" value={form.capacity} onChange={handleChange} required className="p-3 border rounded focus:ring-2 focus:ring-amber-400" />
            <label htmlFor="status" className="font-semibold text-[#CC7722]">Status</label>
            <input id="status" name="status" placeholder="e.g. Available, In Service" value={form.status} onChange={handleChange} className="p-3 border rounded focus:ring-2 focus:ring-amber-400" />
            <label htmlFor="insuranceNo" className="font-semibold text-[#CC7722]">Insurance Number</label>
            <div className="flex flex-col">
              <input 
                id="insuranceNo" 
                name="insuranceNo" 
                placeholder="e.g. INS123456" 
                value={form.insuranceNo} 
                onChange={handleChange} 
                required 
                className={`p-3 border rounded focus:ring-2 focus:ring-amber-400 ${formErrors.insuranceNo ? 'border-red-500' : ''}`}
                pattern="INS\d{6}"
                title="Insurance number must start with INS followed by 6 digits"
              />
              {formErrors.insuranceNo && (
                <p className="text-red-500 text-xs mt-1">{formErrors.insuranceNo}</p>
              )}
            </div>
            <label htmlFor="insuranceExpDate" className="font-semibold text-[#CC7722]">Insurance Expiry Date</label>
            <input id="insuranceExpDate" name="insuranceExpDate" type="date" value={form.insuranceExpDate} onChange={handleChange} required className="p-3 border rounded focus:ring-2 focus:ring-amber-400" />
            <label htmlFor="insuranceFile" className="font-semibold text-[#CC7722]">Insurance File</label>
            <input id="insuranceFile" name="insuranceFile" type="file" accept=".pdf,.jpg,.png" onChange={handleChange} className="p-3 border rounded focus:ring-2 focus:ring-amber-400" />
            <label htmlFor="serviceDate" className="font-semibold text-[#CC7722]">Last Service Date</label>
            <input id="serviceDate" name="serviceDate" type="date" value={form.serviceDate} onChange={handleChange} className="p-3 border rounded focus:ring-2 focus:ring-amber-400" />
            <label htmlFor="serviceFile" className="font-semibold text-[#CC7722]">Service File</label>
            <input id="serviceFile" name="serviceFile" type="file" accept=".pdf,.jpg,.png" onChange={handleChange} className="p-3 border rounded focus:ring-2 focus:ring-amber-400" />
            <button 
              type="submit" 
              className="col-span-2 bg-gradient-to-r from-[#CC7722] to-[#c5a35a] text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-102 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="flex items-center justify-center gap-2">
                <FaPlus className="text-sm group-hover:rotate-90 transition-transform duration-300" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">Add Vehicle</span>
              </div>
            </button>
          </form>
        </div>
        <div className="bg-white/80 rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4 text-[#CC7722] flex items-center gap-2">
            <FaCalendarAlt className="inline-block mr-2" /> Registered Vehicles
          </h3>
          
          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-wrap gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Vehicle ID, Type, or Insurance Number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={generatePDF}
                className="group relative flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Generate PDF Report"
              >
                <FaDownload className="text-sm group-hover:-translate-y-1 transition-transform duration-300" />
                <span className="font-medium group-hover:translate-x-0.5 transition-transform duration-300">Generate Report</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {filteredVehicles.length} of {vehicles.length} vehicles
              </span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#CC7722]"></div>
              <p className="mt-2 text-gray-600">Loading vehicles...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border rounded overflow-hidden">
                <thead>
                  <tr className="bg-[#F5EFE6] text-[#8B4513]">
                    <th className="p-3 text-left">
                      <div className="flex items-center gap-2">
                        <FaEye />
                        Vehicle ID
                      </div>
                    </th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Capacity</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Insurance No</th>
                    <th className="p-3 text-left">Insurance Expiry</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500">
                        {searchTerm || statusFilter ? 'No vehicles match your search criteria' : 'No vehicles registered yet'}
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map(vehicle => (
                      <tr key={vehicle._id} className="border-t hover:bg-amber-50 transition">
                        <td className="p-3 font-semibold text-[#CC7722] cursor-pointer" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>{vehicle.vehicleId || '-'}</td>
                        <td className="p-3 font-semibold cursor-pointer" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>{vehicle.vehicleType}</td>
                        <td className="p-3 cursor-pointer" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>{vehicle.capacity}</td>
                        <td className="p-3 cursor-pointer" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            vehicle.status === 'Available' ? 'bg-green-100 text-green-800' :
                            vehicle.status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                            vehicle.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="p-3 cursor-pointer" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>{vehicle.insuranceNo}</td>
                        <td className="p-3 cursor-pointer" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>{vehicle.insuranceExpDate ? new Date(vehicle.insuranceExpDate).toLocaleDateString() : ""}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2 justify-center">
                            <button 
                              onClick={(e) => handleDelete(vehicle._id)} 
                              className="group relative bg-gradient-to-r from-red-500 to-red-600 text-white w-[90px] h-[32px] rounded-lg shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transform hover:-translate-y-0.5 transition-all duration-200 text-xs"
                              title="Delete Vehicle"
                            >
                              <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                                <FaTrash className="text-xs group-hover:rotate-12 transition-transform duration-200" />
                                <span>Delete</span>
                              </div>
                            </button>
                            <button 
                              onClick={(e) => navigate(`/vehicle/${vehicle._id}/update`)}
                              className="group relative bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-[90px] h-[32px] rounded-lg shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all duration-200 text-xs"
                              title="Update Vehicle"
                            >
                              <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                                <FaEdit className="text-xs group-hover:rotate-12 transition-transform duration-200" />
                                <span>Update</span>
                              </div>
                            </button>
                            <button 
                              onClick={(e) => fetchMaintenanceHistory(vehicle._id)}
                              className="group relative bg-gradient-to-r from-emerald-500 to-green-600 text-white w-[90px] h-[32px] rounded-lg shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-green-700 transform hover:-translate-y-0.5 transition-all duration-200 text-xs"
                              title="Maintenance History"
                            >
                              <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                                <FaClipboardCheck className="text-xs group-hover:rotate-12 transition-transform duration-200" />
                                <span>Service</span>
                              </div>
                            </button>
                            <button 
                              onClick={(e) => fetchAccidentHistory(vehicle._id)}
                              className="group relative bg-gradient-to-r from-amber-500 to-orange-600 text-white w-[90px] h-[32px] rounded-lg shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-700 transform hover:-translate-y-0.5 transition-all duration-200 text-xs"
                              title="Accident History"
                            >
                              <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                                <FaExclamationTriangle className="text-xs group-hover:rotate-12 transition-transform duration-200" />
                                <span>Accident</span>
                              </div>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
                          <h4 className="font-medium text-gray-800">{record.description}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Date:</strong> {new Date(record.accidentDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Cost:</strong> ${record.accidentCost}
                          </p>
                          {record.location && (
                            <p className="text-sm text-gray-600">
                              <strong>Location:</strong> {record.location}
                            </p>
                          )}
                          {record.driverName && (
                            <p className="text-sm text-gray-600">
                              <strong>Driver:</strong> {record.driverName}
                            </p>
                          )}
                          {record.insuranceClaim !== undefined && (
                            <p className="text-sm text-gray-600">
                              <strong>Insurance Claim:</strong> {record.insuranceClaim ? 'Yes' : 'No'}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded text-sm font-medium ${
                            record.severity === 'Critical' ? 'bg-red-100 text-red-800' : 
                            record.severity === 'Major' ? 'bg-orange-100 text-orange-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.severity}
                          </span>
                          <br />
                          <span className={`mt-2 px-3 py-1 rounded text-sm font-medium ${
                            record.repairStatus === 'Completed' ? 'bg-green-100 text-green-800' : 
                            record.repairStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {record.repairStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagerDashboard;
