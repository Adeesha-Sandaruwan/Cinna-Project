import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FinancialReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [formData, setFormData] = useState({
    Period: '',
    Total_Income: '',
    Total_Expenses: '',
    Supplier: false,
    Salary: false,
    Emergency: false,
    Salary_ID: '',
    Pay_ID: '',
    DlPay_ID: '',
    Order_ID: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [filterPeriod, setFilterPeriod] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/financial-reports`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching financial reports:', error);
      // Fallback data for demonstration
      setReports([
        {
          _id: '1',
          Period: '2023-Q4',
          NetBalance: 15000,
          Total_Income: 50000,
          Total_Expenses: 35000,
          ProfitLoss: true,
          Supplier: true,
          Salary: true,
          Emergency: false,
          createdAt: new Date()
        },
        {
          _id: '2',
          Period: '2024-Q1',
          NetBalance: -5000,
          Total_Income: 45000,
          Total_Expenses: 50000,
          ProfitLoss: false,
          Supplier: true,
          Salary: false,
          Emergency: true,
          createdAt: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Period) newErrors.Period = 'Period is required';
    if (!formData.Total_Income || formData.Total_Income < 0) newErrors.Total_Income = 'Valid total income is required';
    if (!formData.Total_Expenses || formData.Total_Expenses < 0) newErrors.Total_Expenses = 'Valid total expenses is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/financial-reports/${editingId}`, formData);
        setSuccessMessage('Financial report updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/financial-reports`, formData);
        setSuccessMessage('Financial report created successfully!');
      }
      resetForm();
      fetchReports();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving financial report:', error);
      setErrors({ submit: error.response?.data?.message || 'Error saving financial report' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (report) => {
    setFormData({
      Period: report.Period,
      Total_Income: report.Total_Income,
      Total_Expenses: report.Total_Expenses,
      Supplier: report.Supplier || false,
      Salary: report.Salary || false,
      Emergency: report.Emergency || false,
      Salary_ID: report.Salary_ID || '',
      Pay_ID: report.Pay_ID || '',
      DlPay_ID: report.DlPay_ID || '',
      Order_ID: report.Order_ID || ''
    });
    setEditingId(report._id);
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this financial report?')) return;
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/financial-reports/${id}`);
      setSuccessMessage('Financial report deleted successfully!');
      fetchReports();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting financial report:', error);
      setErrors({ submit: error.response?.data?.message || 'Error deleting financial report' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      Period: '',
      Total_Income: '',
      Total_Expenses: '',
      Supplier: false,
      Salary: false,
      Emergency: false,
      Salary_ID: '',
      Pay_ID: '',
      DlPay_ID: '',
      Order_ID: ''
    });
    setEditingId(null);
    setErrors({});
  };

  const filteredReports = reports.filter(report => 
    filterPeriod ? report.Period.includes(filterPeriod) : true
  );

  const financialSummary = {
    totalIncome: reports.reduce((sum, report) => sum + (report.Total_Income || 0), 0),
    totalExpenses: reports.reduce((sum, report) => sum + (report.Total_Expenses || 0), 0),
    netBalance: reports.reduce((sum, report) => sum + (report.NetBalance || 0), 0),
    profitCount: reports.filter(report => report.ProfitLoss).length,
    lossCount: reports.filter(report => !report.ProfitLoss && report.NetBalance !== undefined).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Financial Report Management</h1>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <span className="text-sm font-medium text-gray-700">Total Reports: {reports.length}</span>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {errors.submit}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
            <p className="text-2xl font-bold text-gray-800">${financialSummary.totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <p className="text-2xl font-bold text-gray-800">${financialSummary.totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500">Net Balance</h3>
            <p className={`text-2xl font-bold ${financialSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${financialSummary.netBalance.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-400">
            <h3 className="text-sm font-medium text-gray-500">Profits</h3>
            <p className="text-2xl font-bold text-green-600">{financialSummary.profitCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-400">
            <h3 className="text-sm font-medium text-gray-500">Losses</h3>
            <p className="text-2xl font-bold text-red-600">{financialSummary.lossCount}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('form')}
                className={`py-4 px-6 text-center font-medium text-sm ${activeTab === 'form' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {editingId ? 'Edit Report' : 'Create Report'}
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`py-4 px-6 text-center font-medium text-sm ${activeTab === 'list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                View Reports
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'form' ? (
              /* Form */
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    {editingId ? 'Edit Financial Report' : 'Create New Financial Report'}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {editingId ? 'Update the financial report details below.' : 'Fill in the details to create a new financial report.'}
                  </p>
                </div>

                {/* Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period *</label>
                  <input
                    type="text"
                    name="Period"
                    value={formData.Period}
                    onChange={handleChange}
                    placeholder="e.g., 2023-Q4, 2024-Jan"
                    className={`w-full p-3 border rounded-lg ${errors.Period ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.Period && <p className="text-red-500 text-xs mt-1">{errors.Period}</p>}
                </div>

                {/* Total Income */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Income ($) *</label>
                  <input
                    type="number"
                    name="Total_Income"
                    value={formData.Total_Income}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg ${errors.Total_Income ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    step="0.01"
                    min="0"
                  />
                  {errors.Total_Income && <p className="text-red-500 text-xs mt-1">{errors.Total_Income}</p>}
                </div>

                {/* Total Expenses */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Expenses ($) *</label>
                  <input
                    type="number"
                    name="Total_Expenses"
                    value={formData.Total_Expenses}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg ${errors.Total_Expenses ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    step="0.01"
                    min="0"
                  />
                  {errors.Total_Expenses && <p className="text-red-500 text-xs mt-1">{errors.Total_Expenses}</p>}
                </div>

                {/* Checkboxes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Includes</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="Supplier"
                        checked={formData.Supplier}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Supplier Payments</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="Salary"
                        checked={formData.Salary}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Salary Data</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="Emergency"
                        checked={formData.Emergency}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Emergency Funds</span>
                    </label>
                  </div>
                </div>

                {/* Related IDs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary ID (Optional)</label>
                  <input
                    type="text"
                    name="Salary_ID"
                    value={formData.Salary_ID}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment ID (Optional)</label>
                  <input
                    type="text"
                    name="Pay_ID"
                    value={formData.Pay_ID}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Payout ID (Optional)</label>
                  <input
                    type="text"
                    name="DlPay_ID"
                    value={formData.DlPay_ID}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order ID (Optional)</label>
                  <input
                    type="text"
                    name="Order_ID"
                    value={formData.Order_ID}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={resetForm} 
                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : editingId ? 'Update Report' : 'Create Report'}
                  </button>
                </div>
              </form>
            ) : (
              /* Report List */
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-700">Financial Reports</h2>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Filter by period..."
                      value={filterPeriod}
                      onChange={(e) => setFilterPeriod(e.target.value)}
                      className="p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-500">Loading financial reports...</p>
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No financial reports</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new financial report.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Balance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Includes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReports.map(report => (
                          <tr key={report._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{report.Period}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(report.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${report.Total_Income?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${report.Total_Expenses?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${report.NetBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${report.NetBalance?.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${report.ProfitLoss ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {report.ProfitLoss ? 'Profit' : 'Loss'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-1">
                                {report.Supplier && (
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Supplier</span>
                                )}
                                {report.Salary && (
                                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Salary</span>
                                )}
                                {report.Emergency && (
                                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Emergency</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => handleEdit(report)} 
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(report._id)} 
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReportManagement;