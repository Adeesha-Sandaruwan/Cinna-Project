import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    profile: {
      name: '',
      phone: '',
      address: ''
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        profile: {
          name: user.profile?.name || '',
          phone: user.profile?.phone || '',
          address: user.profile?.address || ''
        }
      });
    }
    // fetch notifications
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:5000/api/announcements/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (e) {
        console.error('Failed to load notifications', e);
      }
    };
    fetchNotifications();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        username: formData.username,
        email: formData.email,
        profile: formData.profile
      };

      // Only include password if it's not empty
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        updateUser(data);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        setError(data.message || 'Failed to update profile');
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Profile deleted successfully!');
        logout();
        navigate('/');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete profile');
        toast.error(data.message || 'Failed to delete profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset form data
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        profile: {
          name: user.profile?.name || '',
          phone: user.profile?.phone || '',
          address: user.profile?.address || ''
        }
      });
    }
  };

  if (!user) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 rounded-xl mx-auto mb-6 w-fit">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-4">
            Please log in to view your profile
          </h1>
          <motion.button
            onClick={() => navigate('/login')}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogIn className="w-5 h-5" />
            <span>Go to Login</span>
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/20"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <User className="w-10 h-10" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
                  {formData.profile.name || formData.username}
                </h1>
                <div className="flex items-center space-x-2 text-gray-600 mt-1">
                  <Mail className="w-4 h-4" />
                  <span>{formData.email}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                    user.userType === 'admin' ? 'bg-red-100 text-red-800' :
                    user.userType === 'supplier' ? 'bg-amber-100 text-amber-800' :
                    user.userType === 'driver' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {user.userType || 'buyer'}
                  </span>
                  {user.isAdmin && (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <motion.button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit3 className="w-5 h-5" />
                    <span>Edit Profile</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Delete Account</span>
                  </motion.button>
                  {/* Notifications dropdown */}
                  <div className="relative">
                    <button onClick={async ()=>{
                      // mark all as read locally and send requests
                      const token = localStorage.getItem('token');
                      for (const n of notifications.filter(x=>!x.read)){
                        try { await fetch(`http://localhost:5000/api/announcements/notifications/${n._id}/read`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } }); } catch(e){}
                      }
                      const res = await fetch('http://localhost:5000/api/announcements/notifications', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); if (res.ok){ const data = await res.json(); setNotifications(data); }
                    }} className="ml-2 px-4 py-2 rounded-xl bg-amber-600 text-white">Notifications ({notifications.filter(n=>!n.read).length})</button>
                    {notifications.length>0 && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-3 z-50">
                        {notifications.map(n=> (
                          <div key={n._id} className={`p-2 rounded-md ${n.read? 'opacity-60':'bg-amber-50'}`}>
                            <div className="text-sm text-slate-700">{n.message}</div>
                            <div className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <motion.button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                    whileHover={{ scale: loading ? 1 : 1.05 }}
                    whileTap={{ scale: loading ? 1 : 0.95 }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={cancelEdit}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                    whileHover={{ scale: loading ? 1 : 1.05 }}
                    whileTap={{ scale: loading ? 1 : 0.95 }}
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Alert Messages */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="bg-red-100/90 backdrop-blur-lg border border-red-300 text-red-700 px-6 py-4 rounded-2xl mb-6 shadow-lg flex items-center space-x-3"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div 
              className="bg-green-100/90 backdrop-blur-lg border border-green-300 text-green-700 px-6 py-4 rounded-2xl mb-6 shadow-lg flex items-center space-x-3"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleUpdateProfile} className="space-y-8">
          {/* Account Information */}
          <motion.div 
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-2 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
                Account Information
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Username</label>
                <motion.input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300 bg-white/70"
                  required
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <motion.input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300 bg-white/70"
                    required
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">User Type</label>
                <div className="flex items-center gap-3">
                  <motion.input
                    type="text"
                    value={user.userType || 'buyer'}
                    disabled
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed capitalize"
                    whileFocus={{ scale: 1.02 }}
                  />
                  {user.userType === 'supplier' && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs font-semibold">Verified</span>
                  )}
                  {user.userType === 'driver' && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-xs font-semibold">Active</span>
                  )}
                </div>
              </div>
              {isEditing && (
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-semibold text-gray-700">New Password (Optional)</label>
                  <div className="relative">
                    <motion.input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Leave blank to keep current password"
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/70"
                      whileFocus={{ scale: 1.02 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Personal Information */}
          <motion.div 
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-2 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
                Personal Information
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                <motion.input
                  type="text"
                  name="profile.name"
                  value={formData.profile.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300 bg-white/70"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <motion.input
                    type="tel"
                    name="profile.phone"
                    value={formData.profile.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300 bg-white/70"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">User Type</label>
                <motion.input
                  type="text"
                  value={user.userType || 'buyer'}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed capitalize"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <motion.textarea
                    name="profile.address"
                    value={formData.profile.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows="3"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none transition-all duration-300 bg-white/70"
                    placeholder="Enter your full address"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Status */}
          <motion.div 
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
                Account Status
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div 
                className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-white/20"
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Account Type</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-bold text-gray-800 capitalize flex items-center gap-2">
                      {user.userType || 'buyer'}
                    </p>
                    {user.isAdmin && (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-xs font-semibold">Admin</span>
                    )}
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-white/20"
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Member Since</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <p className="text-lg font-bold text-gray-800">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </form>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-2xl mx-auto mb-4 w-fit">
                    <AlertTriangle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Account</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                  </p>
                </div>
                <div className="flex gap-4">
                  <motion.button
                    onClick={handleDeleteProfile}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 font-semibold flex items-center justify-center space-x-2"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        <span>Yes, Delete Account</span>
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 disabled:opacity-50 font-semibold"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default Profile;