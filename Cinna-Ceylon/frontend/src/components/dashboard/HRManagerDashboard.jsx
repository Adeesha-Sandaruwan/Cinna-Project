import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// This dashboard is ONLY for hr_manager role to view & act on pending leave requests
const HRManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // wait until auth loads
    if (user.role !== 'hr_manager') {
      // anyone else gets redirected either to their own dashboard or leave request form
      navigate('/leaverequestform');
      return;
    }
    fetchPending();
  }, [user]);

  const fetchPending = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/leave-requests');
      if (res.ok) {
        const data = await res.json();
        // Only keep pending
        setLeaveRequests(data.filter(r => r.status === 'pending'));
      }
    } catch (e) {
      console.error('Failed to fetch leave requests', e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    if (user?.role !== 'hr_manager') return; // safety
    try {
      const res = await fetch(`http://localhost:5000/api/leave-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setLeaveRequests(prev => prev.filter(r => r._id !== id)); // remove from pending list
      }
    } catch (e) {
      console.error('Failed to update request', e);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading pending leave requests...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">HR Manager - Pending Leave Approvals</h1>
        {leaveRequests.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center text-gray-600">No pending leave requests 🎉</div>
        ) : (
          <div className="space-y-6">
            {leaveRequests.map(req => (
              <div key={req._id} className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row md:items-start md:justify-between border border-gray-200">
                <div className="flex-1 mb-4 md:mb-0">
                  <h2 className="text-xl font-semibold text-gray-900">{req.employeeName}</h2>
                  <p className="text-sm text-gray-500 mb-2">ID: {req.employeeId}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="font-medium text-gray-700">Start:</span>{' '}
                      <span>{new Date(req.startDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">End:</span>{' '}
                      <span>{new Date(req.endDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Duration:</span>{' '}
                      <span>{req.duration} days</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>{' '}
                      <span>{req.leaveType}</span>
                    </div>
                  </div>
                  {req.reason && (
                    <p className="text-gray-700 text-sm"><span className="font-medium">Reason:</span> {req.reason}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Submitted {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateStatus(req._id, 'approved')}
                    className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium shadow"
                  >Approve</button>
                  <button
                    onClick={() => updateStatus(req._id, 'rejected')}
                    className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow"
                  >Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HRManagerDashboard;
