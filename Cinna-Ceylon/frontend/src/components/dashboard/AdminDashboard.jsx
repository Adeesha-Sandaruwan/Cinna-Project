import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { downloadCSV } from './downloadCSV';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Users,
  ClipboardList,
  CalendarCheck,
  Package,
  Truck,
  DollarSign,
  Store,
  Plus,
  Edit,
  Trash2,
  Download,
  X,
  Activity,
  Shield,
  Sparkles,
  BarChart3
} from 'lucide-react';

const initialForm = {
  username: '',
  email: '',
  password: '',
  userType: '',
  role: null,  // Initialize as null to match backend schema
  isAdmin: false,
  profile: { name: '', address: '', phone: '' }
};



const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // sidebar menu items
  const sidebarItems = [
    { name: "Users", icon: Users, path: "/dashboard/users" },
    { name: "Attendance", icon: ClipboardList, path: "/dashboard/attendance-records" },
    { name: "Leave", icon: CalendarCheck, path: "/dashboard/leave" },
    { name: "Product Manager", icon: Package, path: "/dashboard/product" },
    { name: "Supplier Manager", icon: Store, path: "/dashboard/supplier" },
    { name: "Delivery Manager", icon: Truck, path: "/delivery-manager" },
    { name: "Vehicle Manager", icon: Truck, path: "/vehicle-manager" },
    { name: "Financial Manager", icon: DollarSign, path: "/dashboard/finance" },
  ];

  const token = localStorage.getItem('token');

  // Navigate to Product Management Dashboard
  const goToProductDashboard = () => {
    navigate('/admin/dashboard');
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
      else toast.error(data.message || 'Failed to fetch users');
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
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
      const csv = await res.text();
      downloadCSV(csv);
    } catch (err) {
      toast.error(err.message || 'Download failed');
    }
  };

  // Handle form input
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('profile.')) {
      setForm(f => ({ ...f, profile: { ...f.profile, [name.split('.')[1]]: value } }));
    } else if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Create user (popup)
  const handleCreate = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare the request body
      const body = {
        username: form.username,
        email: form.email,
        password: form.password,
        profile: form.profile,
        userType: form.userType,
        role: form.role
      };

      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('User created');
        setForm(initialForm);
        setShowCreate(false);
        fetchUsers();
      } else {
        toast.error(data.message || 'Create failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };


  // Edit user (popup)
  const handleEdit = user => {
    // Determine the correct userType based on role and permissions
    let effectiveUserType = user.userType;
    
    // If user has a specific role, that becomes their userType
    if (user.role) {
      if (user.role === 'admin' || user.role.includes('_manager')) {
        effectiveUserType = user.role;
      }
    }
    
    setForm({
      username: user.username,
      email: user.email,
      password: '',
      userType: effectiveUserType,
      role: user.role || '',
      isAdmin: user.isAdmin,
      profile: {
        name: user.profile?.name || '',
        address: user.profile?.address || '',
        phone: user.profile?.phone || ''
      }
    });
    setEditingId(user._id);
  };

  // Update user (popup)
  const handleUpdate = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare the update data
      const body = {
        username: form.username,
        email: form.email,
        profile: form.profile
      };

      // Only include password if it was changed
      if (form.password) {
        body.password = form.password;
      }

      // Determine userType and role based on the selection
      if (form.role?.includes('_manager')) {
        body.userType = 'manager';
        body.role = form.role;
      } else if (form.userType === 'admin') {
        body.userType = 'admin';
        body.role = 'admin';
      } else {
        body.userType = form.userType;
        body.role = null;
      }

      const res = await fetch(`http://localhost:5000/api/admin/users/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('User updated');
        setForm(initialForm);
        setEditingId(null);
        fetchUsers();
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('User deleted');
        fetchUsers();
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit or create
  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowCreate(false);
  };

  return (
    <>
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div>
            <button
              onClick={goToProductDashboard}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-700 transition-colors mr-4"
            >
              Product Management
            </button>
            <button
              onClick={() => navigate('/leave-management')}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-700 transition-colors mr-4"
            >
              Leave Management
            </button>
            <button
              onClick={() => { setShowCreate(true); setEditingId(null); setForm(initialForm); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              Create User
            </button>
          </div>
        </div>

        <div className="mb-8">
          {/* Create User Modal */}
          {showCreate && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                <button onClick={handleCancel} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
                <h2 className="text-xl font-semibold mb-4">Create User</h2>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="username" value={form.username} onChange={handleChange} placeholder="Username" className="border p-2 rounded" required />
                  <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded" required />
                  <input name="password" value={form.password} onChange={handleChange} placeholder="Password" className="border p-2 rounded" type="password" required />
                  <select name="userType" value={form.userType} onChange={handleChange} className="border p-2 rounded">
                    <option value="buyer">Buyer</option>
                    <option value="supplier">Supplier</option>
                    <option value="driver">Driver</option>
                  </select>
                  {/* Only show role for managers */}
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    disabled={form.userType !== 'delivery manager' && form.userType !== 'product manager' && form.userType !== 'finance manager' && form.userType !== 'user manager'}
                  >
                    <option value="">Select Role (Managers Only)</option>
                    <option value="delivery manager">Delivery Manager</option>
                    <option value="product manager">Product Manager</option>
                    <option value="finance manager">Finance Manager</option>
                    <option value="user manager">User Manager</option>
                  </select>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isAdmin" checked={form.isAdmin} onChange={handleChange} /> Admin
                  </label>
                  <input name="profile.name" value={form.profile.name} onChange={handleChange} placeholder="Full Name" className="border p-2 rounded" />
                  <input name="profile.address" value={form.profile.address} onChange={handleChange} placeholder="Address" className="border p-2 rounded" />
                  <input name="profile.phone" value={form.profile.phone} onChange={handleChange} placeholder="Phone" className="border p-2 rounded" />
                  <div className="col-span-2 flex gap-2 mt-2">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={loading}>Create</button>
                    <button type="button" onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Edit User Modal */}
          {editingId && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                <button onClick={handleCancel} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
                <h2 className="text-xl font-semibold mb-4">Edit User</h2>
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="username" value={form.username} onChange={handleChange} placeholder="Username" className="border p-2 rounded" required />
                  <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded" required />
                  <input name="password" value={form.password} onChange={handleChange} placeholder="New Password (optional)" className="border p-2 rounded" type="password" />
                  <select name="userType" value={form.userType} onChange={handleChange} className="border p-2 rounded">
                    <option value="buyer">Buyer</option>
                    <option value="supplier">Supplier</option>
                    <option value="driver">Driver</option>
                  </select>
                  {/* Only show role for managers */}
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    disabled={!(form.userType === 'driver' || form.userType === 'supplier' || form.userType === 'buyer') ? false : true}
                  >
                    <option value="">Select Role (Managers Only)</option>
                    <option value="delivery manager">Delivery Manager</option>
                    <option value="product manager">Product Manager</option>
                    <option value="finance manager">Finance Manager</option>
                    <option value="user manager">User Manager</option>
                  </select>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isAdmin" checked={form.isAdmin} onChange={handleChange} /> Admin
                  </label>
                  <input name="profile.name" value={form.profile.name} onChange={handleChange} placeholder="Full Name" className="border p-2 rounded" />
                  <input name="profile.address" value={form.profile.address} onChange={handleChange} placeholder="Address" className="border p-2 rounded" />
                  <input name="profile.phone" value={form.profile.phone} onChange={handleChange} placeholder="Phone" className="border p-2 rounded" />
                  <div className="col-span-2 flex gap-2 mt-2">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={loading}>Update</button>
                    <button type="button" onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">All Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow">
              <thead>
                <tr>
                  <th className="p-2 border">Username</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">Admin</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Address</th>
                  <th className="p-2 border">Phone</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="text-center">
                    <td className="p-2 border">{u.username}</td>
                    <td className="p-2 border">{u.email}</td>
                    <td className="p-2 border capitalize">{u.userType}</td>
                    <td className="p-2 border capitalize">{u.role || '-'}</td>
                    <td className="p-2 border">{u.isAdmin ? 'Yes' : 'No'}</td>
                    <td className="p-2 border">{u.profile?.name || ''}</td>
                    <td className="p-2 border">{u.profile?.address || ''}</td>
                    <td className="p-2 border">{u.profile?.phone || ''}</td>
                    <td className="p-2 border flex gap-2 justify-center">
                      <button onClick={() => handleEdit(u)} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700">Edit</button>
                      <button onClick={() => handleDelete(u._id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Section Link */}
        <div className="mt-12">
          <button onClick={() => navigate('/dashboard/attendance-records')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            View Attendance Records
          </button>
        </div>
      </div>
    </div>

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex bg-gradient-to-br from-amber-50 via-orange-50 to-red-100 min-h-screen relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360] 
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{ 
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0] 
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Enhanced Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -256, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -256, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl z-40 w-64 backdrop-blur-sm"
          >
            {/* Sidebar Header */}
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between px-6 py-6 border-b border-blue-600/30"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    CinnaAdmin
                  </h2>
                  <p className="text-xs text-blue-300">Control Panel</p>
                </div>
              </div>
            </motion.div>

            {/* Navigation Menu */}
            <nav className="mt-6 flex flex-col gap-2 px-3">
              {sidebarItems.map(({ name, icon: Icon, path }, index) => (
                <motion.button
                  key={name}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index + 0.3 }}
                  onClick={() => navigate(path)}
                  className={`group flex items-center gap-4 px-4 py-3 mx-1 rounded-xl transition-all duration-300 relative overflow-hidden ${
                    location.pathname === path
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg shadow-amber-500/25"
                      : "hover:bg-white/10 hover:shadow-lg hover:shadow-white/10"
                  }`}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {location.pathname === path && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon 
                    size={20} 
                    className={`relative z-10 transition-colors ${
                      location.pathname === path ? "text-white" : "text-blue-300 group-hover:text-white"
                    }`} 
                  />
                  <span className={`relative z-10 font-medium transition-colors ${
                    location.pathname === path ? "text-white" : "text-blue-200 group-hover:text-white"
                  }`}>
                    {name}
                  </span>
                  {location.pathname === path && (
                    <motion.div
                      className="absolute right-3 w-2 h-2 bg-yellow-400 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>

            {/* Admin Badge */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-6 left-6 right-6 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Admin Access</p>
                  <p className="text-xs text-yellow-300">Full Privileges</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Toggle Button */}
      <motion.button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-6 left-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white p-3 rounded-xl shadow-lg z-50 hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          animate={{ rotate: sidebarOpen ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </motion.div>
      </motion.button>

      {/* Main Content */}
      <motion.div
        className="flex-1 transition-all duration-500 ease-in-out"
        animate={{ marginLeft: sidebarOpen ? 256 : 0 }}
      >
        {/* Enhanced Header */}
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 px-8 py-6 relative overflow-hidden"
        >
          {/* Header background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 to-orange-50/50" />
          
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, delay: 0.3 }}
                className="w-12 h-12 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Activity className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent"
                >
                  Admin Dashboard
                </motion.h1>
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-slate-600"
                >
                  Manage your CinnaCeylon platform
                </motion.p>
              </div>
            </div>
            
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-700">System Administrator</p>
                <p className="text-xs text-slate-500">Online</p>
              </div>
              <motion.div 
                className="w-12 h-12 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-center rounded-full font-bold shadow-lg relative"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                A
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.header>

        {/* Enhanced Main Actions */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-8"
        >
          <motion.div 
            className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-8 mb-8 border border-white/20 relative overflow-hidden"
            whileHover={{ y: -2, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
            transition={{ duration: 0.3 }}
          >
            {/* Card background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/30 to-orange-50/30" />
            
            <div className="relative z-10 flex justify-between items-center">
              <div className="flex gap-4">
                <motion.button 
                  onClick={() => setShowCreate(true)} 
                  className="group flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="p-1 bg-white/20 rounded-lg"
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Plus size={18} />
                  </motion.div>
                  Create User
                </motion.button>

                <motion.button 
                  onClick={() => navigate('/dashboard/attendance')} 
                  className="group flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="p-1 bg-white/20 rounded-lg"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ClipboardList size={18} />
                  </motion.div>
                  Attendance
                </motion.button>

                <motion.button 
                  onClick={handleDownloadReport} 
                  className="group flex items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="p-1 bg-white/20 rounded-lg"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Download size={18} />
                  </motion.div>
                  Download Report
                </motion.button>
              </div>

              {/* Stats Cards */}
              <div className="flex gap-6">
                <motion.div 
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                >
                  <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                  <p className="text-xs text-slate-600">Total Users</p>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                >
                  <p className="text-2xl font-bold text-emerald-600">{users.filter(u => u.isAdmin).length}</p>
                  <p className="text-xs text-slate-600">Admins</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
          {/* Enhanced Create User Modal */}
          <AnimatePresence>
            {showCreate && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 50 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 relative overflow-hidden border border-white/20"
                >
                  {/* Modal background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50" />
                  
                  <div className="relative z-10">
                    <motion.button 
                      onClick={handleCancel} 
                      className="absolute -top-2 -right-2 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={20} />
                    </motion.button>

                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-4 mb-6"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800">Create New User</h2>
                        <p className="text-sm text-slate-600">Add a new user to the system</p>
                      </div>
                    </motion.div>

                    <motion.form 
                      onSubmit={handleCreate} 
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Username</label>
                        <input 
                          name="username" 
                          value={form.username} 
                          onChange={handleChange} 
                          placeholder="Enter username" 
                          className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Email</label>
                        <input 
                          name="email" 
                          value={form.email} 
                          onChange={handleChange} 
                          placeholder="Enter email" 
                          className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Password</label>
                        <input 
                          name="password" 
                          value={form.password} 
                          onChange={handleChange} 
                          placeholder="Enter password" 
                          className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                          type="password" 
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Role</label>
                        <select 
                          name="userType" 
                          value={form.userType} 
                          onChange={(e) => {
                            const value = e.target.value;
                            handleChange(e);
                            if (value.includes('manager')) {
                              setForm(prev => ({ ...prev, role: value, isAdmin: true }));
                            } else if (value === 'admin') {
                              setForm(prev => ({ ...prev, role: 'admin', isAdmin: true }));
                            } else {
                              setForm(prev => ({ ...prev, role: '', isAdmin: false }));
                            }
                          }} 
                          className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select Role</option>
                          <optgroup label="Admin Roles">
                            <option value="admin">System Admin</option>
                          </optgroup>
                          <optgroup label="Manager Roles">
                            <option value="delivery_manager">Delivery Manager</option>
                            <option value="product_manager">Product Manager</option>
                            <option value="finance_manager">Finance Manager</option>
                            <option value="user_manager">User Manager</option>
                            <option value="vehicle_manager">Vehicle Manager</option>
                            <option value="supplier_manager">Supplier Manager</option>
                          </optgroup>
                          <optgroup label="User Roles">
                            <option value="buyer">Buyer</option>
                            <option value="supplier">Supplier</option>
                            <option value="driver">Driver</option>
                          </optgroup>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Full Name</label>
                        <input 
                          name="profile.name" 
                          value={form.profile.name} 
                          onChange={handleChange} 
                          placeholder="Enter full name" 
                          className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Phone</label>
                        <input 
                          name="profile.phone" 
                          value={form.profile.phone} 
                          onChange={handleChange} 
                          placeholder="Enter phone number" 
                          className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Address</label>
                        <input 
                          name="profile.address" 
                          value={form.profile.address} 
                          onChange={handleChange} 
                          placeholder="Enter address" 
                          className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        />
                      </div>

                      <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                        <input 
                          type="checkbox" 
                          name="isAdmin" 
                          checked={form.isAdmin} 
                          onChange={handleChange} 
                          className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                        />
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Shield size={16} className="text-yellow-500" />
                          Admin Privileges
                        </label>
                      </div>

                      <div className="md:col-span-2 flex gap-3 mt-6">
                        <motion.button 
                          type="submit" 
                          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50" 
                          disabled={loading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {loading ? 'Creating...' : 'Create User'}
                        </motion.button>
                        <motion.button 
                          type="button" 
                          onClick={handleCancel} 
                          className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </motion.form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Enhanced Edit User Modal */}
          <AnimatePresence>
            {editingId && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 50 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 relative overflow-hidden border border-white/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50" />
                  
                  <div className="relative z-10">
                    <motion.button 
                      onClick={handleCancel} 
                      className="absolute -top-2 -right-2 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={20} />
                    </motion.button>

                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-4 mb-6"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                        <Edit className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800">Edit User</h2>
                        <p className="text-sm text-slate-600">Update user information</p>
                      </div>
                    </motion.div>

                    <motion.form 
                      onSubmit={handleUpdate} 
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Username</label>
                        <input 
                          name="username" 
                          value={form.username} 
                          onChange={handleChange} 
                          placeholder="Enter username" 
                          className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Email</label>
                        <input 
                          name="email" 
                          value={form.email} 
                          onChange={handleChange} 
                          placeholder="Enter email" 
                          className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">New Password</label>
                        <input 
                          name="password" 
                          value={form.password} 
                          onChange={handleChange} 
                          placeholder="Leave blank to keep current" 
                          className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                          type="password" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Role</label>
                        <select 
                          name="userType" 
                          value={form.userType} 
                          onChange={(e) => {
                            const value = e.target.value;
                            handleChange(e);
                            if (value.includes('manager')) {
                              setForm(prev => ({ ...prev, role: value, isAdmin: true }));
                            } else if (value === 'admin') {
                              setForm(prev => ({ ...prev, role: 'admin', isAdmin: true }));
                            } else {
                              setForm(prev => ({ ...prev, role: '', isAdmin: false }));
                            }
                          }} 
                          className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select Role</option>
                          <optgroup label="Admin Roles">
                            <option value="admin">System Admin</option>
                          </optgroup>
                          <optgroup label="Manager Roles">
                            <option value="delivery_manager">Delivery Manager</option>
                            <option value="product_manager">Product Manager</option>
                            <option value="finance_manager">Finance Manager</option>
                            <option value="user_manager">User Manager</option>
                            <option value="vehicle_manager">Vehicle Manager</option>
                            <option value="supplier_manager">Supplier Manager</option>
                          </optgroup>
                          <optgroup label="User Roles">
                            <option value="buyer">Buyer</option>
                            <option value="supplier">Supplier</option>
                            <option value="driver">Driver</option>
                          </optgroup>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Full Name</label>
                        <input 
                          name="profile.name" 
                          value={form.profile.name} 
                          onChange={handleChange} 
                          placeholder="Enter full name" 
                          className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Phone</label>
                        <input 
                          name="profile.phone" 
                          value={form.profile.phone} 
                          onChange={handleChange} 
                          placeholder="Enter phone number" 
                          className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Address</label>
                        <input 
                          name="profile.address" 
                          value={form.profile.address} 
                          onChange={handleChange} 
                          placeholder="Enter address" 
                          className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        />
                      </div>

                      <div className="md:col-span-2 flex gap-3 mt-6">
                        <motion.button 
                          type="submit" 
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50" 
                          disabled={loading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {loading ? 'Updating...' : 'Update User'}
                        </motion.button>
                        <motion.button 
                          type="button" 
                          onClick={handleCancel} 
                          className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </motion.form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Users Table */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden border border-white/20"
          >
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">User Management</h2>
                  <p className="text-sm text-slate-600">Manage all system users and their permissions</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-amber-100 to-orange-100">
                  <tr>
                    {["Username", "Email", "Type", "Role", "Admin", "Name", "Phone", "Actions"].map((head, index) => (
                      <motion.th 
                        key={head} 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * index + 0.7 }}
                        className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider"
                      >
                        {head}
                      </motion.th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((u, i) => (
                    <motion.tr 
                      key={u._id} 
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.05 * i + 0.8 }}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group"
                      whileHover={{ scale: 1.01 }}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">{u.username}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 capitalize">
                          {u.userType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.role ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                            {u.role.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Shield size={12} />
                            Yes
                          </span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{u.profile?.name || "—"}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{u.profile?.phone || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <motion.button 
                            onClick={() => handleEdit(u)} 
                            className="group flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit size={14} />
                            Edit
                          </motion.button>
                          <motion.button 
                            onClick={() => handleDelete(u._id)} 
                            className="group flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {users.length === 0 && !loading && (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <td colSpan="8" className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-slate-600 font-medium">No users found</p>
                            <p className="text-sm text-slate-400">Get started by creating your first user</p>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                  {loading && (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td colSpan="8" className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <motion.div
                            className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <p className="text-slate-600 font-medium">Loading users...</p>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
    </>
  );
};


export default AdminDashboard;
