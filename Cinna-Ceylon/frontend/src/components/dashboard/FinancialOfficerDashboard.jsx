import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Existing theme colors
const COLORS = {
  RICH_GOLD: "#c5a35a",
  DEEP_CINNAMON: "#CC7722",
  WARM_BEIGE: "#F5EFE6",
  CREAM: "#FFF9F0",
  DARK_SLATE: "#2d2d2d",
  SOFT_WHITE: "#FCFBF8",
};

const FinancialOfficerDashboard = () => {
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(null);

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Fetch notifications
  /**
   * Fetches notifications (announcements) for the financial officer from the backend.
   * Handles authentication, loading, and error states.
   */
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      if (!token) {
        console.log('No token found');
        setNotifError('Authentication required');
        return;
      }

      console.log('Fetching notifications...');
      const res = await axios.get('http://localhost:5000/api/announcements/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Notifications response:', res.data);
      
      if (res.data) {
        // No need to filter here - backend already handles proper targeting
        setNotifications(res.data);
        setNotifError(null);
      }
    } catch (err) {
      console.error('Notification fetch error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data
      });
      setNotifError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setNotifLoading(false);
    }
  };

  // Fetch on mount
  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);
  // Fetch real-time financial data from FinancialReportForm API
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches real-time financial summary data from the backend for dashboard KPIs.
   * Updates total revenue, expenses, and net profit in state.
   */
  useEffect(() => {
    const fetchFinancialSummary = async () => {
      setLoading(true);
      try {
        // This endpoint should match the one used in FinancialReportForm for calculations
        const res = await axios.get('http://localhost:5000/api/financial-reports/data/calculations');
        const data = res.data.calculatedTotals;
        setFinancialData({
          totalRevenue: data.totalIncome || 0,
          totalExpenses: data.totalExpenses || 0,
          netProfit: data.netBalance || 0
        });
      } catch (err) {
        setError('Failed to fetch financial summary');
      } finally {
        setLoading(false);
      }
    };
    fetchFinancialSummary();
  }, []);
  // (Removed duplicate loading and error state declarations)

  // Example of how you might fetch data
  useEffect(() => {
    // const fetchFinancialData = async () => {
    //   try {
    //     setLoading(true);
    //     const res = await fetch('http://localhost:5000/api/financials/summary');
    //     if (!res.ok) throw new Error('Failed to fetch data');
    //     const data = await res.json();
    //     setFinancialData(data);
    //   } catch (err) {
    //     setError(err.message);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchFinancialData();
  }, []);

  if (loading) {
  return <div className="text-center py-10">Loading Financial Data...</div>;
  }

  if (error) {
  return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div style={{ background: `linear-gradient(180deg, ${COLORS.CREAM}, ${COLORS.WARM_BEIGE})` }} className="min-h-screen flex flex-col">
      <main className="flex-grow p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-amber-200 to-white rounded-full p-3 shadow-md">
                <svg className="w-12 h-12 text-[var(--amber-600,#CC7722)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" stroke={COLORS.DEEP_CINNAMON} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke={COLORS.DEEP_CINNAMON} d="M8 12h8M12 8v8" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-extrabold" style={{ color: COLORS.DARK_SLATE }}>Financial Officer Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Overview of revenues, expenses and quick actions</p>
              </div>
            </div>
            {/* Notification Bell */}
            <div className="relative">
              <button
                className="relative focus:outline-none"
                onClick={() => {
                  setNotifOpen((open) => !open);
                  if (!notifOpen) fetchNotifications();
                }}
                aria-label="Notifications"
              >
                <FaBell className="w-7 h-7 text-amber-600 hover:text-amber-800 transition" />
                {notifications.filter(n => n.announcement?.target === 'admin' || n.announcement?.target === 'all').some(n => !n.read) && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold animate-pulse">{notifications.filter(n => (n.announcement?.target === 'admin' || n.announcement?.target === 'all') && !n.read).length}</span>
                )}
              </button>
              {/* Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-amber-100 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b font-semibold text-amber-700">Announcements</div>
                  {notifLoading ? (
                    <div className="p-4 text-gray-500">Loading...</div>
                  ) : notifError ? (
                    <div className="p-4 text-red-500">{notifError}</div>
                  ) : notifications.filter(n => n.announcement?.target === 'admin' || n.announcement?.target === 'all').length === 0 ? (
                    <div className="p-4 text-gray-500">No announcements</div>
                  ) : (
                    notifications.filter(n => n.announcement?.target === 'admin' || n.announcement?.target === 'all').map((notif) => (
                      <div key={notif._id} className={`px-4 py-3 border-b last:border-b-0 ${notif.read ? 'bg-white' : 'bg-amber-50'}`}>
                        <div className="text-sm text-gray-800">{notif.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</div>
                        {!notif.read && (
                          <button
                            className="mt-1 text-xs text-blue-600 hover:underline"
                            onClick={async () => {
                              try {
                                const response = await axios.put(
                                  `http://localhost:5000/api/announcements/notifications/${notif._id}/read`,
                                  {},
                                  {
                                    headers: {
                                      'Authorization': `Bearer ${token}`
                                    }
                                  }
                                );
                                if (response.status === 200) {
                                  setNotifications((prev) => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
                                }
                              } catch (err) {
                                console.error('Error marking notification as read:', err);
                              }
                            }}
                          >Mark as read</button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: pie chart + summaries */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="w-full lg:w-1/2 h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={[
                        { name: 'Revenue', value: Number(financialData.totalRevenue) || 0 },
                        { name: 'Expenses', value: Number(financialData.totalExpenses) || 0 },
                        { name: 'Net Profit', value: Math.max(Number(financialData.netProfit) || 0, 0) }
                      ]}
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={4}
                      label={() => ''}
                    >
                      <Cell key="revenue" fill="#16a34a" />
                      <Cell key="expenses" fill="#ef4444" />
                      <Cell key="profit" fill="#0284c7" />
                    </Pie>
                    <Tooltip formatter={(value) => `Rs ${Number(value).toLocaleString()}`} />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full lg:w-1/2">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-6 rounded-lg bg-gradient-to-r from-green-50 to-white border-l-4 border-green-400 shadow-sm">
                    <div className="text-sm text-gray-500">Total Revenue</div>
                    <div className="text-3xl md:text-4xl font-bold text-green-700">Rs {Number(financialData.totalRevenue).toLocaleString()}</div>
                  </div>
                  <div className="p-6 rounded-lg bg-gradient-to-r from-red-50 to-white border-l-4 border-red-400 shadow-sm">
                    <div className="text-sm text-gray-500">Total Expenses</div>
                    <div className="text-3xl md:text-4xl font-bold text-red-600">Rs {Number(financialData.totalExpenses).toLocaleString()}</div>
                  </div>
                  <div className="p-6 rounded-lg bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-400 shadow-sm">
                    <div className="text-sm text-gray-500">Net Profit</div>
                    <div className="text-3xl md:text-4xl font-bold text-blue-700">Rs {Number(financialData.netProfit).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: actions (5 buttons) */}
          <aside className="flex flex-col gap-6">
            <Link to="/salary_form" className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-xl transform hover:scale-[1.02] hover:shadow-2xl transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3v1a3 3 0 006 0v-1z"/></svg>
              <div>
                <div className="text-lg md:text-xl font-semibold">Manage Salaries</div>
                <div className="text-sm text-amber-100">Process employee salaries</div>
              </div>
            </Link>

            <Link to="/sup-payment-form" className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-red-500 to-red-400 text-white shadow-xl transform hover:scale-[1.02] hover:shadow-2xl transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 12H4"/></svg>
              <div>
                <div className="text-lg md:text-xl font-semibold">Supplier Payments</div>
                <div className="text-sm text-red-100">Pay and manage suppliers</div>
              </div>
            </Link>

            <Link to="/delivery-payout-form" className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-green-600 to-green-500 text-white shadow-xl transform hover:scale-[1.02] hover:shadow-2xl transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 19v-7m0 0l-3 3m3-3l3 3"/></svg>
              <div>
                <div className="text-lg md:text-xl font-semibold">Delivery Payouts</div>
                <div className="text-sm text-green-100">Manage delivery payouts</div>
              </div>
            </Link>

            <Link to="/financial-report-form" className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl transform hover:scale-[1.02] hover:shadow-2xl transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2"/></svg>
              <div>
                <div className="text-lg md:text-xl font-semibold">Financial Reports</div>
                <div className="text-sm text-blue-100">Generate detailed reports</div>
              </div>
            </Link>

            <Link to="/offer-page" className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-xl transform hover:scale-[1.02] hover:shadow-2xl transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3v1a3 3 0 006 0v-1"/></svg>
              <div>
                <div className="text-lg md:text-xl font-semibold">Manage Offers</div>
                <div className="text-sm text-purple-100">Create and manage offers</div>
              </div>
            </Link>
          </aside>
        </div>
        </div>
      </main>
    </div>
  );
};

export default FinancialOfficerDashboard;