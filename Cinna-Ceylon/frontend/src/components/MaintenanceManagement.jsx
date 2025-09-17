import React, { useState, useEffect } from 'react';
import { FaClipboardCheck, FaPlus, FaEdit, FaTrash, FaCar, FaDollarSign, FaCalendarAlt, FaUser } from 'react-icons/fa';

const MaintenanceManagement = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    vehicle: '',
    serviceDate: '',
    serviceCost: '',
    description: '',
    mechanicName: '',
    partsReplaced: '',
    nextServiceDue: '',
    status: 'Completed'
  });

  // Fetch maintenance records and vehicles
  useEffect(() => {
    fetchMaintenanceRecords();
    fetchVehicles();
  }, []);

  const fetchMaintenanceRecords = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/maintenance');
      const data = await response.json();
      setMaintenanceRecords(data);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      setMessage('Error fetching maintenance records');
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
      ? `http://localhost:5000/api/maintenance/${editingRecord._id}`
      : 'http://localhost:5000/api/maintenance';
    
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
        setMessage(editingRecord ? 'Maintenance record updated successfully!' : 'Maintenance record created successfully!');
        fetchMaintenanceRecords();
        resetForm();
      } else {
        setMessage('Error saving maintenance record');
      }
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      setMessage('Error saving maintenance record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setForm({
      vehicle: record.vehicle._id || record.vehicle,
      serviceDate: record.serviceDate ? new Date(record.serviceDate).toISOString().split('T')[0] : '',
      serviceCost: record.serviceCost || '',
      description: record.description || '',
      mechanicName: record.mechanicName || '',
      partsReplaced: record.partsReplaced || '',
      nextServiceDue: record.nextServiceDue ? new Date(record.nextServiceDue).toISOString().split('T')[0] : '',
      status: record.status || 'Completed'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/maintenance/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMessage('Maintenance record deleted successfully!');
          fetchMaintenanceRecords();
        } else {
          setMessage('Error deleting maintenance record');
        }
      } catch (error) {
        console.error('Error deleting maintenance record:', error);
        setMessage('Error deleting maintenance record');
      }
    }
  };

  const resetForm = () => {
    setForm({
      vehicle: '',
      serviceDate: '',
      serviceCost: '',
      description: '',
      mechanicName: '',
      partsReplaced: '',
      nextServiceDue: '',
      status: 'Completed'
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v._id === vehicleId);
    return vehicle ? `${vehicle.vehicleId} - ${vehicle.vehicleType}` : 'Unknown Vehicle';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#8B4513] flex items-center gap-2">
              <FaClipboardCheck className="text-[#CC7722]" />
              Maintenance Management
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#CC7722] hover:bg-[#8B4513] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus />
              {showForm ? 'Cancel' : 'Add Maintenance Record'}
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
                {editingRecord ? 'Edit Maintenance Record' : 'Add New Maintenance Record'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaCar className="inline mr-1" /> Vehicle
                  </label>
                  <select
                    value={form.vehicle}
                    onChange={(e) => setForm({...form, vehicle: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC7722] focus:border-[#CC7722]"
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
                    <FaCalendarAlt className="inline mr-1" /> Service Date
                  </label>
                  <input
                    type="date"
                    value={form.serviceDate}
                    onChange={(e) => setForm({...form, serviceDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC7722] focus:border-[#CC7722]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaDollarSign className="inline mr-1" /> Service Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.serviceCost}
                    onChange={(e) => setForm({...form, serviceCost: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC7722] focus:border-[#CC7722]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaUser className="inline mr-1" /> Mechanic Name
                  </label>
                  <input
                    type="text"
                    value={form.mechanicName}
                    onChange={(e) => setForm({...form, mechanicName: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC7722] focus:border-[#CC7722]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC7722] focus:border-[#CC7722]"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parts Replaced</label>
                  <input
                    type="text"
                    value={form.partsReplaced}
                    onChange={(e) => setForm({...form, partsReplaced: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC7722] focus:border-[#CC7722]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Service Due</label>
                  <input
                    type="date"
                    value={form.nextServiceDue}
                    onChange={(e) => setForm({...form, nextServiceDue: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC7722] focus:border-[#CC7722]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC7722] focus:border-[#CC7722]"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="bg-[#CC7722] hover:bg-[#8B4513] text-white px-6 py-2 rounded-lg transition-colors"
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CC7722] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading maintenance records...</p>
              </div>
            ) : (
              <table className="w-full bg-white rounded-lg overflow-hidden shadow">
                <thead className="bg-[#CC7722] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Vehicle</th>
                    <th className="px-4 py-3 text-left">Service Date</th>
                    <th className="px-4 py-3 text-left">Cost</th>
                    <th className="px-4 py-3 text-left">Mechanic</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        No maintenance records found. Add one to get started!
                      </td>
                    </tr>
                  ) : (
                    maintenanceRecords.map((record) => (
                      <tr key={record._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {record.vehicle ? (
                            typeof record.vehicle === 'object' ? 
                              `${record.vehicle.vehicleId} - ${record.vehicle.vehicleType}` :
                              getVehicleInfo(record.vehicle)
                          ) : 'Unknown Vehicle'}
                        </td>
                        <td className="px-4 py-3">
                          {record.serviceDate ? new Date(record.serviceDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3">${record.serviceCost}</td>
                        <td className="px-4 py-3">{record.mechanicName || 'N/A'}</td>
                        <td className="px-4 py-3">{record.description}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            record.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            record.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {record.status}
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

export default MaintenanceManagement;
