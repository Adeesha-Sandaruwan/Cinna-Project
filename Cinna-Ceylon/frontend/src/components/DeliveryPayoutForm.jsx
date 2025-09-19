import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  TruckIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckBadgeIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  WrenchIcon,
  BoltIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const DeliveryPayoutForm = ({ onBackToDashboard }) => {
  const [payouts, setPayouts] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [emergencyRecords, setEmergencyRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    referenceType: 'Maintenance',
    referenceId: '',
    vehicle: '',
    payoutDate: new Date().toISOString().split('T')[0],
    amount: '',
    paymentStatus: 'Pending',
    notes: '',
    approvedBy: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [stats, setStats] = useState({
    totalPayouts: 0,
    totalAmount: 0,
    maintenancePayouts: 0,
    emergencyPayouts: 0,
    pendingPayouts: 0
  });
  const [showReferenceDetails, setShowReferenceDetails] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchPayouts();
    fetchMaintenanceRecords();
    fetchEmergencyRecords();
    fetchVehicles();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [payouts]);

  // ---------- Fetch Data ----------
  const fetchPayouts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/delivery-payouts`);
      setPayouts(response.data.docs || response.data || []);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      setPayouts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaintenanceRecords = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance`);
      setMaintenanceRecords(response.data || []);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      setMaintenanceRecords([]);
    }
  };

  const fetchEmergencyRecords = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emergencies`);
      setEmergencyRecords(response.data || []);
    } catch (error) {
      console.error('Error fetching emergency records:', error);
      setEmergencyRecords([]);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vehicles`);
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    }
  };

  // ---------- Stats ----------
  const calculateStats = () => {
    const totalPayouts = payouts.length;
    const totalAmount = payouts.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const maintenancePayouts = payouts.filter(p => p.referenceType === 'Maintenance').length;
    const emergencyPayouts = payouts.filter(p => p.referenceType === 'Emergency').length;
    const pendingPayouts = payouts.filter(p => p.paymentStatus === 'Pending').length;

    setStats({ totalPayouts, totalAmount, maintenancePayouts, emergencyPayouts, pendingPayouts });
  };

  // ---------- Helpers ----------
  const getAvailableReferences = () =>
    formData.referenceType === 'Maintenance'
      ? maintenanceRecords
      : formData.referenceType === 'Emergency'
      ? emergencyRecords
      : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReferenceDetails = (payout) => {
    if (payout.referenceType === 'Maintenance') {
      const record = maintenanceRecords.find(m => m._id === (payout.referenceId?._id || payout.referenceId));
      return `Maintenance: ${record?.description || 'Service'}`;
    }
    if (payout.referenceType === 'Emergency') {
      const record = emergencyRecords.find(e => e._id === (payout.referenceId?._id || payout.referenceId));
      return `Emergency: ${record?.description || 'Service'}`;
    }
    return `${payout.referenceType} Payment`;
  };

  // ---------- Form ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'referenceType') {
      setFormData(prev => ({ ...prev, referenceId: '', vehicle: '', amount: '' }));
    }

    if (name === 'referenceId' && value) {
      if (formData.referenceType === 'Maintenance') {
        const rec = maintenanceRecords.find(m => m._id === value);
        if (rec) {
          setFormData(prev => ({
            ...prev,
            vehicle: rec.vehicle?._id || rec.vehicle,
            amount: rec.serviceCost || '0'
          }));
        }
      } else if (formData.referenceType === 'Emergency') {
        const rec = emergencyRecords.find(r => r._id === value);
        if (rec) {
          setFormData(prev => ({
            ...prev,
            vehicle: rec.vehicle?._id || rec.vehicle,
            amount: prev.amount || '0'
          }));
        }
      }
    }

    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.referenceId) newErrors.referenceId = 'Reference record is required';
    if (!formData.vehicle) newErrors.vehicle = 'Vehicle is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.payoutDate) newErrors.payoutDate = 'Payout date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/delivery-payouts/${editingId}`, formData);
        setSuccessMessage('Payout updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/delivery-payouts`, formData);
        setSuccessMessage('Payout created successfully!');
      }
      resetForm();
      fetchPayouts();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving payout:', err);
      setErrors({ submit: err.response?.data?.message || 'Error saving payout record' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (payout) => {
    setFormData({
      referenceType: payout.referenceType,
      referenceId: payout.referenceId?._id || payout.referenceId,
      vehicle: payout.vehicle?._id || payout.vehicle,
      payoutDate: new Date(payout.payoutDate).toISOString().split('T')[0],
      amount: payout.amount,
      paymentStatus: payout.paymentStatus,
      notes: payout.notes || '',
      approvedBy: payout.approvedBy || ''
    });
    setEditingId(payout._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payout record?')) return;
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/delivery-payouts/${id}`);
      setSuccessMessage('Payout deleted successfully!');
      fetchPayouts();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting payout:', err);
      setErrors({ submit: err.response?.data?.message || 'Error deleting payout record' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      referenceType: 'Maintenance',
      referenceId: '',
      vehicle: '',
      payoutDate: new Date().toISOString().split('T')[0],
      amount: '',
      paymentStatus: 'Pending',
      notes: '',
      approvedBy: ''
    });
    setEditingId(null);
    setErrors({});
  };

  // ---------- Filtering ----------
  const filteredPayouts = payouts.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.vehicle?.make?.toLowerCase().includes(term) ||
      p.vehicle?.model?.toLowerCase().includes(term) ||
      p.vehicle?.licensePlate?.toLowerCase().includes(term) ||
      p.referenceId?.description?.toLowerCase().includes(term) ||
      false;

    const matchesStatus = !filterStatus || p.paymentStatus === filterStatus;
    const matchesType = !filterType || p.referenceType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // ---------- UI ----------
  const StatCard = ({ icon: Icon, title, value, gradient }) => (
    <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 shadow-lg text-white`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">{title}</h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBackToDashboard}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors px-4 py-2 bg-white/80 rounded-xl shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="bg-white/90 rounded-2xl px-4 py-2 shadow-lg flex items-center space-x-4">
            <div className="text-right">
              <span className="text-sm text-gray-600">Total Payouts: </span>
              <span className="font-bold text-blue-600">{stats.totalPayouts}</span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="text-right">
              <span className="text-sm text-gray-600">Total Amount: </span>
              <span className="font-bold text-green-600">Rs. {(stats.totalAmount / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        </div>

        {/* Glassy Header Card */}
        <div className="bg-gradient-to-r from-blue-400/20 to-indigo-300/20 backdrop-blur-2xl rounded-3xl p-8 mb-10 shadow-2xl border border-white/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/30 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2 text-gray-800">
                  Delivery Payout Management
                </h1>
                <p className="text-lg text-gray-600">
                  Manage maintenance and emergency payouts for your fleet
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <StatCard
                icon={BanknotesIcon}
                title="Total Payouts"
                value={stats.totalPayouts}
                gradient="from-blue-500 to-blue-600"
              />
              <StatCard
                icon={CurrencyDollarIcon}
                title="Total Amount"
                value={`Rs. ${(stats.totalAmount / 1000000).toFixed(1)}M`}
                gradient="from-green-500 to-green-600"
              />
              <StatCard
                icon={WrenchIcon}
                title="Maintenance"
                value={stats.maintenancePayouts}
                gradient="from-amber-500 to-amber-600"
              />
              <StatCard
                icon={BoltIcon}
                title="Emergency"
                value={stats.emergencyPayouts}
                gradient="from-red-500 to-red-600"
              />
            </div>

            <div className="flex items-center space-x-4 bg-white/90 p-4 rounded-2xl shadow-sm">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <button
                onClick={() => { setSearchTerm(''); setFilterStatus(''); setFilterType(''); }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 shadow-md">
            <div className="flex items-center">
              <CheckBadgeIcon className="w-5 h-5 mr-2" />
              {successMessage}
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-md">
            <div className="flex items-center">
              <XMarkIcon className="w-5 h-5 mr-2" />
              {errors.submit}
            </div>
          </div>
        )}

        {/* Form Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 mb-10 border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center text-gray-800">
              <BanknotesIcon className="w-6 h-6 mr-2" />
              {editingId ? 'Edit Payout Record' : 'Create New Payout Record'}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                New Record
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reference Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Payout Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'referenceType', value: 'Maintenance' } })}
                  className={`p-4 border rounded-xl text-center transition-all duration-200 ${
                    formData.referenceType === 'Maintenance'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <WrenchIcon className="w-6 h-6 mx-auto mb-2" />
                  <span>Maintenance</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'referenceType', value: 'Emergency' } })}
                  className={`p-4 border rounded-xl text-center transition-all duration-200 ${
                    formData.referenceType === 'Emergency'
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  <BoltIcon className="w-6 h-6 mx-auto mb-2" />
                  <span>Emergency</span>
                </button>
              </div>
              {errors.referenceType && <p className="text-red-500 text-xs mt-1">{errors.referenceType}</p>}
            </div>

            {/* Reference Record */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                {formData.referenceType} Record *
              </label>
              <select
                name="referenceId"
                value={formData.referenceId}
                onChange={handleChange}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.referenceId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select {formData.referenceType} Record</option>
                {getAvailableReferences().map(record => (
                  <option key={record._id} value={record._id}>
                    {formData.referenceType === 'Maintenance'
                      ? `Maintenance: ${record.description} - Rs. ${record.serviceCost}`
                      : `Emergency: ${record.description} - ${new Date(record.accidentDate).toLocaleDateString()}`
                    }
                  </option>
                ))}
              </select>
              {errors.referenceId && <p className="text-red-500 text-xs mt-1">{errors.referenceId}</p>}
              <button
                type="button"
                onClick={() => setShowReferenceDetails(!showReferenceDetails)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                {showReferenceDetails ? <EyeSlashIcon className="w-4 h-4 mr-1" /> : <EyeIcon className="w-4 h-4 mr-1" />}
                {showReferenceDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            {/* Vehicle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <TruckIcon className="w-4 h-4 mr-2" />
                Vehicle *
              </label>
              <select
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.vehicle ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                  </option>
                ))}
              </select>
              {errors.vehicle && <p className="text-red-500 text-xs mt-1">{errors.vehicle}</p>}
            </div>

            {/* Payout Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Payout Date *
              </label>
              <input
                type="date"
                name="payoutDate"
                value={formData.payoutDate}
                onChange={handleChange}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.payoutDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.payoutDate && <p className="text-red-500 text-xs mt-1">{errors.payoutDate}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                Amount (Rs.) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                step="0.01"
                min="0"
                placeholder="0.00"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {/* Approved By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Approved By</label>
              <input
                type="text"
                name="approvedBy"
                value={formData.approvedBy}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Name of approver"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Additional notes about this payout"
              />
            </div>

            {/* Reference Details */}
            {showReferenceDetails && formData.referenceId && (
              <div className="md:col-span-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Reference Details
                </h3>
                {formData.referenceType === 'Maintenance' && maintenanceRecords.find(m => m._id === formData.referenceId) && (
                  <div className="text-sm text-blue-700">
                    <p><strong>Description:</strong> {maintenanceRecords.find(m => m._id === formData.referenceId)?.description}</p>
                    <p><strong>Service Cost:</strong> Rs. {maintenanceRecords.find(m => m._id === formData.referenceId)?.serviceCost}</p>
                    <p><strong>Service Date:</strong> {new Date(maintenanceRecords.find(m => m._id === formData.referenceId)?.serviceDate).toLocaleDateString()}</p>
                  </div>
                )}
                {formData.referenceType === 'Emergency' && emergencyRecords.find(e => e._id === formData.referenceId) && (
                  <div className="text-sm text-blue-700">
                    <p><strong>Description:</strong> {emergencyRecords.find(e => e._id === formData.referenceId)?.description}</p>
                    <p><strong>Accident Date:</strong> {new Date(emergencyRecords.find(e => e._id === formData.referenceId)?.accidentDate).toLocaleDateString()}</p>
                    <p><strong>Driver:</strong> {emergencyRecords.find(e => e._id === formData.referenceId)?.driver?.name || 'N/A'}</p>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="md:col-span-2 flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={resetForm} 
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
              >
                <XMarkIcon className="w-5 h-5 mr-2" />
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center disabled:opacity-50"
              >
                {isLoading ? (
                  <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                ) : editingId ? (
                  <PencilIcon className="w-5 h-5 mr-2" />
                ) : (
                  <PlusIcon className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Processing...' : (editingId ? 'Update Payout' : 'Create Payout')}
              </button>
            </div>
          </form>
        </div>

        {/* Payout Records Table */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center text-gray-800">
              <ChartBarIcon className="w-6 h-6 mr-2" />
              Payout Records
              <span className="ml-3 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {filteredPayouts.length} records
              </span>
            </h2>
            <div className="text-sm text-gray-500">
              {searchTerm && `Search: "${searchTerm}"`}
              {searchTerm && filterStatus && ' • '}
              {filterStatus && `Status: ${filterStatus}`}
              {filterStatus && filterType && ' • '}
              {filterType && `Type: ${filterType}`}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <ArrowPathIcon className="w-8 h-8 mx-auto animate-spin text-blue-600" />
              <p className="text-gray-500 mt-2">Loading payout records...</p>
            </div>
          ) : filteredPayouts.length === 0 ? (
            <div className="text-center py-12">
              <BanknotesIcon className="w-16 h-16 mx-auto text-gray-300" />
              <p className="text-gray-500 mt-4">
                {searchTerm || filterStatus || filterType ? 'No matching records found' : 'No payout records found'}
              </p>
              {(searchTerm || filterStatus || filterType) && (
                <button
                  onClick={() => { setSearchTerm(''); setFilterStatus(''); setFilterType(''); }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayouts.map(payout => (
                    <tr key={payout._id} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payout.referenceType === 'Maintenance' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payout.referenceType === 'Maintenance' ? (
                            <WrenchIcon className="w-3 h-3 mr-1" />
                          ) : (
                            <BoltIcon className="w-3 h-3 mr-1" />
                          )}
                          {payout.referenceType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payout.vehicle?.make} {payout.vehicle?.model}
                        </div>
                        <div className="text-sm text-gray-500">{payout.vehicle?.licensePlate}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {getReferenceDetails(payout)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(payout.payoutDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        Rs. {parseFloat(payout.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payout.paymentStatus)}`}>
                          {payout.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleEdit(payout)}
                            className="text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                          >
                            <PencilIcon className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(payout._id)}
                            className="text-red-600 hover:text-red-800 flex items-center transition-colors"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryPayoutForm;