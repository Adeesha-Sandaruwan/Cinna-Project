import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentArrowDownIcon,
  CalculatorIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckBadgeIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';


const COLORS = {
  PRIMARY: "#2A4D6E",
  SECONDARY: "#4A7B9D",
  ACCENT: "#FF9F43",
  LIGHT: "#F8F9FC",
  SUCCESS: "#10B981",
  WARNING: "#F59E0B",
  ERROR: "#EF4444",
  TEXT: "#1F2937",
  TEXT_LIGHT: "#6B7280"
};


const SupPaymentManagement = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    Sup_id: '',
    Date: new Date().toISOString().split('T')[0],
    Amount: '',
    Tax: '',
    Net_Payment: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalPayments: 0,
    averagePayment: 0,
    thisMonthRecords: 0,
    thisMonthTotal: 0
  });


  const API_BASE_URL = 'http://localhost:5000/api';


  useEffect(() => {
    fetchPayments();
    fetchSuppliers();
  }, []);


  useEffect(() => {
    calculateStats();
  }, [payments]);


  /**
   * Fetches all supplier payment records from the backend and updates state.
   * Handles loading and error states.
   */
  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/supplier-payments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const sortedPayments = response.data.sort((a,b) => new Date(b.Date) - new Date(a.Date));
      setPayments(sortedPayments);
      setErrors({});
    } catch(error) {
      console.error('Error fetching supplier payments:', error);
      setErrors({fetch: 'Failed to fetch supplier payments. Please try again later.'});
    } finally {
      setIsLoading(false);
    }
  };


  /**
   * Fetches all users with userType 'supplier' for supplier selection in the form.
   * Handles loading and error states.
   */
  const fetchSuppliers = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // Make the request to get all users with the authorization header
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Filter only suppliers from the users
      const supplierUsers = response.data.filter(user => user.userType === 'supplier');
      setSuppliers(supplierUsers);
    } catch(error) {
      console.error('Error fetching suppliers:', error);
      setErrors({fetch: 'Failed to fetch suppliers. Please try again later.'});
    }
  };


  // Calculate stat card values for supplier payments
  // - totalRecords: total number of payments
  // - totalPayments: sum of all net payments
  // - averagePayment: average net payment
  // - thisMonthRecords: payments in current month
  // - thisMonthTotal: total net payments in current month
  /**
   * Calculates summary statistics for supplier payments:
   * - Total records, total payments, average payment, records and total for current month.
   * Updates the stats state for display in stat cards.
   */
  const calculateStats = () => {
    const totalRecords = payments.length;
    const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.Net_Payment || 0), 0);
    const averagePayment = totalRecords > 0 ? totalPayments / totalRecords : 0;
    const currentMonth = new Date().toISOString().slice(0,7);
    const thisMonthPayments = payments.filter(p => p.Date && p.Date.startsWith(currentMonth));
    const thisMonthRecords = thisMonthPayments.length;
    const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + parseFloat(p.Net_Payment || 0), 0);
    setStats({ totalRecords, totalPayments, averagePayment, thisMonthRecords, thisMonthTotal });
  };


  // Handle form field changes
  // - If Amount changes, recalculate tax and net payment
  /**
   * Handles changes to form fields.
   * If the Amount field changes, recalculates tax and net payment.
   * Clears errors for the edited field.
   */
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
    if(errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if(name === 'Amount') {
      calculateNetPayment(value);
    }
  };


  // Calculate tax and net payment for supplier payment
  // - Tax: 5% of amount
  // - Net_Payment: amount minus tax
  /**
   * Calculates tax (5%) and net payment for the supplier payment form.
   * Updates the formData state with calculated values.
   */
  const calculateNetPayment = amount => {
    const amountValue = parseFloat(amount) || 0;
    const tax = amountValue * 0.05;
    const netPayment = amountValue - tax;
    setFormData(prev => ({
      ...prev,
      Tax: tax.toFixed(2),
      Net_Payment: netPayment.toFixed(2)
    }));
  };


  // Validate supplier payment form fields
  // --- Validation Logic ---
  // 1. Supplier selection required
  // 2. Date required, not in future, not before this month
  // 3. Amount required, must be positive number, up to 2 decimals
  /**
   * Validates the supplier payment form fields.
   * Checks supplier selection, date, and amount for correctness.
   * Returns true if valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    const selectedDate = new Date(formData.Date);

    // 1. Supplier selection required
    if(!formData.Sup_id) newErrors.Sup_id = 'Please select a supplier';

    // 2. Date validation
    if(!formData.Date) newErrors.Date = 'Please select a date';
    else if(selectedDate > today) newErrors.Date = 'Future dates are not allowed';
    else {
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      if(selectedDate < firstOfMonth) newErrors.Date = 'Date cannot be before this month';
    }

    // 3. Amount validation
    if(!formData.Amount) newErrors.Amount = 'Please enter an amount';
    else if(isNaN(formData.Amount) || Number(formData.Amount) <= 0) newErrors.Amount = 'Amount must be a number greater than 0';
    else if(!/^[0-9]+(\.[0-9]{1,2})?$/.test(formData.Amount)) newErrors.Amount = 'Amount must be a valid number (up to 2 decimals)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  /**
   * Handles form submission for creating or updating a supplier payment.
   * Validates the form, sends API request, and handles errors.
   */
  const handleSubmit = async e => {
    e.preventDefault();
    if(!validateForm()) return;
    setIsLoading(true);
    try {
      const submitData = {...formData, Sup_id: formData.Sup_id || null};
      if(editingId) {
        await axios.put(`${API_BASE_URL}/supplier-payments/${editingId}`, submitData);
        setSuccessMessage('Supplier payment updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/supplier-payments`, submitData);
        setSuccessMessage('Supplier payment created successfully!');
      }
      resetForm();
      fetchPayments();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch(error) {
      console.error('Error saving supplier payment:', error);
      setErrors({submit: error.response?.data?.error || 'Error saving supplier payment. Please try again.'});
    } finally {
      setIsLoading(false);
    }
  };


  const handleEdit = payment => {
    const paymentDate = new Date(payment.Date);
    const formattedDate = paymentDate.toISOString().split('T')[0];
    setFormData({
      Sup_id: payment.Sup_id?._id || '',
      Date: formattedDate,
      Amount: payment.Amount,
      Tax: payment.Tax,
      Net_Payment: payment.Net_Payment
    });
    setEditingId(payment._id);
    setErrors({});
    window.scrollTo({top: 0, behavior: 'smooth'});
  };


  const handleDelete = async id => {
    if(!window.confirm('Are you sure you want to delete this supplier payment? This action cannot be undone.')) return;
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/supplier-payments/${id}`);
      setSuccessMessage('Supplier payment deleted successfully!');
      fetchPayments();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch(error) {
      console.error('Error deleting supplier payment:', error);
      setErrors({submit: error.response?.data?.error || 'Error deleting supplier payment. Please try again.'});
    } finally {
      setIsLoading(false);
    }
  };


  const handleDownloadPaymentPDF = async paymentId => {
    try {
      const response = await axios.get(`${API_BASE_URL}/supplier-payments/${paymentId}/pdf`, {responseType: 'blob'});
      const blob = new Blob([response.data], {type: 'application/pdf'});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `supplier-payment-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch(error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

    // Send supplier payment PDF by email
    const handleSendEmail = async (paymentId) => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API_BASE_URL}/supplier-payments/${paymentId}/send-email`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSuccessMessage('Supplier payment email sent successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error sending supplier payment email:', error);
        setErrors({ submit: error.response?.data?.error || 'Failed to send supplier payment email' });
      } finally {
        setIsLoading(false);
      }
    };


  const resetForm = () => {
    setFormData({
      Sup_id: '',
      Date: new Date().toISOString().split('T')[0],
      Amount: '',
      Tax: '',
      Net_Payment: ''
    });
    setEditingId(null);
    setErrors({});
  };


  const filteredPayments = payments.filter(payment => {
    const term = (searchTerm || '').trim().toLowerCase();

    const sup = payment.Sup_id && typeof payment.Sup_id === 'object' ? payment.Sup_id : {};
    const username = (sup.username || '').toString().toLowerCase();
    const email = (sup.email || '').toString().toLowerCase();
    const amountStr = (payment.Amount || payment.Net_Payment || '').toString().toLowerCase();

    const matchesSearch = !term || (
      username.includes(term) ||
      email.includes(term) ||
      amountStr.includes(term)
    );

    let matchesDate = true;
    if (filterDate) {
      // Compare only the date part (YYYY-MM-DD)
      try {
        const paymentDateStr = payment.Date ? new Date(payment.Date).toISOString().split('T')[0] : '';
        matchesDate = paymentDateStr === filterDate;
      } catch (e) {
        matchesDate = false;
      }
    }
    return matchesSearch && matchesDate;
  });


  const StatCard = ({ icon: Icon, title, value, subtitle, color, iconBg }) => (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${iconBg}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold" style={{ color: COLORS.TEXT }}>{value}</span>
      </div>
      <h3 className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: COLORS.TEXT_LIGHT }}>{title}</h3>
      {subtitle && <p className="text-xs" style={{ color: COLORS.TEXT_LIGHT }}>{subtitle}</p>}
    </div>
  );


  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#f2e2bfff' }}>
      <div className="max-w-7xl mx-auto">


        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/financial-officer-dashboard')}
            className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ color: COLORS.PRIMARY, border: `1px solid ${COLORS.SECONDARY}20` }}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex items-center space-x-4" style={{ border: `1px solid ${COLORS.SECONDARY}20` }}>
            <div className="text-right">
              <span className="text-sm" style={{ color: COLORS.TEXT_LIGHT }}>Total Payments: </span>
              <span className="font-bold" style={{ color: COLORS.PRIMARY }}>{stats.totalRecords}</span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="text-right">
              <span className="text-sm" style={{ color: COLORS.TEXT_LIGHT }}>Total Paid: </span>
              <span className="font-bold" style={{ color: COLORS.SUCCESS }}>Rs. {stats.totalPayments.toLocaleString()}</span>
            </div>
          </div>
        </div>


        {/* Header Section with golden background */}
        <div className="rounded-2xl p-8 mb-8 shadow-md" style={{ backgroundColor: '#925d14ff', color: 'white' }}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Supplier Payment Management</h1>
            <p className="text-lg opacity-90">Manage and track all supplier payments</p>
          </div>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
            <StatCard icon={BanknotesIcon} title="Total Payments" value={stats.totalRecords} color={COLORS.PRIMARY} iconBg="bg-yellow-600" />
            <StatCard icon={CurrencyDollarIcon} title="Total Paid" value={`Rs. ${stats.totalPayments.toLocaleString()}`} color={COLORS.SUCCESS} iconBg="bg-green-500" />
            <StatCard icon={CalculatorIcon} title="Average Payment" value={`Rs. ${stats.averagePayment.toLocaleString()}`} color={COLORS.WARNING} iconBg="bg-amber-500" />
            <StatCard icon={CalendarIcon} title="This Month" value={stats.thisMonthRecords} subtitle={`Rs. ${stats.thisMonthTotal.toLocaleString()}`} color={COLORS.SECONDARY} iconBg="bg-purple-500" />
          </div>


          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-yellow-50 p-4 rounded-xl">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'rgba(27, 26, 26, 0.92)' }} />
              <input
                type="text"
                placeholder="Search suppliers, amounts..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#000000' }}
              />
            </div>


            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-yellow-600" />
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#000000' }}
              />
            </div>

            <button
              onClick={() => { setSearchTerm(''); setFilterDate(''); }}
              className="px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors text-sm font-medium"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: COLORS.TEXT }}
            >
              Clear Filters
            </button>
          </div>
        </div>


        {/* Messages */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center">
              <CheckBadgeIcon className="w-5 h-5 mr-2" />
              {successMessage}
            </div>
          </div>
        )}


        {errors.submit && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {errors.submit}
            </div>
          </div>
        )}


        {/* Form Section */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-md" style={{ border: `1px solid ${COLORS.SECONDARY}20` }}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supplier Field */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: COLORS.TEXT }}>
                <UserIcon className="w-4 h-4 mr-2" />Supplier <span className="text-red-600">*</span>
              </label>
              <select
                name="Sup_id"
                value={formData.Sup_id}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 ${errors.Sup_id ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.username} - {supplier.email}
                  </option>
                ))}
              </select>
              {errors.Sup_id && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                  {errors.Sup_id}
                </p>
              )}
            </div>

            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: COLORS.TEXT }}>
                <CalendarIcon className="w-4 h-4 mr-2" />Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                name="Date"
                value={formData.Date}
                max={new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 ${errors.Date ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.Date && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                  {errors.Date}
                </p>
              )}
            </div>

            {/* Amount Field */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: COLORS.TEXT }}>
                <CurrencyDollarIcon className="w-4 h-4 mr-2" />Amount (Rs) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="Amount"
                value={formData.Amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="10000000"
                placeholder="0.00"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 ${errors.Amount ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.Amount && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                  {errors.Amount}
                </p>
              )}
            </div>

            {/* Tax Field */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: COLORS.TEXT }}>
                <ReceiptPercentIcon className="w-4 h-4 mr-2" />Tax Deduction (Auto)
              </label>
              <input
                type="number"
                name="Tax"
                value={formData.Tax}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              />
              <p className="mt-1 text-xs" style={{ color: COLORS.TEXT_LIGHT }}>
                Tax Rate: 5% of Amount
              </p>
            </div>

            {/* Net Payment Field */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: COLORS.TEXT }}>
                <CreditCardIcon className="w-4 h-4 mr-2" />Net Payment (Auto)
              </label>
              <input
                type="number"
                name="Net_Payment"
                value={formData.Net_Payment}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              />
              <p className="mt-1 text-xs" style={{ color: COLORS.TEXT_LIGHT }}>
                Net Payment = Amount - Tax (5%)
              </p>
            </div>

            {/* Form Actions */}
            <div className="md:col-span-2 flex justify-end space-x-4 pt-6 border-t border-yellow-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 bg-yellow-200 rounded-lg hover:bg-yellow-300 transition-colors flex items-center text-sm font-medium"
                style={{ color: COLORS.TEXT }}
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: COLORS.PRIMARY }}
              >
                {isLoading ? (
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                ) : editingId ? (
                  <PencilIcon className="w-4 h-4 mr-2" />
                ) : (
                  <PlusIcon className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Processing...' : editingId ? 'Update Payment' : 'Create Payment'}
              </button>
            </div>
          </form>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl p-8 shadow-md" style={{ border: `1px solid ${COLORS.SECONDARY}20` }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center" style={{ color: COLORS.PRIMARY }}>
              <BanknotesIcon className="w-5 h-5 mr-2" />
              Supplier Payments
              <span className="ml-3 bg-yellow-100 text-yellow-900 px-2.5 py-0.5 rounded-full text-sm font-medium">{filteredPayments.length} records</span>
            </h2>
            <div className="text-sm" style={{ color: COLORS.TEXT_LIGHT }}>
              {searchTerm && `Search: "${searchTerm}"`}
              {searchTerm && filterDate && ' • '}
              {filterDate && `Date: ${filterDate}`}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <ArrowPathIcon className="w-8 h-8 mx-auto animate-spin" style={{ color: COLORS.PRIMARY }} />
              <p className="mt-2" style={{ color: COLORS.TEXT_LIGHT }}>Loading supplier payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <BanknotesIcon className="w-16 h-16 mx-auto" style={{ color: COLORS.TEXT_LIGHT }} />
              <p className="mt-4 text-lg" style={{ color: COLORS.TEXT_LIGHT }}>
                {searchTerm || filterDate ? 'No matching records found' : 'No supplier payments found'}
              </p>
              {(searchTerm || filterDate) && (
                <button onClick={() => { setSearchTerm(''); setFilterDate(''); }} className="mt-4 px-4 py-2 text-yellow-700 rounded-lg hover:shadow-md transition-all" style={{ backgroundColor: COLORS.PRIMARY }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-yellow-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-yellow-50">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.TEXT_LIGHT }}>Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.TEXT_LIGHT }}>Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.TEXT_LIGHT }}>Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.TEXT_LIGHT }}>Tax</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.TEXT_LIGHT }}>Net Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.TEXT_LIGHT }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-200">
                  {filteredPayments.map(payment => (
                    <tr key={payment._id} className="hover:bg-yellow-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-medium text-yellow-900">
                        {payment.Sup_id ? (
                          <div>
                            <div>{payment.Sup_id.username}</div>
                            <div className="text-xs text-gray-500">{payment.Sup_id.email}</div>
                          </div>
                        ) : 'No Supplier Assigned'}
                      </td>
                      <td className="px-6 py-4 text-sm text-yellow-800">{new Date(payment.Date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-yellow-900">Rs. {parseFloat(payment.Amount).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-yellow-900">Rs. {parseFloat(payment.Tax).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">Rs. {parseFloat(payment.Net_Payment).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <button onClick={() => handleEdit(payment)} className="text-yellow-700 hover:text-yellow-800 flex items-center text-sm transition-colors">
                            <PencilIcon className="w-4 h-4 mr-1" />Edit
                          </button>
                          <button onClick={() => handleDelete(payment._id)} className="text-red-600 hover:text-red-700 flex items-center text-sm transition-colors">
                            <TrashIcon className="w-4 h-4 mr-1" />Delete
                          </button>
                          <button onClick={() => handleDownloadPaymentPDF(payment._id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 flex items-center justify-center transition-colors">
                            <DocumentArrowDownIcon className="w-3 h-3 mr-1" />Download PDF
                          </button>
                           <button onClick={() => handleSendEmail(payment._id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center justify-center transition-colors">
                             <DocumentArrowDownIcon className="w-3 h-3 mr-1" />Send Email
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

export default SupPaymentManagement;
