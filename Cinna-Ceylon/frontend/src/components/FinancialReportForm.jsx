import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// FinancialReportManagement component handles financial data analysis and reporting
// Includes calculation, data fetching, filtering, charting, and PDF export logic
const FinancialReportManagement = () => {
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [financialData, setFinancialData] = useState({
    calculatedTotals: {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      breakdown: { salaryTotal: 0, supplierTotal: 0, deliveryTotal: 0, orderTotal: 0 }
    }
  });
  const [chartType, setChartType] = useState('bar');
  const [dataSource, setDataSource] = useState('all');
  const [timePeriod, setTimePeriod] = useState('thisMonth');
  const [filteredData, setFilteredData] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  
  const API_BASE_URL = 'http://localhost:5000/api';
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => { 
    fetchFinancialData();
  }, []);

  // Helper function to extract array from API response
  // Handles different API response formats
  const extractArrayFromResponse = (responseData) => {
    if (Array.isArray(responseData)) {
      return responseData;
    } else if (responseData && Array.isArray(responseData.docs)) {
      return responseData.docs;
    } else if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    } else if (responseData && typeof responseData === 'object') {
      // If it's an object with nested arrays, try to find the first array
      for (const key in responseData) {
        if (Array.isArray(responseData[key])) {
          return responseData[key];
        }
      }
    }
    // If it's a single object, wrap in array
    if (responseData && typeof responseData === 'object') {
      return [responseData];
    }
    return [];
  };

  // Fetch financial calculations for stat cards
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
        breakdown: { salaryTotal: 0, supplierTotal: 0, deliveryTotal: 0, orderTotal: 0 }
      };
      setFinancialData(prev => ({
        ...prev,
        calculatedTotals: fallbackData
      }));
      return fallbackData;
    }
  };

  // Get date field based on data type for charting/filtering
  const getDateField = (item, dataType) => {
    switch (dataType) {
      case 'salaries':
        // Prefer Month (format: YYYY-MM), fallback to createdAt
        if (item.Month) {
          // If Month is YYYY-MM, use first day of month
          const [year, month] = item.Month.split('-');
          return new Date(year, month - 1, 1).toISOString();
        }
        return item.createdAt || new Date().toISOString();
      case 'orders':
        // Prefer orderDate, fallback to createdAt
        if (item.orderDate) {
          return new Date(item.orderDate).toISOString();
        }
        return item.createdAt || new Date().toISOString();
      case 'supplierPayments':
        // Prefer Date (format: YYYY-MM-DD), fallback to createdAt
        if (item.Date) {
          return new Date(item.Date).toISOString();
        }
        return item.createdAt || new Date().toISOString();
      case 'deliveryPayouts':
        if (item.payoutDate) {
          return new Date(item.payoutDate).toISOString();
        }
        return item.createdAt || new Date().toISOString();
      default:
        return item.date || item.createdAt || new Date().toISOString();
    }
  };

  // Get amount field based on data type for charting/filtering
  const getAmountField = (item, dataType) => {
    switch (dataType) {
      case 'salaries':
        return item.Net_Salary || item.amount || 0;
      case 'orders':
        return item.total || item.amount || 0;
      case 'supplierPayments':
        return item.Net_Payment || item.Amount || item.amount || 0;
      case 'deliveryPayouts':
        return item.amount || 0;
      default:
        return item.amount || 0;
    }
  };

  // Get description based on data type for charting/filtering
  const getDescription = (item, dataType) => {
    switch (dataType) {
      case 'salaries':
        return `Salary - ${item.Emp_id || 'Employee'}`;
      case 'orders':
        return `Order - ${item._id || 'Order'}`;
      case 'supplierPayments':
        return `Supplier Payment - ${item.Sup_id || 'Supplier'}`;
      case 'deliveryPayouts':
        return `Delivery Payout - ${item.referenceType || 'Payout'}`;
      default:
        return item.description || 'N/A';
    }
  };

  // Fetch and filter data based on selected data source and time period
  // Maps data to unified format for charting
  const fetchFilteredData = async () => {
    setIsLoading(true);
    setIsDataLoaded(false);
    setShowComparison(false);
    try {
      let endpoint = '';
      let dataType = dataSource;
      switch (dataSource) {
        case 'salaries':
          endpoint = `${API_BASE_URL}/salaries`;
          break;
        case 'orders':
          endpoint = `${API_BASE_URL}/orders`;
          break;
        case 'supplierPayments':
          endpoint = `${API_BASE_URL}/supplier-payments`;
          break;
        case 'deliveryPayouts':
          endpoint = `${API_BASE_URL}/delivery-payouts`;
          break;
        case 'all':
        default:
          await fetchAllData();
          return;
      }
      if (endpoint) {
        const response = await axios.get(endpoint);
        const dataArray = extractArrayFromResponse(response.data);
        // Map to unified format for charting
        const mapped = dataArray.map(item => ({
          ...item,
          type: dataType === 'salaries' ? 'Salary'
            : dataType === 'orders' ? 'Order'
            : dataType === 'supplierPayments' ? 'Supplier Payment'
            : dataType === 'deliveryPayouts' ? 'Delivery Payout'
            : 'Unknown',
          amount: getAmountField(item, dataType),
          date: getDateField(item, dataType),
          description: getDescription(item, dataType)
        }));
        const filtered = filterDataByTimePeriod(mapped, dataType);
        setFilteredData(filtered);
        setIsDataLoaded(true);
        setSuccessMessage(`Loaded ${filtered.length} records from ${dataSource}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error fetching filtered data:', error);
      setErrors({ submit: 'Error fetching data. Please try again.' });
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all data for the 'all' option (salaries, orders, supplier payments, delivery payouts)
  const fetchAllData = async () => {
    try {
      const [salariesRes, ordersRes, supplierPaymentsRes, deliveryPayoutsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/salaries`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/orders`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/supplier-payments`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/delivery-payouts`).catch(() => ({ data: [] }))
      ]);
      const salaries = extractArrayFromResponse(salariesRes.data).map(item => ({
        ...item,
        type: 'Salary',
        amount: getAmountField(item, 'salaries'),
        date: getDateField(item, 'salaries'),
        description: getDescription(item, 'salaries')
      }));
      const orders = extractArrayFromResponse(ordersRes.data).map(item => ({
        ...item,
        type: 'Order',
        amount: getAmountField(item, 'orders'),
        date: getDateField(item, 'orders'),
        description: getDescription(item, 'orders')
      }));
      const supplierPayments = extractArrayFromResponse(supplierPaymentsRes.data).map(item => ({
        ...item,
        type: 'Supplier Payment',
        amount: getAmountField(item, 'supplierPayments'),
        date: getDateField(item, 'supplierPayments'),
        description: getDescription(item, 'supplierPayments')
      }));
      const deliveryPayouts = extractArrayFromResponse(deliveryPayoutsRes.data).map(item => ({
        ...item,
        type: 'Delivery Payout',
        amount: getAmountField(item, 'deliveryPayouts'),
        date: getDateField(item, 'deliveryPayouts'),
        description: getDescription(item, 'deliveryPayouts')
      }));
      // Combine all data
      const allData = [
        ...salaries,
        ...orders,
        ...supplierPayments,
        ...deliveryPayouts
      ];
      const filtered = filterDataByTimePeriod(allData, 'all');
      setFilteredData(filtered);
      setIsDataLoaded(true);
      setSuccessMessage(`Loaded ${filtered.length} records from all sources`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error fetching all data:', error);
      setErrors({ submit: 'Error fetching data. Please try again.' });
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data by selected time period (thisMonth, lastMonth, last3Months, thisYear, all)
  const filterDataByTimePeriod = (data, dataType) => {
    const now = new Date();
    let startDate, endDate;

    // Set date range based on time period
    switch (timePeriod) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        // 'all' - no date filtering
        return data;
    }

    return data.filter(item => {
      try {
        const itemDate = new Date(getDateField(item, dataType));
        return itemDate >= startDate && itemDate <= endDate;
      } catch (error) {
        console.error('Error parsing date:', error);
        return false;
      }
    });
  };

  // Fetch comparison data (income vs expenses) for selected dataSource
  // Used for comparison chart
  const fetchComparisonData = async () => {
    setIsLoading(true);
    try {
      let orders = [];
      let expenses = [];
      if (dataSource === 'orders' || dataSource === 'all') {
        const ordersRes = await axios.get(`${API_BASE_URL}/orders`).catch(() => ({ data: [] }));
        orders = extractArrayFromResponse(ordersRes.data);
      }
      if (dataSource === 'salaries' || dataSource === 'all') {
        const salariesRes = await axios.get(`${API_BASE_URL}/salaries`).catch(() => ({ data: [] }));
        expenses = expenses.concat(extractArrayFromResponse(salariesRes.data));
      }
      if (dataSource === 'supplierPayments' || dataSource === 'all') {
        const suppRes = await axios.get(`${API_BASE_URL}/supplier-payments`).catch(() => ({ data: [] }));
        expenses = expenses.concat(extractArrayFromResponse(suppRes.data));
      }
      if (dataSource === 'deliveryPayouts' || dataSource === 'all') {
        const delRes = await axios.get(`${API_BASE_URL}/delivery-payouts`).catch(() => ({ data: [] }));
        expenses = expenses.concat(extractArrayFromResponse(delRes.data));
      }
      // Only compare selected fields
      const comparison = processComparisonData(orders, expenses);
      setComparisonData(comparison);
      setShowComparison(true);
      setSuccessMessage('Comparison data loaded successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      setErrors({ submit: 'Error loading comparison data' });
    } finally {
      setIsLoading(false);
    }
  };

  // Process data for income vs expenses comparison (group by month)
  const processComparisonData = (orders, expenses) => {
    const monthData = {};
    
    // Process income (orders)
    orders.forEach(order => {
      try {
        const orderDate = new Date(order.createdAt || order.orderDate);
        const monthYear = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthName = orderDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (!monthData[monthYear]) {
          monthData[monthYear] = {
            period: monthName,
            income: 0,
            expenses: 0,
            net: 0
          };
        }
        
        monthData[monthYear].income += order.total || order.amount || 0;
      } catch (error) {
        console.error('Error processing order data:', error);
      }
    });
    
    // Process expenses
    expenses.forEach(expense => {
      try {
        const expenseDate = new Date(expense.date || expense.createdAt || expense.paymentDate);
        const monthYear = `${expenseDate.getFullYear()}-${(expenseDate.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthName = expenseDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (!monthData[monthYear]) {
          monthData[monthYear] = {
            period: monthName,
            income: 0,
            expenses: 0,
            net: 0
          };
        }
        
        monthData[monthYear].expenses += expense.amount || expense.Net_Payment || expense.Net_Salary || 0;
      } catch (error) {
        console.error('Error processing expense data:', error);
      }
    });
    
    // Calculate net values and convert to array
    return Object.values(monthData)
      .map(item => ({
        ...item,
        net: item.income - item.expenses
      }))
      .sort((a, b) => {
        // Sort by date
        const [aMonth, aYear] = a.period.split(' ');
        const [bMonth, bYear] = b.period.split(' ');
        return new Date(`${aMonth} 1, ${aYear}`) - new Date(`${bMonth} 1, ${bYear}`);
      });
  };

  // Calculate totals for the filtered data (total, by type, orders only)
  const calculateDataTotals = () => {
    const totals = {
      total: 0,
      byType: {}
    };
    // For total income, use sum of orders only
    const ordersTotal = filteredData
      .filter(item => item.type === 'Order')
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    filteredData.forEach(item => {
      const amount = item.amount || 0;
      totals.total += amount;
      const type = item.type || 'Unknown';
      if (!totals.byType[type]) {
        totals.byType[type] = 0;
      }
      totals.byType[type] += amount;
    });
    totals.ordersTotal = ordersTotal;
    return totals;
  };

  // Prepare data for charts (bar, line, pie)
  const prepareChartData = () => {
    if (filteredData.length === 0) return [];
    
    // Group by period for line/bar charts
    if (chartType === 'bar' || chartType === 'line') {
      const groupedData = {};
      
      filteredData.forEach(item => {
        try {
          const itemDate = new Date(item.date);
          const period = itemDate.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          });
          
          if (!groupedData[period]) {
            groupedData[period] = {
              period: period,
              total: 0
            };
          }
          
          groupedData[period].total += item.amount || 0;
          
          // Add by type for stacked charts
          const type = item.type || 'Unknown';
          if (!groupedData[period][type]) {
            groupedData[period][type] = 0;
          }
          groupedData[period][type] += item.amount || 0;
        } catch (error) {
          console.error('Error processing item for chart:', error);
        }
      });
      
      return Object.values(groupedData).sort((a, b) => 
        new Date(a.period) - new Date(b.period)
      );
    }
    
    // For pie chart, group by type
    if (chartType === 'pie') {
      const typeData = {};
      
      filteredData.forEach(item => {
        const type = item.type || 'Unknown';
        if (!typeData[type]) {
          typeData[type] = 0;
        }
        typeData[type] += item.amount || 0;
      });
      
      return Object.entries(typeData).map(([name, value]) => ({
        name,
        value
      }));
    }
    
    return [];
  };

  const formatCurrency = (amount) => `Rs ${amount?.toLocaleString() || '0'}`;

  // PDF Export with filtered data and summary
  const generatePDF = () => {
    if (filteredData.length === 0) {
      setErrors({ submit: 'No data to export. Please load data first.' });
      return;
    }

    const doc = new jsPDF();
    const totals = calculateDataTotals();
    
    doc.setFontSize(20);
    doc.text('Financial Data Report', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
    
    // Add filter information
    doc.setFontSize(14);
    doc.text('Filter Criteria', 14, 35);
    doc.setFontSize(10);
    doc.text(`Data Source: ${dataSource === 'all' ? 'All Sources' : dataSource}`, 20, 45);
    doc.text(`Time Period: ${timePeriod}`, 20, 55);
    
    // Add summary
    doc.setFontSize(14);
    doc.text('Financial Summary', 14, 70);
    doc.setFontSize(10);
    doc.text(`Total Amount: ${formatCurrency(totals.total)}`, 20, 80);
    
    let yPosition = 90;
    Object.entries(totals.byType).forEach(([type, amount]) => {
      doc.text(`${type}: ${formatCurrency(amount)}`, 20, yPosition);
      yPosition += 10;
    });
    
    // Add data table
    const tableData = filteredData.map(item => [
      new Date(item.date).toLocaleDateString(),
      item.type || 'Unknown',
      item.description || 'N/A',
      formatCurrency(item.amount || 0)
    ]);
    
    autoTable(doc, {
      startY: yPosition + 10,
      head: [['Date', 'Type', 'Description', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.save('financial-data-report.pdf');
  };

  // Data visualization: renders chart based on chartType and data
  const renderChart = () => {
    if (showComparison && comparisonData.length > 0) {
      return renderComparisonChart();
    }
    
    const data = prepareChartData();
    
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No data available for the selected filters</p>
        </div>
      );
    }

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
              <Bar dataKey="total" fill="#8884d8" name="Total Amount" />
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
              <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Amount" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%" cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
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

  // Render comparison chart (income vs expenses)
  const renderComparisonChart = () => {
    if (comparisonData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No comparison data available</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={comparisonData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip formatter={(value) => [formatCurrency(value), '']} />
          <Legend />
          <Bar dataKey="income" fill="#4CAF50" name="Income" />
          <Bar dataKey="expenses" fill="#F44336" name="Expenses" />
          <Bar dataKey="net" fill="#2196F3" name="Net" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render data totals for stat cards and summary
  const renderDataTotals = () => {
    if (showComparison && comparisonData.length > 0) {
      return renderComparisonTotals();
    }
    
    if (filteredData.length === 0) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-500">No data loaded. Select filters and click "Load Data"</p>
        </div>
      );
    }

    const totals = calculateDataTotals();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500">Total</h3>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(totals.total)}</p>
          <p className="text-xs text-gray-500 mt-1">{filteredData.length} records</p>
        </div>
        
        {Object.entries(totals.byType).map(([type, amount], index) => (
          <div key={type} className="bg-white rounded-xl p-4 shadow-md border-l-4" 
               style={{ borderLeftColor: COLORS[index % COLORS.length] }}>
            <h3 className="text-sm font-medium text-gray-500">{type}</h3>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(amount)}</p>
          </div>
        ))}
      </div>
    );
  };

  // Render comparison totals for income vs expenses
  const renderComparisonTotals = () => {
    const incomeTotal = comparisonData.reduce((sum, item) => sum + (item.income || 0), 0);
    const expensesTotal = comparisonData.reduce((sum, item) => sum + (item.expenses || 0), 0);
    const netTotal = incomeTotal - expensesTotal;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(incomeTotal)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(expensesTotal)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500">Net Balance</h3>
          <p className={`text-2xl font-bold ${netTotal >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(netTotal)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 pb-12">
      <div className="max-w-screen-2xl mx-auto px-2 md:px-8">
        {/* Modern Header - Wider and Enhanced */}
        <div className="flex flex-col md:flex-row items-center py-8 mb-8 bg-gradient-to-r from-amber-400 via-orange-300 to-amber-500 rounded-2xl shadow-xl relative w-full">
          <div className="flex flex-col md:flex-row items-center w-full">
            <div className="flex gap-4 items-center mb-4 md:mb-0 md:mr-6">
              <button
                onClick={() => window.location.href = '/financial-officer-dashboard'}
                className="px-5 py-2 bg-white text-amber-600 font-semibold rounded-xl shadow-lg hover:bg-amber-100 transition-all border-2 border-amber-400 flex items-center text-base"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <div className="bg-white rounded-full p-3 shadow-lg animate-bounce">
                <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3v1a3 3 0 006 0v-1c0-1.657-1.343-3-3-3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19v2m0-2a7 7 0 100-14 7 7 0 000 14z" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg tracking-tight">Financial Data Analysis</h1>
            </div>
            <div className="flex gap-4 items-center md:ml-auto">
              <button
                onClick={generatePDF}
                disabled={!isDataLoaded || filteredData.length === 0}
                className="px-5 py-2 bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center text-base transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
              <div className="bg-white rounded-lg px-4 py-2 shadow-md text-amber-700 font-semibold text-sm">
                {isDataLoaded ? `${filteredData.length} records loaded` : 'No data loaded'}
              </div>
            </div>
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
        
        {/* Automatic Financial Calculation Section - Enhanced */}
        <div className="bg-gradient-to-br from-white via-amber-50 to-orange-100 rounded-2xl shadow-lg p-6 mb-8 border border-amber-200">
          <h2 className="text-2xl font-bold text-amber-700 mb-6 tracking-tight flex items-center gap-2">
            <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
            Automatic Financial Calculation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-100 p-3 rounded-lg shadow flex flex-col items-center">
              <h3 className="text-base font-semibold text-blue-700 mb-1">Total Income</h3>
              <p className="text-2xl font-bold text-blue-800 mb-1">
                {formatCurrency(financialData.calculatedTotals.totalIncome)}
              </p>
              <span className="text-xs text-gray-500">System-wide</span>
            </div>
            <div className="bg-red-100 p-3 rounded-lg shadow flex flex-col items-center">
              <h3 className="text-base font-semibold text-red-700 mb-1">Total Expenses</h3>
              <p className="text-2xl font-bold text-red-800 mb-1">
                {formatCurrency(financialData.calculatedTotals.totalExpenses)}
              </p>
              <span className="text-xs text-gray-500">System-wide</span>
            </div>
            <div className="bg-green-100 p-3 rounded-lg shadow flex flex-col items-center">
              <h3 className="text-base font-semibold text-green-700 mb-1">Net Balance</h3>
              <p className={`text-2xl font-bold ${
                financialData.calculatedTotals.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
              } mb-1`}>
                {formatCurrency(financialData.calculatedTotals.netBalance)}
              </p>
              <span className="text-xs text-gray-500">System-wide</span>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg shadow flex flex-col items-center">
              <h3 className="text-base font-semibold text-purple-700 mb-1">Breakdown</h3>
              <div className="text-xs text-gray-700 mt-1 text-center">
                <p>Salaries: <span className="font-bold text-purple-700">{formatCurrency(financialData.calculatedTotals.breakdown.salaryTotal)}</span></p>
                <p>Suppliers: <span className="font-bold text-purple-700">{formatCurrency(financialData.calculatedTotals.breakdown.supplierTotal)}</span></p>
                <p>Delivery: <span className="font-bold text-purple-700">{formatCurrency(financialData.calculatedTotals.breakdown.deliveryTotal)}</span></p>
                <p>Orders: <span className="font-bold text-purple-700">{formatCurrency(financialData.calculatedTotals.breakdown.orderTotal)}</span></p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Source Data Analysis Section - Enhanced */}
        <div className="bg-gradient-to-br from-white via-orange-50 to-amber-100 rounded-2xl shadow-lg p-6 mb-8 border border-orange-200">
          <h2 className="text-2xl font-bold text-orange-700 mb-6 tracking-tight flex items-center gap-2">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v2a4 4 0 004 4h0a4 4 0 004-4V7" />
            </svg>
            Source Data Analysis
          </h2>
          {/* Filters - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-base font-semibold text-orange-700 mb-1">Data Source</label>
              <select 
                value={dataSource} 
                onChange={(e) => setDataSource(e.target.value)}
                className="w-full p-2 border border-orange-300 rounded-lg text-base focus:ring-2 focus:ring-orange-400"
              >
                <option value="all">All Sources</option>
                <option value="salaries">Salaries</option>
                <option value="orders">Orders</option>
                <option value="supplierPayments">Supplier Payments</option>
                <option value="deliveryPayouts">Delivery Payouts</option>
              </select>
            </div>
            <div>
              <label className="block text-base font-semibold text-orange-700 mb-1">Time Period</label>
              <select 
                value={timePeriod} 
                onChange={(e) => setTimePeriod(e.target.value)}
                className="w-full p-2 border border-orange-300 rounded-lg text-base focus:ring-2 focus:ring-orange-400"
              >
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="last3Months">Last 3 Months</option>
                <option value="thisYear">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div className="flex space-x-2 items-end">
              <button
                onClick={fetchFilteredData}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-base font-semibold"
              >
                {isLoading ? 'Loading...' : 'Load Data'}
              </button>
              <button
                onClick={fetchComparisonData}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-base font-semibold"
              >
                {isLoading ? 'Loading...' : 'Compare'}
              </button>
            </div>
          </div>
          {/* Totals - Enhanced */}
          <div className="mb-6">
            {renderDataTotals()}
          </div>
          {/* Chart - Enhanced */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-2">
            <h3 className="text-lg font-bold text-orange-700">
              {showComparison ? 'Income vs Expenses Comparison' : 'Data Visualization'}
            </h3>
            <select 
              value={chartType} 
              onChange={(e) => setChartType(e.target.value)} 
              className="p-2 border border-orange-300 rounded-lg text-base focus:ring-2 focus:ring-orange-400" 
            >
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            {renderChart()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReportManagement;