import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { FiBell } from 'react-icons/fi';

function useMyIdentity() {
  const { user } = useAuth();
  const employeeId = (user?.employeeId || user?.empId || user?.employeeCode || localStorage.getItem('lr:employeeId') || '').toString();
  const employeeName = (user?.profile?.name || user?.username || user?.name || localStorage.getItem('lr:employeeName') || '').toString();
  return { employeeId, employeeName, role: user?.role, userType: user?.userType };
}

function useMyLeavesPoller(isActive) {
  const [myLeaves, setMyLeaves] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const prevStatusRef = useRef({});
  const { employeeId, employeeName } = useMyIdentity();

  const isMine = (r) => {
    const idMatch = employeeId && r?.employeeId && r.employeeId.toString().toLowerCase() === employeeId.toLowerCase();
    const nameMatch = employeeName && r?.employeeName && r.employeeName.toString().toLowerCase() === employeeName.toLowerCase();
    return idMatch || nameMatch;
  };

  useEffect(() => {
    if (!isActive) return;
    let timer;
    const fetcher = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/leave-requests');
        const data = res.ok ? await res.json() : [];
        const mine = Array.isArray(data) ? data.filter(isMine) : [];
        setMyLeaves(mine);

        const nextAlerts = [];
        for (const r of mine) {
          const k = r._id;
          const prev = prevStatusRef.current[k];
          if (prev && prev !== r.status && (r.status === 'approved' || r.status === 'rejected')) {
            nextAlerts.push({
              id: `${k}-${r.status}`,
              type: r.status,
              message: `Your leave request (${new Date(r.startDate).toLocaleDateString()} - ${new Date(r.endDate).toLocaleDateString()}) was ${r.status}.`,
              at: new Date().toISOString(),
            });
          }
        }
        if (nextAlerts.length) setAlerts((a) => [...nextAlerts, ...a].slice(0, 20));

        const map = {};
        for (const r of mine) map[r._id] = r.status;
        prevStatusRef.current = map;
      } catch (_) {
        // ignore network errors
      } finally {
        timer = setTimeout(fetcher, 5000);
      }
    };
    fetcher();
    return () => clearTimeout(timer);
  }, [isActive, employeeId, employeeName]);

  return { myLeaves, alerts, setAlerts };
}

export default function LeaveQuickActions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useMyIdentity();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAllowedContext = useMemo(() => {
    const p = location.pathname.toLowerCase();
    // Hide on HR and Admin dashboards
    if (p.includes('/dashboard/hr')) return false;
    if (p.includes('/dashboard/admin')) return false;
    // Show only on Delivery Manager, Product Manager, and Financial Manager contexts
    return p.endsWith('/delivery-manager') || p.includes('/admin/dashboard') || p.includes('/financial-report-form');
  }, [location.pathname]);

  const currentType = useMemo(() => {
    const p = location.pathname.toLowerCase();
    if (p.endsWith('/delivery-manager')) return 'delivery_manager';
    if (p.includes('/admin/dashboard')) return 'product_manager';
    if (p.includes('/financial-report-form')) return 'financial_manager';
    return undefined;
  }, [location.pathname]);

  const { alerts, setAlerts } = useMyLeavesPoller(isAllowedContext && role !== 'hr_manager');

  useEffect(() => {
    const onDown = (e) => { if (open && dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  if (!isAllowedContext || role === 'hr_manager') return null;

  const unread = alerts.length;

  return (
    <div className="fixed top-24 right-6 z-40">
      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(v => !v)}
            className="relative p-2 rounded-full bg-white shadow border hover:bg-amber-50 text-amber-800"
            aria-label="Notifications"
            title="Notifications"
          >
            <FiBell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs h-5 min-w-[20px] px-1 flex items-center justify-center">{unread}</span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border p-3">
              <div className="font-semibold text-gray-800 mb-2">Notifications</div>
              {alerts.length === 0 ? (
                <div className="text-sm text-gray-500">No new updates.</div>
              ) : (
                <div className="max-h-72 overflow-auto space-y-2">
                  {alerts.map((n) => (
                    <div key={n.id} className={`p-2 rounded-md text-sm ${n.type==='approved' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {n.message}
                    </div>
                  ))}
                </div>
              )}
              {alerts.length > 0 && (
                <button onClick={() => setAlerts([])} className="w-full mt-2 text-xs text-gray-600 hover:text-gray-800">Clear</button>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => navigate(currentType ? `/my-leaves?type=${currentType}` : '/my-leaves')}
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold shadow hover:from-amber-700 hover:to-orange-700"
        >
          Leave Requests
        </button>
      </div>
    </div>
  );
}
