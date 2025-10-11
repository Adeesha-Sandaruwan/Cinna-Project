import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const Tab = ({ title, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-semibold border ${active ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
  >
    {title} <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${active ? 'bg-amber-200 text-amber-900' : 'bg-gray-100 text-gray-700'}`}>{count}</span>
  </button>
);

function useIdentity() {
  const { user } = useAuth();
  const employeeId = (user?.employeeId || user?.empId || user?.employeeCode || user?.username || user?.email || localStorage.getItem('lr:employeeId') || '').toString();
  const employeeName = (user?.profile?.name || user?.username || user?.name || localStorage.getItem('lr:employeeName') || '').toString();
  return { employeeId, employeeName };
}

export default function MyLeaves() {
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeId, employeeName } = useIdentity();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all'); // all | approved | rejected | pending
  const [error, setError] = useState('');
  const typeParam = useMemo(() => new URLSearchParams(location.search).get('type') || '', [location.search]);

  const normalizeCategory = (r) => {
    const raw = (r?.category || r?.employeeType || '').toString().toLowerCase().replace(/\s+/g, '_');
    if (raw === 'delivery_manager' || raw === 'delivery') return 'delivery_manager';
    if (raw === 'admin') return 'other';
    if (raw === 'product_manager' || raw === 'hr_manager' || raw === 'hrmanager' || raw === 'hr') return 'product_manager';
    if (raw === 'financial_manager' || raw === 'finance_manager' || raw === 'financial' || raw === 'finance') return 'financial_manager';
    return 'other';
  };

  const isMine = (r) => {
    const idMatch = employeeId && r?.employeeId && r.employeeId.toString().toLowerCase() === employeeId.toLowerCase();
    const nameMatch = employeeName && r?.employeeName && r.employeeName.toString().toLowerCase() === employeeName.toLowerCase();
    return idMatch || nameMatch;
  };

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/leave-requests');
      const data = res.ok ? await res.json() : [];
      const mine = Array.isArray(data) ? data.filter(isMine) : [];
      // newest first
      mine.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setRequests(mine);
    } catch (e) {
      setError('Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const baseRequests = useMemo(() => {
    if (!typeParam) return requests;
    return requests.filter(r => normalizeCategory(r) === typeParam);
  }, [requests, typeParam]);

  const filtered = useMemo(() => {
    if (tab === 'all') return baseRequests;
    return baseRequests.filter(r => r.status === tab);
  }, [tab, baseRequests]);

  const counts = useMemo(() => ({
    all: baseRequests.length,
    approved: baseRequests.filter(r => r.status === 'approved').length,
    rejected: baseRequests.filter(r => r.status === 'rejected').length,
    pending: baseRequests.filter(r => r.status === 'pending').length,
  }), [baseRequests]);

  const onDelete = async (id, status) => {
    if (status !== 'pending') {
      alert('Only pending requests can be deleted.');
      return;
    }
    if (!window.confirm('Delete this leave request?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/leave-requests/${id}` , { method: 'DELETE' });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r._id !== id));
        toast.success('Leave request deleted');
      } else {
        toast.error('Failed to delete leave request');
      }
    } catch (_) {}
  };

  const onEdit = (id, status) => {
    if (status !== 'pending') {
      alert('Only pending requests can be edited.');
      return;
    }
    toast.info('Opening leave request for update...');
    navigate(`/leaverequestform?edit=${id}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-amber-200 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#4b2e14]">My Leave Requests</h1>
            <p className="text-amber-800/70 mt-1">View status updates. Edit or delete only while pending.</p>
          </div>
          <button onClick={() => {
            const q = new URLSearchParams();
            if (typeParam) q.set('type', typeParam);
            if (employeeName) q.set('prefillName', employeeName);
            if (employeeId) q.set('prefillId', employeeId);
            const qs = q.toString();
            navigate(`/leaverequestform${qs ? `?${qs}` : ''}`);
          }} className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold shadow hover:from-amber-700 hover:to-orange-700">New Leave Request</button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 mb-6">
          <div className="p-4 flex gap-3 flex-wrap">
            <Tab title="All" count={counts.all} active={tab==='all'} onClick={()=>setTab('all')} />
            <Tab title="Approved" count={counts.approved} active={tab==='approved'} onClick={()=>setTab('approved')} />
            <Tab title="Rejected" count={counts.rejected} active={tab==='rejected'} onClick={()=>setTab('rejected')} />
            <Tab title="Pending" count={counts.pending} active={tab==='pending'} onClick={()=>setTab('pending')} />
          </div>
          {error && <div className="px-6 pb-4 text-red-600">{error}</div>}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-amber-200 shadow">
            <div className="text-gray-400 text-6xl mb-4">🗒️</div>
            <div className="text-gray-700">No requests in this filter.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(req => (
              <div key={req._id} className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{req.employeeName}</h3>
                    <p className="text-xs text-gray-400">ID: {req.employeeId || '—'}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${req.status==='approved'?'bg-green-100 text-green-800': req.status==='rejected'?'bg-red-100 text-red-800':'bg-yellow-100 text-yellow-800'}`}>{req.status}</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Start Date</p>
                    <p className="font-semibold text-gray-800">{new Date(req.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">End Date</p>
                    <p className="font-semibold text-gray-800">{new Date(req.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Duration</p>
                    <p className="font-semibold text-gray-800">{req.duration} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Leave Type</p>
                    <p className="font-semibold text-gray-800">{req.leaveType || '—'}</p>
                  </div>
                </div>
                {req.reason && <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md"><strong>Reason:</strong> {req.reason}</p>}

                {req.status === 'pending' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button onClick={() => onEdit(req._id, req.status)} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow">Update</button>
                    <button onClick={() => onDelete(req._id, req.status)} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow">Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
