import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { downloadCSV } from './downloadCSV';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Search, Filter, Calendar, Users, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AttendanceRecords = () => {
  const [attendance, setAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [filter, setFilter] = useState({ username: '', email: '', role: '', status: '', date: '' });
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Fetch all attendance records
  const fetchAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/attendance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setAttendance(data);
      else toast.error(data.message || 'Failed to fetch attendance');
    } catch (err) {
      toast.error('Network error');
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  // Download attendance report as CSV
  const handleDownloadReport = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/attendance/report', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to download report');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance_report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || 'Download failed');
    }
  };

  // Filtering logic
  const filtered = attendance.filter(a => {
    return (
      (!filter.username || (a.user?.username || '').toLowerCase().includes(filter.username.toLowerCase())) &&
      (!filter.email || (a.user?.email || '').toLowerCase().includes(filter.email.toLowerCase())) &&
      (!filter.role || (a.role || '').toLowerCase().includes(filter.role.toLowerCase())) &&
      (!filter.status || (a.status || '').toLowerCase() === filter.status.toLowerCase()) &&
      (!filter.date || new Date(a.date).toISOString().slice(0, 10) === filter.date)
    );
  });

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/20"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-3 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
                  Attendance Records
                </h1>
                <p className="text-gray-600 mt-1">Track and manage employee attendance</p>
              </div>
            </div>
            <motion.button 
              onClick={() => navigate('/dashboard/admin')} 
              className="flex items-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </motion.button>
          </div>
        </motion.div>
        {/* Filter Controls */}
        <motion.div 
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filter Records</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <motion.input 
                  placeholder="Search username..." 
                  value={filter.username} 
                  onChange={e => setFilter(f => ({ ...f, username: e.target.value }))} 
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/70"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <motion.input 
                  placeholder="Search email..." 
                  value={filter.email} 
                  onChange={e => setFilter(f => ({ ...f, email: e.target.value }))} 
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/70"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <motion.input 
                  placeholder="Search role..." 
                  value={filter.role} 
                  onChange={e => setFilter(f => ({ ...f, role: e.target.value }))} 
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/70"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <motion.select 
                value={filter.status} 
                onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/70"
                whileFocus={{ scale: 1.02 }}
              >
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </motion.select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <motion.input 
                  type="date" 
                  value={filter.date} 
                  onChange={e => setFilter(f => ({ ...f, date: e.target.value }))} 
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/70"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Actions</label>
              <motion.button 
                onClick={handleDownloadReport} 
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-3 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
                <span>Download CSV</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
        {/* Content Section */}
        <motion.div 
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {attendanceLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <Loader2 className="w-12 h-12 text-blue-600" />
                </motion.div>
                <p className="text-gray-600 mt-4 text-lg">Loading attendance records...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Records Found</h3>
                <p className="text-gray-500">No attendance records match your current filters.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Username</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Date</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Status</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {filtered.map((a, index) => (
                      <motion.tr 
                        key={a._id} 
                        className="hover:bg-gray-50/50 transition-colors duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {(a.user?.username || '').charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{a.user?.username || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {a.user?.email || ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {a.user?.profile?.name || ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(a.date).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                            {a.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                            a.status.toLowerCase() === 'present' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {a.status.toLowerCase() === 'present' ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {a.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AttendanceRecords;
