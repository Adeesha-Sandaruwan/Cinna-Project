import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const FinancialReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [formData, setFormData] = useState({
    Period: '',
    Total_Income: '',
    Total_Expenses: '',
    Supplier: false,
    Salary: false,
    Emergency: false
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [financialData, setFinancialData] = useState({
    calculatedTotals: {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      breakdown: { salaryTotal: 0, supplierTotal: 0, deliveryTotal: 0 }
    }
  });
  const [chartType, setChartType] = useState('bar');
  const API_BASE_URL = 'http://localhost:5000/api';
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => { fetchReports(); fetchFinancialData(); }, []);

  // Fetch all reports
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/financial-reports`);
      setReports(response.data);
    } catch (error) {
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch summary from backend (no dates needed)
  const fetchFinancialData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/financial-reports/data/calculations`);
      setFinancialData(prev => ({
        ...prev,
        calculatedTotals: response.data.calculatedTotals
      }));
      return response.data.calculatedTotals;
    } catch (error) {
      const fallbackData = {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        breakdown: { salaryTotal: 0, supplierTotal: 0, deliveryTotal: 0 }
      };
      setFinancialData(prev => ({
        ...prev,
        calculatedTotals: fallbackData
      }));
      return fallbackData;
    }
  };

  const calculateTotalIncome = () => financialData.calculatedTotals?.totalIncome || 0;
  const calculateTotalExpenses = () => financialData.calculatedTotals?.totalExpenses || 0;

  // Form input handle
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Validate only required fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.Period) newErrors.Period = 'Period is required';
    if (!formData.Total_Income || formData.Total_Income < 0) newErrors.Total_Income = 'Valid total income is required';
    if (!formData.Total_Expenses || formData.Total_Expenses < 0) newErrors.Total_Expenses = 'Valid total expenses is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form (create or edit)
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
      setErrors({ submit: error.response?.data?.message || 'Error saving financial report' });
    } finally {
      setIsLoading(false);
    }
  };

  // Edit mode
  const handleEdit = (report) => {
    setFormData({
      Period: report.Period,
      Total_Income: report.Total_Income,
      Total_Expenses: report.Total_Expenses,
      Supplier: report.Supplier || false,
      Salary: report.Salary || false,
      Emergency: report.Emergency || false
    });
    setEditingId(report._id);
    setActiveTab('form');
  };

  // Delete mode
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this financial report?')) return;
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/financial-reports/${id}`);
      setSuccessMessage('Financial report deleted successfully!');
      fetchReports();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Error deleting financial report' });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      Period: '',
      Total_Income: '',
      Total_Expenses: '',
      Supplier: false,
      Salary: false,
      Emergency: false
    });
    setEditingId(null);
    setErrors({});
    setFinancialData(prev => ({
      ...prev,
      calculatedTotals: {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        breakdown: { salaryTotal: 0, supplierTotal: 0, deliveryTotal: 0 }
      }
    }));
  };

  // Filtering
  const filteredReports = reports.filter(report =>
    filterPeriod ? report.Period.includes(filterPeriod) : true
  );

  // Financial summary across all reports
  const financialSummary = {
    totalIncome: reports.reduce((sum, report) => sum + (report.Total_Income || 0), 0),
    totalExpenses: reports.reduce((sum, report) => sum + (report.Total_Expenses || 0), 0),
    netBalance: reports.reduce((sum, report) => sum + ((report.Total_Income || 0) - (report.Total_Expenses || 0)), 0),
    profitCount: reports.filter(report => (report.Total_Income || 0) > (report.Total_Expenses || 0)).length,
    lossCount: reports.filter(report => (report.Total_Income || 0) <= (report.Total_Expenses || 0)).length
  };

  // Chart data prep
  const prepareChartData = () =>
    reports.map(report => ({
      period: report.Period,
      income: report.Total_Income || 0,
      expenses: report.Total_Expenses || 0,
      net: (report.Total_Income || 0) - (report.Total_Expenses || 0)
    })).sort((a, b) => a.period.localeCompare(b.period));

  const prepareExpenseBreakdown = () => {
    const breakdown = financialData.calculatedTotals?.breakdown || {};
    return [
      { name: 'Salaries', value: breakdown.salaryTotal || 0 },
      { name: 'Supplier Payments', value: breakdown.supplierTotal || 0 },
      { name: 'Delivery Payouts', value: breakdown.deliveryTotal || 0 }
    ];
  };

  const formatCurrency = (amount) => `Rs ${amount.toLocaleString()}`;

  // PDF Export
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Financial Report', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Financial Summary', 14, 35);
    doc.setFontSize(10);
    doc.text(`Total Income: ${formatCurrency(financialSummary.totalIncome)}`, 20, 45);
    doc.text(`Total Expenses: ${formatCurrency(financialSummary.totalExpenses)}`, 20, 55);
    doc.text(`Net Balance: ${formatCurrency(financialSummary.netBalance)}`, 20, 65);
    const tableData = filteredReports.map(report => [
      report.Period,
      formatCurrency(report.Total_Income || 0),
      formatCurrency(report.Total_Expenses || 0),
      formatCurrency((report.Total_Income || 0) - (report.Total_Expenses || 0)),
      (report.Total_Income || 0) > (report.Total_Expenses || 0) ? 'Profit' : 'Loss'
    ]);
    doc.autoTable({
      startY: 75,
      head: [['Period', 'Income', 'Expenses', 'Net Balance', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    doc.save('financial-report.pdf');
  };

  // Data visualization
  const renderChart = () => {
    const data = prepareChartData();
    const expenseData = prepareExpenseBreakdown();
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value), '']} />
              <Legend />
              <Bar dataKey="income" fill="#8884d8" name="Income" />
              <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value), '']} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#8884d8" name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Expenses" />
              <Line type="monotone" dataKey="net" stroke="#ff7300" name="Net Balance" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%" cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(value), '']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Financial Report Management</h1>
          <div className="flex space-x-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <span className="text-sm font-medium text-gray-700">Total Reports: {reports.length}</span>
            </div>
            <button onClick={generatePDF} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
          </div>
        </div>
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">{successMessage}</div>
        )}
        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{errors.submit}</div>
        )}
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(financialSummary.totalIncome)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(financialSummary.totalExpenses)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500">Net Balance</h3>
            <p className={`text-2xl font-bold ${financialSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} >
              {formatCurrency(financialSummary.netBalance)}
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
        {/* Calculation Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Automatic Financial Calculation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-700">Calculated Income</h3>
              <p className="text-2xl font-bold text-blue-800">{formatCurrency(calculateTotalIncome())}</p>
              <p className="text-xs text-gray-500 mt-1">System-wide</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-700">Calculated Expenses</h3>
              <p className="text-2xl font-bold text-red-800">{formatCurrency(calculateTotalExpenses())}</p>
              <div className="text-xs text-gray-500 mt-1 flex flex-col">
                <span>Salaries: {formatCurrency(financialData.calculatedTotals.breakdown.salaryTotal)}</span>
                <span>Suppliers: {formatCurrency(financialData.calculatedTotals.breakdown.supplierTotal)}</span>
                <span>Delivery: {formatCurrency(financialData.calculatedTotals.breakdown.deliveryTotal)}</span>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-700">Calculated Net</h3>
              <p className={`text-2xl font-bold ${calculateTotalIncome() - calculateTotalExpenses() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(calculateTotalIncome() - calculateTotalExpenses())}
              </p>
              <p className="text-xs text-gray-500 mt-1">System-wide</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  Total_Income: calculateTotalIncome(),
                  Total_Expenses: calculateTotalExpenses()
                }));
                setSuccessMessage('Financial data auto-filled from calculations!');
                setTimeout(() => setSuccessMessage(''), 3000);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Auto-Fill Form
            </button>
          </div>
        </div>
        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Financial Visualization</h2>
            <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm" >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>
          {renderChart()}
        </div>
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button onClick={() => setActiveTab('form')}
                className={`py-4 px-6 text-center font-medium text-sm ${activeTab === 'form' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                {editingId ? 'Edit Report' : 'Create Report'}
              </button>
              <button onClick={() => setActiveTab('list')}
                className={`py-4 px-6 text-center font-medium text-sm ${activeTab === 'list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                View Reports
              </button>
            </nav>
          </div>
          <div className="p-6">
            {activeTab === 'form' ? (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">{editingId ? 'Edit Financial Report' : 'Create New Financial Report'}</h2>
                </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Income (Rs) *</label>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Expenses (Rs) *</label>
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
                    {isLoading ? 'Processing...' : editingId ? 'Update Report' : 'Create Report'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-700">Financial Reports</h2>
                  <input
                    type="text"
                    placeholder="Filter by period..."
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-500">Loading financial reports...</p>
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReports.map(report => (
                          <tr key={report._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{report.Period}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(report.Total_Income || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(report.Total_Expenses || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${((report.Total_Income || 0) - (report.Total_Expenses || 0)) >= 0
                                ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatCurrency((report.Total_Income || 0) - (report.Total_Expenses || 0))}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${((report.Total_Income || 0) > (report.Total_Expenses || 0))
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                                {(report.Total_Income || 0) > (report.Total_Expenses || 0) ? 'Profit' : 'Loss'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button onClick={() => handleEdit(report)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                Edit
                              </button>
                              <button onClick={() => handleDelete(report._id)} className="text-red-600 hover:text-red-900">
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
