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
  const [message, setMessage] = useState("");

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
  };

  // Export vehicles to CSV
  const exportToCSV = () => {
    const headers = ['Vehicle ID', 'Type', 'Capacity', 'Status', 'Insurance No', 'Insurance Expiry'];
    const csvContent = [
      headers.join(','),
      ...filteredVehicles.map(vehicle => [
        vehicle.vehicleId || '',
        vehicle.vehicleType || '',
        vehicle.capacity || '',
        vehicle.status || '',
        vehicle.insuranceNo || '',
        vehicle.insuranceExpDate ? new Date(vehicle.insuranceExpDate).toLocaleDateString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vehicles_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Add vehicle
  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
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
        <h2 className="text-3xl font-extrabold mb-6 text-[#8B4513] tracking-tight flex items-center gap-2">
          <FaTruck className="inline-block mr-2 text-[#CC7722]" /> Vehicle Management
        </h2>
        
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Available</p>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'Available').length}</p>
              </div>
              <FaCheckCircle className="text-3xl text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">In Use</p>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'In Use').length}</p>
              </div>
              <FaTruck className="text-3xl text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Maintenance</p>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'Maintenance').length}</p>
              </div>
              <FaTools className="text-3xl text-yellow-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Fleet</p>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
              <FaCalendarAlt className="text-3xl text-purple-200" />
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
            <input id="insuranceNo" name="insuranceNo" placeholder="e.g. INS123456" value={form.insuranceNo} onChange={handleChange} required className="p-3 border rounded focus:ring-2 focus:ring-amber-400" />
            <label htmlFor="insuranceExpDate" className="font-semibold text-[#CC7722]">Insurance Expiry Date</label>
            <input id="insuranceExpDate" name="insuranceExpDate" type="date" value={form.insuranceExpDate} onChange={handleChange} required className="p-3 border rounded focus:ring-2 focus:ring-amber-400" />
            <label htmlFor="insuranceFile" className="font-semibold text-[#CC7722]">Insurance File</label>
            <input id="insuranceFile" name="insuranceFile" type="file" accept=".pdf,.jpg,.png" onChange={handleChange} className="p-3 border rounded focus:ring-2 focus:ring-amber-400" />
            <label htmlFor="serviceDate" className="font-semibold text-[#CC7722]">Last Service Date</label>
            <input id="serviceDate" name="serviceDate" type="date" value={form.serviceDate} onChange={handleChange} className="p-3 border rounded focus:ring-2 focus:ring-amber-400" />
            <label htmlFor="serviceFile" className="font-semibold text-[#CC7722]">Service File</label>
            <input id="serviceFile" name="serviceFile" type="file" accept=".pdf,.jpg,.png" onChange={handleChange} className="p-3 border rounded focus:ring-2 focus:ring-amber-400" />
            <button type="submit" className="col-span-2 bg-gradient-to-r from-[#CC7722] to-[#c5a35a] text-white py-3 rounded font-bold shadow hover:scale-105 transition">Add Vehicle</button>
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
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
                title="Export to CSV"
              >
                <FaDownload className="text-sm" />
                Export
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
                      <tr key={vehicle._id} className="border-t cursor-pointer hover:bg-amber-50 transition" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>
                        <td className="p-3 font-semibold text-[#CC7722]">{vehicle.vehicleId || '-'}</td>
                        <td className="p-3 font-semibold">{vehicle.vehicleType}</td>
                        <td className="p-3">{vehicle.capacity}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            vehicle.status === 'Available' ? 'bg-green-100 text-green-800' :
                            vehicle.status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                            vehicle.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="p-3">{vehicle.insuranceNo}</td>
                        <td className="p-3">{vehicle.insuranceExpDate ? new Date(vehicle.insuranceExpDate).toLocaleDateString() : ""}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 justify-center">
                            <button 
                              onClick={e => { e.stopPropagation(); handleDelete(vehicle._id); }} 
                              className="bg-red-600 text-white px-2 py-1 rounded shadow hover:bg-red-700 transition text-xs flex items-center gap-1"
                              title="Delete Vehicle"
                            >
                              <FaTrash className="text-xs" />
                              Delete
                            </button>
                            <button 
                              onClick={e => { e.stopPropagation(); navigate(`/vehicle/${vehicle._id}/update`); }} 
                              className="bg-blue-600 text-white px-2 py-1 rounded shadow hover:bg-blue-700 transition text-xs flex items-center gap-1"
                              title="Update Vehicle"
                            >
                              <FaEdit className="text-xs" />
                              Update
                            </button>
                            <button 
                              onClick={e => { e.stopPropagation(); fetchMaintenanceHistory(vehicle._id); }} 
                              className="bg-green-600 text-white px-2 py-1 rounded shadow hover:bg-green-700 transition text-xs flex items-center gap-1"
                              title="Maintenance History"
                            >
                              <FaClipboardCheck className="text-xs" />
                              Maintenance
                            </button>
                            <button 
                              onClick={e => { e.stopPropagation(); fetchAccidentHistory(vehicle._id); }} 
                              className="bg-orange-600 text-white px-2 py-1 rounded shadow hover:bg-orange-700 transition text-xs flex items-center gap-1"
                              title="Accident History"
                            >
                              <FaExclamationTriangle className="text-xs" />
                              Accidents
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
