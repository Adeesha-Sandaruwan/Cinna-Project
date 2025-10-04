import React, { useState, useEffect } from 'react';
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
  ClockIcon,
  BanknotesIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckBadgeIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#FCFBF8",
};

const SalaryForm = ({ onBackToDashboard }) => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    Emp_id: '',   
    Base_Salary: '',
    Bonus: '',
    Overtime: '',
    OT_Type: 'weekday',
    OT_Hours: 0,
    Tax: '',
    EPF: '',
    ETF: '',
    Leave_Deduction: '',
    Leave_Type: 'full_pay',
    No_Pay_Leave_Days: 0,
    Net_Salary: '',
    Month: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState({
    tax: false,
    overtime: false,
    leave: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalSalary: 0,
    averageSalary: 0,
    thisMonthRecords: 0
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  const handleDownloadPayslip = async (salaryId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/salaries/${salaryId}/payslip`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PaySlip_${salaryId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setErrors({ submit: 'Error downloading pay slip.' });
    }
  };

  useEffect(() => {
    fetchSalaries();
    fetchEmployees();
  }, []); // Removed salaries dependency to prevent infinite loop

  useEffect(() => {
    calculateStats();
  }, [salaries]); // Only calculate stats when salaries change

  const fetchSalaries = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/salaries`);
      setSalaries(response.data);
    } catch (error) {
      console.error('Error fetching salaries:', error);
      // Set empty array instead of showing error for better UX
      setSalaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const calculateStats = () => {
    const totalRecords = salaries.length;
    const totalSalary = salaries.reduce((sum, salary) => sum + parseFloat(salary.Net_Salary || 0), 0);
    const averageSalary = totalRecords > 0 ? totalSalary / totalRecords : 0;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const thisMonthRecords = salaries.filter(salary => salary.Month === currentMonth).length;

    setStats({
      totalRecords,
      totalSalary,
      averageSalary,
      thisMonthRecords
    });
  };

  const calculateTax = (grossSalary) => {
    let tax = 0;
    let taxBreakdown = [];
    
    if (grossSalary <= 100000) {
      taxBreakdown.push("First Rs. 100,000: Tax Free (0%)");
    } else if (grossSalary <= 150000) {
      const taxableAmount = grossSalary - 100000;
      tax = taxableAmount * 0.06;
      taxBreakdown.push("First Rs. 100,000: Tax Free (0%)");
      taxBreakdown.push(`Next Rs. ${taxableAmount.toLocaleString()}: 6% = Rs. ${tax.toFixed(2)}`);
    } else if (grossSalary <= 200000) {
      const firstTaxable = 50000;
      const secondTaxable = grossSalary - 150000;
      tax = (firstTaxable * 0.06) + (secondTaxable * 0.12);
      taxBreakdown.push("First Rs. 100,000: Tax Free (0%)");
      taxBreakdown.push(`Next Rs. 50,000: 6% = Rs. ${(firstTaxable * 0.06).toFixed(2)}`);
      taxBreakdown.push(`Next Rs. ${secondTaxable.toLocaleString()}: 12% = Rs. ${(secondTaxable * 0.12).toFixed(2)}`);
    } else {
      const firstTaxable = 50000;
      const secondTaxable = 50000;
      const thirdTaxable = grossSalary - 200000;
      tax = (firstTaxable * 0.06) + (secondTaxable * 0.12) + (thirdTaxable * 0.18);
      taxBreakdown.push("First Rs. 100,000: Tax Free (0%)");
      taxBreakdown.push(`Next Rs. 50,000: 6% = Rs. ${(firstTaxable * 0.06).toFixed(2)}`);
      taxBreakdown.push(`Next Rs. 50,000: 12% = Rs. ${(secondTaxable * 0.12).toFixed(2)}`);
      taxBreakdown.push(`Remaining Rs. ${thirdTaxable.toLocaleString()}: 18% = Rs. ${(thirdTaxable * 0.18).toFixed(2)}`);
    }
    
    return { tax: parseFloat(tax.toFixed(2)), breakdown: taxBreakdown };
  };

  const calculateLeaveDeduction = (baseSalary, leaveType, noPayLeaveDays) => {
    if (leaveType === 'full_pay') {
      return { deduction: 0, breakdown: ["Full pay leave: No deduction"] };
    } else {
      const dailyRate = baseSalary / 28;
      const deduction = dailyRate * noPayLeaveDays;
      return { 
        deduction: parseFloat(deduction.toFixed(2)), 
        breakdown: [
          `No-pay leave days: ${noPayLeaveDays}`,
          `Daily rate: Rs. ${dailyRate.toFixed(2)} (Base Salary / 28)`,
          `Deduction: Rs. ${deduction.toFixed(2)} (${noPayLeaveDays} days × ${dailyRate.toFixed(2)})`
        ]
      };
    }
  };

  const calculateOvertime = (baseSalary, otType, otHours) => {
    if (otHours <= 0) {
      return { overtime: 0, breakdown: ["No overtime hours"] };
    }
    
    const hourlyRate = baseSalary / 28 / 8;
    let otRateMultiplier = 1.0;
    let otTypeLabel = "Weekday";
    
    if (otType === 'weekend_holiday') {
      otRateMultiplier = 1.5;
      otTypeLabel = "Weekend/Holiday";
    }
    
    const overtime = hourlyRate * otHours * otRateMultiplier;
    
    return { 
      overtime: parseFloat(overtime.toFixed(2)), 
      breakdown: [
        `OT Type: ${otTypeLabel}`,
        `OT Hours: ${otHours}`,
        `Hourly Rate: Rs. ${hourlyRate.toFixed(2)} (Base Salary / 28 / 8)`,
        `OT Rate: ${otRateMultiplier}x normal rate`,
        `Overtime Pay: Rs. ${overtime.toFixed(2)} (${otHours} hours × ${hourlyRate.toFixed(2)} × ${otRateMultiplier})`
      ]
    };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (['Base_Salary', 'Bonus', 'OT_Type', 'OT_Hours', 'Leave_Type', 'No_Pay_Leave_Days'].includes(name)) {
      calculateAllDeductions({ ...formData, [name]: value });
    }
  };

  const calculateAllDeductions = (data) => {
    const base = parseFloat(data.Base_Salary) || 0;
    const bonus = parseFloat(data.Bonus) || 0;
    const otType = data.OT_Type;
    const otHours = parseInt(data.OT_Hours) || 0;
    const leaveType = data.Leave_Type;
    const noPayLeaveDays = parseInt(data.No_Pay_Leave_Days) || 0;

    const { overtime } = calculateOvertime(base, otType, otHours);
    const grossSalary = base + bonus + overtime;
    const { tax } = calculateTax(grossSalary);
    const epf = grossSalary * 0.08;
    const etf = grossSalary * 0.03;
    const { deduction: leaveDeduction } = calculateLeaveDeduction(base, leaveType, noPayLeaveDays);
    const netSalary = grossSalary - tax - epf - etf - leaveDeduction;

    setFormData(prev => ({
      ...prev,
      Overtime: overtime.toFixed(2),
      Tax: tax.toFixed(2),
      EPF: epf.toFixed(2),
      ETF: etf.toFixed(2),
      Leave_Deduction: leaveDeduction.toFixed(2),
      Net_Salary: netSalary.toFixed(2)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Base_Salary || formData.Base_Salary <= 0) newErrors.Base_Salary = 'Valid base salary is required';
    if (!formData.Month) newErrors.Month = 'Month is required';
    if (!formData.Net_Salary || formData.Net_Salary < 0) newErrors.Net_Salary = 'Net salary must be positive';
    if (formData.Leave_Type === 'no_pay' && (!formData.No_Pay_Leave_Days || formData.No_Pay_Leave_Days < 0)) {
      newErrors.No_Pay_Leave_Days = 'Valid number of no-pay leave days is required';
    }
    if (formData.OT_Hours < 0) {
      newErrors.OT_Hours = 'OT hours cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        Emp_id: formData.Emp_id || null
      };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/salaries/${editingId}`, submitData);
        setSuccessMessage('Salary record updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/salaries`, submitData);
        setSuccessMessage('Salary record created successfully!');
      }
      resetForm();
      fetchSalaries(); // Refresh the data after submission
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving salary:', error);
      setErrors({ submit: error.response?.data?.message || 'Error saving salary record' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (salary) => {
    setFormData({
      Emp_id: salary.Emp_id?._id || salary.Emp_id || '',
      Base_Salary: salary.Base_Salary,
      Bonus: salary.Bonus,
      Overtime: salary.Overtime,
      OT_Type: salary.OT_Type || 'weekday',
      OT_Hours: salary.OT_Hours || 0,
      Tax: salary.Tax,
      EPF: salary.EPF,
      ETF: salary.ETF,
      Leave_Deduction: salary.Leave_Deduction,
      Leave_Type: salary.Leave_Type || 'full_pay',
      No_Pay_Leave_Days: salary.No_Pay_Leave_Days || 0,
      Net_Salary: salary.Net_Salary,
      Month: salary.Month
    });
    setEditingId(salary._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this salary record?')) return;
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/salaries/${id}`);
      setSuccessMessage('Salary record deleted successfully!');
      fetchSalaries(); // Refresh the data after deletion
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting salary:', error);
      setErrors({ submit: error.response?.data?.message || 'Error deleting salary record' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      Emp_id: '',
      Base_Salary: '',
      Bonus: '',
      Overtime: '',
      OT_Type: 'weekday',
      OT_Hours: 0,
      Tax: '',
      EPF: '',
      ETF: '',
      Leave_Deduction: '',
      Leave_Type: 'full_pay',
      No_Pay_Leave_Days: 0,
      Net_Salary: '',
      Month: ''
    });
    setEditingId(null);
    setErrors({});
    setShowBreakdown({ tax: false, overtime: false, leave: false });
  };

  const baseSalary = parseFloat(formData.Base_Salary) || 0;
  const bonus = parseFloat(formData.Bonus) || 0;
  const overtime = parseFloat(formData.Overtime) || 0;
  const grossSalary = baseSalary + bonus + overtime;
  
  const taxBreakdown = calculateTax(grossSalary).breakdown;
  const leaveBreakdown = calculateLeaveDeduction(
    baseSalary, 
    formData.Leave_Type, 
    parseInt(formData.No_Pay_Leave_Days) || 0
  ).breakdown;
  const otBreakdown = calculateOvertime(
    baseSalary, 
    formData.OT_Type, 
    parseInt(formData.OT_Hours) || 0
  ).breakdown;

  const filteredSalaries = salaries.filter(salary => {
    const matchesSearch = salary.Emp_id?.EmpName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         salary.Month.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = !filterMonth || salary.Month === filterMonth;
    return matchesSearch && matchesMonth;
  });

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBackToDashboard}
            className="flex items-center text-amber-600 hover:text-amber-700 transition-colors px-4 py-2 bg-white/80 rounded-xl shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="bg-white/90 rounded-2xl px-4 py-2 shadow-lg flex items-center space-x-4">
            <div className="text-right">
              <span className="text-sm text-gray-600">Total Records: </span>
              <span className="font-bold text-amber-600">{stats.totalRecords}</span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="text-right">
              <span className="text-sm text-gray-600">Total Paid: </span>
              <span className="font-bold text-green-600">Rs. {(stats.totalSalary / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        </div>

        {/* Glassy Header Card */}
        <div className="bg-gradient-to-r from-amber-400/20 to-orange-300/20 backdrop-blur-2xl rounded-3xl p-8 mb-10 shadow-2xl border border-white/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200/30 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2" style={{ color: COLORS.DARK_SLATE }}>
                  Salary Management System
                </h1>
                <p className="text-lg text-gray-600">
                  Comprehensive payroll management for Cinna Ceylon
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <StatCard
                icon={BanknotesIcon}
                title="Total Records"
                value={stats.totalRecords}
                color="bg-amber-500"
              />
              <StatCard
                icon={CurrencyDollarIcon}
                title="Total Paid"
                value={`Rs. ${(stats.totalSalary / 1000000).toFixed(1)}M`}
                color="bg-green-500"
              />
              <StatCard
                icon={CalculatorIcon}
                title="Average Salary"
                value={`Rs. ${stats.averageSalary.toLocaleString()}`}
                color="bg-blue-500"
              />
              <StatCard
                icon={CalendarIcon}
                title="This Month"
                value={stats.thisMonthRecords}
                color="bg-purple-500"
              />
            </div>

            <div className="flex items-center space-x-4 bg-white/90 p-4 rounded-2xl shadow-sm">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees or months..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => { setSearchTerm(''); setFilterMonth(''); }}
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
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 mb-10 border border-amber-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center" style={{ color: COLORS.DARK_SLATE }}>
              <CalculatorIcon className="w-6 h-6 mr-2" />
              {editingId ? 'Edit Salary Record' : 'Create New Salary Record'}
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
            {/* Employee Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <UserIcon className="w-4 h-4 mr-2" />
                Employee (Optional)
              </label>
              <select
                name="Emp_id"
                value={formData.Emp_id}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Employee (Optional)</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.EmpName} - {emp.Position}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                Base Salary *
              </label>
              <input
                type="number"
                name="Base_Salary"
                value={formData.Base_Salary}
                onChange={handleChange}
                className={`w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                  errors.Base_Salary ? 'border-red-500' : 'border-gray-300'
                }`}
                step="0.01"
                min="0"
                placeholder="0.00"
              />
              {errors.Base_Salary && <p className="text-red-500 text-xs mt-1">{errors.Base_Salary}</p>}
            </div>

            {/* Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Month *
              </label>
              <input
                type="month"
                name="Month"
                value={formData.Month}
                onChange={handleChange}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                  errors.Month ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.Month && <p className="text-red-500 text-xs mt-1">{errors.Month}</p>}
            </div>

            {/* Bonus */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bonus</label>
              <input
                type="number"
                name="Bonus"
                value={formData.Bonus}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>

            {/* Overtime Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Type</label>
              <select
                name="OT_Type"
                value={formData.OT_Type}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              >
                <option value="weekday">Weekday</option>
                <option value="weekend_holiday">Weekend/Holiday</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">OT Hours</label>
              <input
                type="number"
                name="OT_Hours"
                value={formData.OT_Hours}
                onChange={handleChange}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                  errors.OT_Hours ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                max="100"
                placeholder="0"
              />
              {errors.OT_Hours && <p className="text-red-500 text-xs mt-1">{errors.OT_Hours}</p>}
            </div>

            {/* Overtime Pay */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Pay</label>
              <input
                type="number"
                name="Overtime"
                value={formData.Overtime}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowBreakdown(prev => ({ ...prev, overtime: !prev.overtime }))}
                className="mt-2 text-sm text-amber-600 hover:text-amber-700 flex items-center"
              >
                <ClockIcon className="w-4 h-4 mr-1" />
                {showBreakdown.overtime ? 'Hide Calculation' : 'Show Calculation'}
              </button>
              {showBreakdown.overtime && (
                <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="font-medium text-sm text-amber-800">Overtime Calculation:</p>
                  <ul className="list-disc pl-5 mt-1 text-xs text-amber-700">
                    {otBreakdown.map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Tax Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Deduction</label>
              <input
                type="number"
                name="Tax"
                value={formData.Tax}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowBreakdown(prev => ({ ...prev, tax: !prev.tax }))}
                className="mt-2 text-sm text-amber-600 hover:text-amber-700 flex items-center"
              >
                <CalculatorIcon className="w-4 h-4 mr-1" />
                {showBreakdown.tax ? 'Hide Tax Breakdown' : 'Show Tax Breakdown'}
              </button>
              {showBreakdown.tax && (
                <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="font-medium text-sm text-amber-800">Tax Calculation:</p>
                  <ul className="list-disc pl-5 mt-1 text-xs text-amber-700">
                    {taxBreakdown.map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-amber-600 font-medium">
                    Tax Brackets: 0-100k (0%), 100k-150k (6%), 150k-200k (12%), 200k+ (18%)
                  </p>
                </div>
              )}
            </div>

            {/* EPF & ETF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">EPF Deduction</label>
              <input
                type="number"
                name="EPF"
                value={formData.EPF}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50"
              />
              <p className="mt-1 text-xs text-gray-500">8% of Gross Salary</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ETF Deduction</label>
              <input
                type="number"
                name="ETF"
                value={formData.ETF}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50"
              />
              <p className="mt-1 text-xs text-gray-500">3% of Gross Salary</p>
            </div>

            {/* Leave Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
              <select
                name="Leave_Type"
                value={formData.Leave_Type}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              >
                <option value="full_pay">Full Pay Leave</option>
                <option value="no_pay">No Pay Leave</option>
              </select>
            </div>

            {formData.Leave_Type === 'no_pay' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No Pay Leave Days</label>
                <input
                  type="number"
                  name="No_Pay_Leave_Days"
                  value={formData.No_Pay_Leave_Days}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                    errors.No_Pay_Leave_Days ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  max="28"
                />
                {errors.No_Pay_Leave_Days && <p className="text-red-500 text-xs mt-1">{errors.No_Pay_Leave_Days}</p>}
            </div>
            )}

            {/* Leave Deduction */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Leave Deduction</label>
              <input
                type="number"
                name="Leave_Deduction"
                value={formData.Leave_Deduction}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50"
              />
              <button
                type="button"
                onClick={() => setShowBreakdown(prev => ({ ...prev, leave: !prev.leave }))}
                className="mt-2 text-sm text-amber-600 hover:text-amber-700 flex items-center"
              >
                <CalculatorIcon className="w-4 h-4 mr-1" />
                {showBreakdown.leave ? 'Hide Calculation' : 'Show Calculation'}
              </button>
              {showBreakdown.leave && (
                <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="font-medium text-sm text-amber-800">Leave Deduction:</p>
                  <ul className="list-disc pl-5 mt-1 text-xs text-amber-700">
                    {leaveBreakdown.map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Net Salary */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Net Salary *</label>
              <input
                type="number"
                name="Net_Salary"
                value={formData.Net_Salary}
                readOnly
                className={`w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                  errors.Net_Salary ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.Net_Salary && <p className="text-red-500 text-xs mt-1">{errors.Net_Salary}</p>}
            </div>

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
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center disabled:opacity-50"
              >
                {isLoading ? (
                  <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                ) : editingId ? (
                  <PencilIcon className="w-5 h-5 mr-2" />
                ) : (
                  <PlusIcon className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Processing...' : (editingId ? 'Update Salary' : 'Create Salary')}
              </button>
            </div>
          </form>
        </div>

        {/* Salary Records Table */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-amber-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center" style={{ color: COLORS.DARK_SLATE }}>
              <BanknotesIcon className="w-6 h-6 mr-2" />
              Salary Records
              <span className="ml-3 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                {filteredSalaries.length} records
              </span>
            </h2>
            <div className="text-sm text-gray-500">
              {searchTerm && `Search: "${searchTerm}"`}
              {searchTerm && filterMonth && ' • '}
              {filterMonth && `Month: ${filterMonth}`}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <ArrowPathIcon className="w-8 h-8 mx-auto animate-spin text-amber-600" />
              <p className="text-gray-500 mt-2">Loading salary records...</p>
            </div>
          ) : filteredSalaries.length === 0 ? (
            <div className="text-center py-12">
              <BanknotesIcon className="w-16 h-16 mx-auto text-gray-300" />
              <p className="text-gray-500 mt-4">
                {searchTerm || filterMonth ? 'No matching records found' : 'No salary records found'}
              </p>
              {(searchTerm || filterMonth) && (
                <button
                  onClick={() => { setSearchTerm(''); setFilterMonth(''); }}
                  className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OT Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSalaries.map(salary => (
                    <tr key={salary._id} className="hover:bg-amber-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {salary.Emp_id?.EmpName || salary.Emp_id || 'No Employee Assigned'}
                        </div>
                        <div className="text-sm text-gray-500">{salary.Emp_id?.Position || ''}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{salary.Month}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Rs. {parseFloat(salary.Base_Salary).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {salary.OT_Hours > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {salary.OT_Hours} hrs
                          </span>
                        ) : (
                          'No OT'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        Rs. {parseFloat(salary.Net_Salary).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {salary.Leave_Type === 'no_pay' ? (
                          <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            No Pay ({salary.No_Pay_Leave_Days} days)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Full Pay
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleEdit(salary)}
                            className="text-amber-600 hover:text-amber-800 flex items-center transition-colors"
                          >
                            <PencilIcon className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(salary._id)}
                            className="text-red-600 hover:text-red-800 flex items-center transition-colors"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                          <button
                            onClick={() => handleDownloadPayslip(salary._id)}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-lg shadow hover:shadow-lg transition-all duration-200 flex items-center justify-center text-xs"
                          >
                            <DocumentArrowDownIcon className="w-3 h-3 mr-1" />
                            Pay Slip
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

export default SalaryForm;