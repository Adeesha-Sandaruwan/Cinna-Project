import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaPlus, FaEdit, FaTrash, FaCar, FaDollarSign, FaCalendarAlt, FaUser, FaMapMarkerAlt } from 'react-icons/fa';

const AccidentManagement = () => {
  const [accidentRecords, setAccidentRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    vehicle: '',
    accidentDate: '',
    accidentCost: '',
    description: '',
    severity: 'Minor',
    location: '',
    driverName: '',
    insuranceClaim: false,
    repairStatus: 'Pending'
  });

  // Fetch accident records and vehicles
  useEffect(() => {
    fetchAccidentRecords();
    fetchVehicles();
  }, []);

  const fetchAccidentRecords = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/accidents');
      const data = await response.json();
      setAccidentRecords(data);
    } catch (error) {
      console.error('Error fetching accident records:', error);
      setMessage('Error fetching accident records');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vehicles');
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingRecord 
      ? `http://localhost:5000/api/accidents/${editingRecord._id}`
      : 'http://localhost:5000/api/accidents';
    
    const method = editingRecord ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setMessage(editingRecord ? 'Accident record updated successfully!' : 'Accident record created successfully!');
        fetchAccidentRecords();
        resetForm();
      } else {
        setMessage('Error saving accident record');
      }
    } catch (error) {
      console.error('Error saving accident record:', error);
      setMessage('Error saving accident record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setForm({
      vehicle: record.vehicle._id || record.vehicle,
      accidentDate: record.accidentDate ? new Date(record.accidentDate).toISOString().split('T')[0] : '',
      accidentCost: record.accidentCost || '',
      description: record.description || '',
      severity: record.severity || 'Minor',
      location: record.location || '',
      driverName: record.driverName || '',
      insuranceClaim: record.insuranceClaim || false,
      repairStatus: record.repairStatus || 'Pending'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this accident record?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/accidents/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMessage('Accident record deleted successfully!');
          fetchAccidentRecords();
        } else {
          setMessage('Error deleting accident record');
        }
      } catch (error) {
        console.error('Error deleting accident record:', error);
        setMessage('Error deleting accident record');
      }
    }
  };

  const resetForm = () => {
    setForm({
      vehicle: '',
      accidentDate: '',
      accidentCost: '',
      description: '',
      severity: 'Minor',
      location: '',
      driverName: '',
      insuranceClaim: false,
      repairStatus: 'Pending'
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v._id === vehicleId);
    return vehicle ? `${vehicle.vehicleId} - ${vehicle.vehicleType}` : 'Unknown Vehicle';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Major': return 'bg-orange-100 text-orange-800';
      case 'Minor': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRepairStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#8B4513] flex items-center gap-2">
              <FaExclamationTriangle className="text-red-600" />
              Accident Management
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus />
              {showForm ? 'Cancel' : 'Add Accident Record'}
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-4 ${
              message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-4 text-[#8B4513]">
                {editingRecord ? 'Edit Accident Record' : 'Add New Accident Record'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaCar className="inline mr-1" /> Vehicle
                  </label>
                  <select
                    value={form.vehicle}
                    onChange={(e) => setForm({...form, vehicle: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.vehicleId} - {vehicle.vehicleType}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaCalendarAlt className="inline mr-1" /> Accident Date
                  </label>
                  <input
                    type="date"
                    value={form.accidentDate}
                    onChange={(e) => setForm({...form, accidentDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaDollarSign className="inline mr-1" /> Accident Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.accidentCost}
                    onChange={(e) => setForm({...form, accidentCost: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({...form, severity: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="Minor">Minor</option>
                    <option value="Major">Major</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaMapMarkerAlt className="inline mr-1" /> Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({...form, location: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaUser className="inline mr-1" /> Driver Name
                  </label>
                  <input
                    type="text"
                    value={form.driverName}
                    onChange={(e) => setForm({...form, driverName: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Repair Status</label>
                  <select
                    value={form.repairStatus}
                    onChange={(e) => setForm({...form, repairStatus: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.insuranceClaim}
                    onChange={(e) => setForm({...form, insuranceClaim: e.target.checked})}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Insurance Claim Filed</label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {editingRecord ? 'Update Record' : 'Create Record'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Records Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading accident records...</p>
              </div>
            ) : (
              <table className="w-full bg-white rounded-lg overflow-hidden shadow">
                <thead className="bg-red-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Vehicle</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Cost</th>
                    <th className="px-4 py-3 text-left">Severity</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-left">Driver</th>
                    <th className="px-4 py-3 text-left">Repair Status</th>
                    <th className="px-4 py-3 text-left">Insurance</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accidentRecords.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                        No accident records found. Add one to get started!
                      </td>
                    </tr>
                  ) : (
                    accidentRecords.map((record) => (
                      <tr key={record._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {record.vehicle ? (
                            typeof record.vehicle === 'object' ? 
                              `${record.vehicle.vehicleId} - ${record.vehicle.vehicleType}` :
                              getVehicleInfo(record.vehicle)
                          ) : 'Unknown Vehicle'}
                        </td>
                        <td className="px-4 py-3">
                          {record.accidentDate ? new Date(record.accidentDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3">${record.accidentCost}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getSeverityColor(record.severity)}`}>
                            {record.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3">{record.location || 'N/A'}</td>
                        <td className="px-4 py-3">{record.driverName || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getRepairStatusColor(record.repairStatus)}`}>
                            {record.repairStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            record.insuranceClaim ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {record.insuranceClaim ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(record)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(record._id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccidentManagement;
