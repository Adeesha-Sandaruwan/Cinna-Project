import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CATEGORY_LABELS = {
  delivery_manager: 'Delivery Manager',
  product_manager: 'Product Manager',
  financial_manager: 'Financial Manager',
  other: 'Other',
};

const KNOWN_LEAVE_TYPES = ['Annual', 'Sick', 'Personal', 'Emergency', 'Maternity', 'Paternity'];

function normalizeCategory(raw) {
  const v = (raw || '').toString().toLowerCase().replace(/\s+/g, '_');
  if (v === 'delivery_manager' || v === 'delivery') return 'delivery_manager';
  if (v === 'product_manager' || v === 'hr_manager' || v === 'hrmanager' || v === 'hr') return 'product_manager';
  if (v === 'financial_manager' || v === 'finance_manager' || v === 'financial' || v === 'finance') return 'financial_manager';
  return 'other';
}

function useLeaveAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5000/api/leave-requests');
        const body = res.ok ? await res.json() : [];
        if (!alive) return;
        const items = Array.isArray(body) ? body : [];
        setData(items);
      } catch (e) {
        if (!alive) return;
        setError('Failed to load leave requests');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, []);

  const chartData = useMemo(() => {
    // Aggregate duration by (category, leaveType)
    const buckets = {
      delivery_manager: Object.fromEntries(KNOWN_LEAVE_TYPES.map(k => [k, 0])),
      product_manager: Object.fromEntries(KNOWN_LEAVE_TYPES.map(k => [k, 0])),
      financial_manager: Object.fromEntries(KNOWN_LEAVE_TYPES.map(k => [k, 0])),
      other: Object.fromEntries(KNOWN_LEAVE_TYPES.map(k => [k, 0])),
    };

    for (const r of data) {
      const cat = normalizeCategory(r?.category || r?.employeeType);
      const lt = (r?.leaveType || '').toString();
      const dur = Number(r?.duration || 0) || 0;
      if (!KNOWN_LEAVE_TYPES.includes(lt)) continue; // ignore unknown types for now
      if (!buckets[cat]) continue;
      buckets[cat][lt] += dur;
    }

    return Object.entries(buckets).map(([key, values]) => ({
      categoryKey: key,
      category: CATEGORY_LABELS[key] || key,
      ...values,
    }));
  }, [data]);

  return { chartData, loading, error };
}

// Utility fallbacks
function isWeekend(d) { const day = new Date(d).getDay(); return day === 0 || day === 6; }
function workingDays(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start), e = new Date(end);
  if (e < s) return 0;
  let c = 0; const cur = new Date(s);
  while (cur <= e) { const dow = cur.getDay(); if (dow !== 0 && dow !== 6) c++; cur.setDate(cur.getDate() + 1); }
  return c;
}

export default function LeaveAnalytics() {
  const { chartData: categoryData, loading, error } = useLeaveAnalytics();
  const [groupBy, setGroupBy] = useState('category'); // category | employee
  const [status, setStatus] = useState('all'); // all | approved | rejected | pending

  // Re-fetch inside this file to support employee grouping with filters
  const [raw, setRaw] = useState([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/leave-requests');
        const body = res.ok ? await res.json() : [];
        if (!alive) return;
        setRaw(Array.isArray(body) ? body : []);
      } catch (_) {
        if (!alive) setRaw([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    if (status === 'all') return raw;
    return raw.filter(r => (r?.status || '').toString().toLowerCase() === status);
  }, [raw, status]);

  const employeeData = useMemo(() => {
    // Build dynamic buckets per employee
    const map = new Map(); // key -> { label, totals per leave type }
    for (const r of filtered) {
      const name = (r?.employeeName || '').toString() || 'Unknown';
      const id = (r?.employeeId || '').toString();
      const key = `${name}${id ? ` (${id})` : ''}`;
      const lt = (r?.leaveType || '').toString();
      const dur = Number(r?.duration) > 0 ? Number(r.duration) : workingDays(r?.startDate, r?.endDate);
      if (!KNOWN_LEAVE_TYPES.includes(lt)) continue;
      if (!map.has(key)) map.set(key, { label: key, ...Object.fromEntries(KNOWN_LEAVE_TYPES.map(k => [k, 0])) });
      map.get(key)[lt] += dur;
    }
    return Array.from(map.values());
  }, [filtered]);

  // Category data needs to respect status filter as well
  const categoryDataFiltered = useMemo(() => {
    // Recompute buckets similarly but by category
    const buckets = {
      delivery_manager: Object.fromEntries(KNOWN_LEAVE_TYPES.map(k => [k, 0])),
      product_manager: Object.fromEntries(KNOWN_LEAVE_TYPES.map(k => [k, 0])),
      financial_manager: Object.fromEntries(KNOWN_LEAVE_TYPES.map(k => [k, 0])),
      other: Object.fromEntries(KNOWN_LEAVE_TYPES.map(k => [k, 0])),
    };
    for (const r of filtered) {
      const cat = normalizeCategory(r?.category || r?.employeeType);
      const lt = (r?.leaveType || '').toString();
      const dur = Number(r?.duration) > 0 ? Number(r.duration) : workingDays(r?.startDate, r?.endDate);
      if (!KNOWN_LEAVE_TYPES.includes(lt)) continue;
      if (!buckets[cat]) continue;
      buckets[cat][lt] += dur;
    }
    return Object.entries(buckets).map(([key, values]) => ({ categoryKey: key, category: CATEGORY_LABELS[key] || key, ...values }));
  }, [filtered]);

  const data = groupBy === 'category' ? categoryDataFiltered : employeeData;
  const xKey = groupBy === 'category' ? 'category' : 'label';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-[#4b2e14]">Leave Analytics</h1>
              <p className="text-amber-800/70 mt-1">Total working days of leave by {groupBy === 'category' ? 'employee category' : 'employee'} and leave type</p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-1">
                <button onClick={() => setGroupBy('category')} className={`px-3 py-1.5 text-sm rounded-lg ${groupBy==='category' ? 'bg-amber-600 text-white' : 'text-amber-800 hover:bg-amber-100'}`}>By Category</button>
                <button onClick={() => setGroupBy('employee')} className={`px-3 py-1.5 text-sm rounded-lg ${groupBy==='employee' ? 'bg-amber-600 text-white' : 'text-amber-800 hover:bg-amber-100'}`}>By Employee</button>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-1">
                {['all','approved','rejected','pending'].map(s => (
                  <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 text-sm rounded-lg capitalize ${status===s ? 'bg-gray-800 text-white' : 'text-gray-800 hover:bg-gray-100'}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-xl border border-amber-200 p-6 text-center text-gray-600">Loading chart...</div>
        )}
        {error && !loading && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-6 text-center text-red-600">{error}</div>
        )}
        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-amber-200">
            <div className="w-full h-[480px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xKey} interval={0} angle={groupBy==='employee' ? -25 : 0} textAnchor={groupBy==='employee' ? 'end' : 'middle'} height={groupBy==='employee' ? 80 : 40} />
                  <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value, n) => [`${value} day(s)`, n]} />
                  <Legend />
                  {/* Stacked by leave type */}
                  <Bar dataKey="Annual" stackId="a" fill="#f59e0b" name="Annual" />
                  <Bar dataKey="Sick" stackId="a" fill="#ef4444" name="Sick" />
                  <Bar dataKey="Personal" stackId="a" fill="#3b82f6" name="Personal" />
                  <Bar dataKey="Emergency" stackId="a" fill="#10b981" name="Emergency" />
                  <Bar dataKey="Maternity" stackId="a" fill="#a855f7" name="Maternity" />
                  <Bar dataKey="Paternity" stackId="a" fill="#22c55e" name="Paternity" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
