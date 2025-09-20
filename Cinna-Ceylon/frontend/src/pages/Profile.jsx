import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaEdit, FaTrash, FaSave, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
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
      <div 
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your profile</h1>
            <button
              onClick={() => navigate('/login')}
              className="bg-[#8B4513] text-white px-6 py-2 rounded-lg hover:bg-[#A0522D] transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-10 relative"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Content */}
      <div className="relative z-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#8B4513] text-white p-4 rounded-full">
                <FaUserCircle size={40} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{formData.profile.name || formData.username}</h1>
                <p className="text-gray-600">{formData.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-[#8B4513] text-white px-4 py-2 rounded-lg hover:bg-[#A0522D] transition"
                  >
                    <FaEdit size={16} />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    <FaTrash size={16} />
                    Delete Account
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <FaSave size={16} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={loading}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    <FaTimes size={16} />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-100 bg-opacity-95 backdrop-blur-sm border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 bg-opacity-95 backdrop-blur-sm border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 shadow-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Account Information */}
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Account Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={user.userType || 'buyer'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed capitalize"
                  />
                  {user.userType === 'supplier' && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Verified</span>
                  )}
                  {user.userType === 'driver' && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Active</span>
                  )}
                </div>
              </div>
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password (Optional)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Leave blank to keep current password"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="profile.name"
                  value={formData.profile.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="profile.phone"
                  value={formData.profile.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                <input
                  type="text"
                    value={user.userType || 'buyer'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed capitalize"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  name="profile.address"
                  value={formData.profile.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                  placeholder="Enter your full address"
                />
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Account Status</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Account Type</p>
                  <p className="text-lg font-semibold text-[#8B4513] capitalize flex items-center gap-2">
                    {user.userType || 'buyer'}
                    {user.isAdmin && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Admin</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Member Since</p>
                  <p className="text-lg font-semibold text-[#8B4513]">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Account</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteProfile}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Yes, Delete Account'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

export default Profile;