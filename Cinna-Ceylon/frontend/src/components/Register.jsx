import React, { useState } from 'react';
import { sanitizePhone, allowPhoneKey, handlePhonePaste } from '../utils/validations.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaUsers } from 'react-icons/fa';

function Register() {
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    userType: 'buyer',
    profile: {
      name: '',
      phone: '',
      address: ''
    }
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      // clear field error when user types
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // validation helpers
  const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidUsername = username => /^[a-zA-Z0-9_-]{3,30}$/.test(username);
  const isStrongPassword = pwd => pwd.length >= 8 && /[0-9]/.test(pwd) && /[a-zA-Z]/.test(pwd);
  const isValidPhone = phone => {
    if (!phone) return true; // optional
    // strip non-digits
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setFieldErrors({});

    // client-side validation
    const errors = {};
    if (!isValidUsername(form.username)) errors.username = 'Username must be 3-30 chars and contain only letters, numbers, _ or -.';
    if (!isValidEmail(form.email)) errors.email = 'Please enter a valid email address.';
    if (!isStrongPassword(form.password)) errors.password = 'Password must be at least 8 characters and include letters and numbers.';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  if (!isValidPhone(form.profile.phone)) errors['profile.phone'] = 'Phone must contain exactly 10 digits.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix validation errors and try again.');
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const userTypeOptions = [
    { value: 'buyer', label: 'Buyer', description: 'Purchase products from suppliers' },
    { value: 'supplier', label: 'Supplier', description: 'Sell products to buyers' },
    { value: 'driver', label: 'Driver', description: 'Deliver products to customers' }
  ];

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-10 relative"
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
      <div className="relative z-10 w-full max-w-2xl mx-4">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-[#8B4513] text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FaUserPlus size={24} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-600">Join our platform today</p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="bg-red-100 bg-opacity-90 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 bg-opacity-90 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
              {success}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Account Information</h3>
              
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaUser size={16} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Choose a username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition"
                    required
                  />
                </div>
                {fieldErrors.username && <p className="text-xs text-red-600 mt-1">{fieldErrors.username}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaEnvelope size={16} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition"
                    required
                  />
                </div>
                {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaLock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaLock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition"
                    required
                  />
                </div>
                {fieldErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>}
              </div>

              {/* User Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaUsers size={16} />
                  </div>
                  <select
                    name="userType"
                    value={form.userType}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition appearance-none bg-white"
                    required
                  >
                    {userTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Personal Information (Optional)</h3>
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="profile.name"
                  placeholder="Enter your full name"
                  value={form.profile.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="profile.phone"
                  placeholder="Enter your phone number"
                  value={form.profile.phone}
                  onKeyDown={allowPhoneKey}
                  onPaste={(e) => handlePhonePaste(e, (val) => handleChange({ target: { name: 'profile.phone', value: sanitizePhone(val) } }))}
                  onChange={(e) => {
                    const sanitized = sanitizePhone(e.target.value);
                    handleChange({ target: { name: 'profile.phone', value: sanitized } });
                  }}
                  inputMode="tel"
                  // New rule: up to 11 digits (no +), or + with up to 12 digits.
                  maxLength={form.profile.phone.startsWith('+') ? 13 : 11}
                  title="Up to 11 digits, or + followed by up to 12 digits."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition"
                />
                {fieldErrors['profile.phone'] && <p className="text-xs text-red-600 mt-1">{fieldErrors['profile.phone']}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  name="profile.address"
                  placeholder="Enter your address"
                  value={form.profile.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#8B4513] text-white py-3 rounded-lg font-semibold hover:bg-[#A0522D] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <FaUserPlus size={16} />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-[#8B4513] font-semibold hover:text-[#A0522D] transition underline"
              >
                Sign In
              </button>
            </p>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <span className="text-[#8B4513] hover:underline cursor-pointer">Terms of Service</span>
              {' '}and{' '}
              <span className="text-[#8B4513] hover:underline cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;