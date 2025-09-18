import React, { useState, useEffect } from 'react';
import { FaExclamationCircle, FaPlus, FaEdit, FaTrash, FaCar, FaUser, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const EmergencyManagement = () => {
  const [emergencyRecords, setEmergencyRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    vehicle: '',
    driver: '',
    emergencyType: 'Breakdown',
    description: '',
    location: '',
    reportedAt: '',
    status: 'Active',
    priority: 'Medium',
    resolvedAt: '',
    responseTeam: ''
  });

  // Fetch emergency records and vehicles
  useEffect(() => {
    fetchEmergencyRecords();
    fetchVehicles();
  }, []);

  const fetchEmergencyRecords = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/emergencies');
      const data = await response.json();
      setEmergencyRecords(data);
    } catch (error) {
      console.error('Error fetching emergency records:', error);
      setMessage('Error fetching emergency records');
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
      ? `http://localhost:5000/api/emergencies/${editingRecord._id}`
      : 'http://localhost:5000/api/emergencies';
    
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
        setMessage(editingRecord ? 'Emergency record updated successfully!' : 'Emergency record created successfully!');
        fetchEmergencyRecords();
        resetForm();
      } else {
        setMessage('Error saving emergency record');
      }
    } catch (error) {
      console.error('Error saving emergency record:', error);
      setMessage('Error saving emergency record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setForm({
      vehicle: record.vehicle._id || record.vehicle,
      driver: record.driver || '',
      emergencyType: record.emergencyType || 'Breakdown',
      description: record.description || '',
      location: record.location || '',
      reportedAt: record.reportedAt ? new Date(record.reportedAt).toISOString().slice(0, 16) : '',
      status: record.status || 'Active',
      priority: record.priority || 'Medium',
      resolvedAt: record.resolvedAt ? new Date(record.resolvedAt).toISOString().slice(0, 16) : '',
      responseTeam: record.responseTeam || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this emergency record?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/emergencies/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMessage('Emergency record deleted successfully!');
          fetchEmergencyRecords();
        } else {
          setMessage('Error deleting emergency record');
        }
      } catch (error) {
        console.error('Error deleting emergency record:', error);
        setMessage('Error deleting emergency record');
      }
    }
  };

  const resetForm = () => {
    setForm({
      vehicle: '',
      driver: '',
      emergencyType: 'Breakdown',
      description: '',
      location: '',
      reportedAt: '',
      status: 'Active',
      priority: 'Medium',
      resolvedAt: '',
      responseTeam: ''
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v._id === vehicleId);
    return vehicle ? `${vehicle.vehicleId} - ${vehicle.vehicleType}` : 'Unknown Vehicle';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#8B4513] flex items-center gap-2">
              <FaExclamationCircle className="text-red-600" />
              Emergency Management
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus />
              {showForm ? 'Cancel' : 'Add Emergency Record'}
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
                {editingRecord ? 'Edit Emergency Record' : 'Add New Emergency Record'}
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
                    <FaUser className="inline mr-1" /> Driver
                  </label>
                  <input
                    type="text"
                    value={form.driver}
                    onChange={(e) => setForm({...form, driver: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Type</label>
                  <select
                    value={form.emergencyType}
                    onChange={(e) => setForm({...form, emergencyType: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="Breakdown">Breakdown</option>
                    <option value="Accident">Accident</option>
                    <option value="Medical">Medical Emergency</option>
                    <option value="Security">Security Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({...form, priority: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
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
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaCalendarAlt className="inline mr-1" /> Reported At
                  </label>
                  <input
                    type="datetime-local"
                    value={form.reportedAt}
                    onChange={(e) => setForm({...form, reportedAt: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="Active">Active</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Response Team</label>
                  <input
                    type="text"
                    value={form.responseTeam}
                    onChange={(e) => setForm({...form, responseTeam: e.target.value})}
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

                {form.status === 'Resolved' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resolved At</label>
                    <input
                      type="datetime-local"
                      value={form.resolvedAt}
                      onChange={(e) => setForm({...form, resolvedAt: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                )}
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
                <p className="mt-4 text-gray-600">Loading emergency records...</p>
              </div>
            ) : (
              <table className="w-full bg-white rounded-lg overflow-hidden shadow">
                <thead className="bg-red-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Vehicle</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Priority</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-left">Reported</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Response Team</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencyRecords.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        No emergency records found. Add one to get started!
                      </td>
                    </tr>
                  ) : (
                    emergencyRecords.map((record) => (
                      <tr key={record._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {record.vehicle ? (
                            typeof record.vehicle === 'object' ? 
                              `${record.vehicle.vehicleId} - ${record.vehicle.vehicleType}` :
                              getVehicleInfo(record.vehicle)
                          ) : 'Unknown Vehicle'}
                        </td>
                        <td className="px-4 py-3">{record.emergencyType}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getPriorityColor(record.priority)}`}>
                            {record.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">{record.location}</td>
                        <td className="px-4 py-3">
                          {record.reportedAt ? new Date(record.reportedAt).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{record.responseTeam || 'N/A'}</td>
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

export default EmergencyManagement;
