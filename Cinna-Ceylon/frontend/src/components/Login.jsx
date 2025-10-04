import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingAdmin, setPendingAdmin] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      // Check if admin (by role or isAdmin)
      const adminRoles = ['delivery manager', 'product manager', 'finance manager', 'user manager'];
      if (data.user?.isAdmin === true || adminRoles.includes(data.user?.role)) {
        // Send OTP for attendance
        setPendingAdmin({ ...data.user, token: data.token });
        setShowOtp(true);
        setLoading(false);
        try {
          setOtpLoading(true);
          const otpRes = await fetch('http://localhost:5000/api/attendance/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.user.email })
          });
          const otpData = await otpRes.json();
          if (!otpRes.ok) {
            // If attendance already marked, treat as successful login
            if (otpData.message === 'Attendance already marked in the last 24 hours.') {
              login({ token: data.token, ...data.user });
              toast.success('Attendance already marked! Welcome, Admin.', { position: 'top-right', autoClose: 3000 });
              setShowOtp(false);
              setOtp('');
              setPendingAdmin(null);
              setTimeout(() => navigate('/dashboard/admin'), 1000);
              return;
            } else if (otpData.message === 'Not authorized') {
              // User doesn't have admin privileges for attendance, proceed with regular login
              login({ token: data.token, ...data.user });
              toast.success(`Welcome, ${data.user?.username || data.user?.name || 'User'}!`, { position: 'top-right', autoClose: 3000 });
              setShowOtp(false);
              setPendingAdmin(null);
              setTimeout(() => navigate('/dashboard/admin'), 1000);
              return;
            } else if (otpData.message === 'User not found') {
              // Handle user not found error - still allow login but skip attendance
              login({ token: data.token, ...data.user });
              toast.warning('Login successful, but attendance system is not available for this account.', { position: 'top-right', autoClose: 4000 });
              setShowOtp(false);
              setPendingAdmin(null);
              setTimeout(() => navigate('/dashboard/admin'), 1000);
              return;
            } else {
              throw new Error(otpData.message || 'Failed to send OTP');
            }
          }
          toast.info('OTP sent to your email for attendance.', { position: 'top-right', autoClose: 3000 });
        } catch (otpErr) {
          console.error('OTP Error:', otpErr);
          // Don't block login if OTP fails - attendance is optional
          if (otpErr.message && !otpErr.message.includes('network') && !otpErr.message.includes('fetch')) {
            setError(otpErr.message);
            setShowOtp(false);
            setPendingAdmin(null);
          } else {
            // Network error or general failure - allow login but show warning
            login({ token: data.token, ...data.user });
            toast.warning('Login successful, but attendance OTP could not be sent. Please check your connection.', { 
              position: 'top-right', 
              autoClose: 5000 
            });
            setShowOtp(false);
            setPendingAdmin(null);
            setTimeout(() => navigate('/dashboard/admin'), 1000);
            return;
          }
        } finally {
          setOtpLoading(false);
        }
        return;
      }

      // Non-admin: proceed as before
      login({ token: data.token, ...data.user });
      toast.success(`Welcome, ${data.user?.username || data.user?.name || 'User'}!`, {
        position: 'top-right',
        autoClose: 3000,
      });
      let dashboardPath = '/';
      if (data.user?.userType === 'buyer') {
        dashboardPath = '/dashboard/buyer';
      } else if (data.user?.userType === 'supplier') {
        dashboardPath = '/dashboard/supplier';
      } else if (data.user?.userType === 'driver') {
        dashboardPath = '/dashboard/driver';
      } else if (data.user?.isAdmin === true) {
        dashboardPath = '/dashboard/admin';
      }
      setTimeout(() => navigate(dashboardPath), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP submit for admin attendance
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/attendance/mark-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingAdmin.email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed');
      login({ token: pendingAdmin.token, ...pendingAdmin });
      toast.success('Attendance marked! Welcome, Admin.', { position: 'top-right', autoClose: 3000 });
      setShowOtp(false);
      setOtp('');
      setPendingAdmin(null);
      setTimeout(() => navigate('/dashboard/admin'), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

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
      {/* OTP Modal for Admin Attendance */}
      {showOtp && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
            <h3 className="text-xl font-bold mb-4 text-center">Admin Attendance OTP</h3>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Enter OTP from your email"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                required
                maxLength={6}
              />
              <button
                type="submit"
                disabled={otpLoading}
                className="w-full bg-[#8B4513] text-white py-2 rounded-lg font-semibold hover:bg-[#A0522D] transition disabled:opacity-50"
              >
                {otpLoading ? 'Verifying...' : 'Submit OTP'}
              </button>
              <button
                type="button"
                onClick={() => { setShowOtp(false); setOtp(''); setPendingAdmin(null); }}
                className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </form>
            {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
          </div>
        </div>
      )}
      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-[#8B4513] text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FaUser size={24} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && !showOtp && (
            <div className="bg-red-100 bg-opacity-90 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaUser size={16} />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaLock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#8B4513] text-white py-3 rounded-lg font-semibold hover:bg-[#A0522D] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-[#8B4513] font-semibold hover:text-[#A0522D] transition underline"
              >
                Create Account
              </button>
            </p>
          </div>

          {/* Additional Links */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-gray-500 hover:text-[#8B4513] transition"
            >
              Forgot your password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;