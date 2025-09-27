import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LeaveRequestManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
  // Revised access control:
  //  - buyer: blocked to home
  //  - hr_manager: can view ALL & approve/reject
  //  - other employees (supplier, driver, etc.): can view ALL requests (read-only, no buttons)
    if (!user) return; // wait for auth load
    // New rule: HR Manager should NOT view this page; redirect to HR dashboard
    if (user.role === 'hr_manager') {
      navigate('/dashboard/hr', { replace: true });
      return;
    }
    const isBuyer = user.userType === 'buyer';
    if (isBuyer) {
      navigate('/');
      return;
    }
    fetchLeaveRequests();
  }, [user]);

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/leave-requests');
      if (response.ok) {
        const data = await response.json();
        // HR Manager sees all and can act; others (non-buyer) also see all but read-only
        setLeaveRequests(data);
      }
    } catch (err) {
      console.error('Error fetching leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    // Guard on client: only hr_manager or admin can invoke
  if (!(user?.role === 'hr_manager')) return; // still only HR can change status
    try {
      const response = await fetch(`http://localhost:5000/api/leave-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Update local state
        setLeaveRequests(prev => 
          prev.map(request => 
            request._id === id ? { ...request, status } : request
          )
        );

        // Add notification
        const request = leaveRequests.find(r => r._id === id);
        const notification = {
          id: Date.now(),
          type: status === 'approved' ? 'success' : 'warning',
          message: `Leave request ${status === 'approved' ? 'approved' : 'rejected'} for ${request?.employeeName}`,
          timestamp: new Date()
        };
        setNotifications(prev => [notification, ...prev]);

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
      }
    } catch (err) {
      console.error('Error updating leave request:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg border-l-4 ${
                notification.type === 'success' 
                  ? 'bg-green-50 border-green-500 text-green-800' 
                  : 'bg-red-50 border-red-500 text-red-800'
              } animate-slide-in`}
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium">{notification.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

  {/* Header (HR Manager is redirected away before this renders) */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Leave Request Management</h1>
            <p className="text-blue-100 mb-6">Manage employee leave requests and approvals</p>
            
            {/* Leave Request Form Button (hidden for buyers by redirect and HR manager by separate redirect) */}
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/leaverequestform')}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-semibold shadow-lg"
              >
                Submit Leave Request
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs (Pending only visible to HR Manager) */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Requests ({leaveRequests.length})
            </button>
            {user?.role === 'hr_manager' && (
              <button
                onClick={() => setFilter('pending')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  filter === 'pending' 
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({leaveRequests.filter(r => r.status === 'pending').length})
              </button>
            )}
            <button
              onClick={() => setFilter('approved')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                filter === 'approved' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({leaveRequests.filter(r => r.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                filter === 'rejected' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({leaveRequests.filter(r => r.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Leave Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6 text-gray-400">📝</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Leave Requests</h3>
            <p className="text-gray-600">No leave requests found for the selected filter</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {request.employeeName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{request.employeeName}</h3>
                        <p className="text-blue-600 font-medium">{request.employeeId}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-blue-900">Start Date</span>
                        </div>
                        <p className="text-blue-800">{new Date(request.startDate).toLocaleDateString()}</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-purple-900">End Date</span>
                        </div>
                        <p className="text-purple-800">{new Date(request.endDate).toLocaleDateString()}</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-green-900">Duration</span>
                        </div>
                        <p className="text-green-800">{request.duration} days</p>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-orange-900">Type</span>
                        </div>
                        <p className="text-orange-800">{request.leaveType}</p>
                      </div>
                    </div>

                    {request.reason && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">Reason</span>
                        </div>
                        <p className="text-gray-700">{request.reason}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-sm">
                        Submitted: {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {request.status === 'pending' && user?.role === 'hr_manager' && (
                    <div className="flex flex-col space-y-3 ml-6">
                      <button
                        onClick={() => handleStatusChange(request._id, 'approved')}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(request._id, 'rejected')}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequestManagement;