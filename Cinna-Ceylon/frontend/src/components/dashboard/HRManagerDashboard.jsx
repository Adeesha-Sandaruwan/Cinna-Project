import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './HRManagerDashboard.css';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import jsPDF from 'jspdf';
import logo from '../../assets/images/logo.png';

const CATEGORY_LABELS = {
  delivery_manager: 'Delivery Manager',
  product_manager: 'Product Manager',
  financial_manager: 'Financial Manager',
  other: 'Other'
};

const KNOWN_LEAVE_TYPES = ['Annual', 'Sick', 'Personal', 'Emergency', 'Maternity', 'Paternity'];

const STATUS_COLORS = { approved: '#16a34a', pending: '#f59e0b', rejected: '#dc2626' };
const TYPE_COLORS = { Annual: '#f59e0b', Sick: '#ef4444', Personal: '#3b82f6', Emergency: '#10b981', Maternity: '#a855f7', Paternity: '#22c55e' };

const HRManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all'); // all | delivery_manager | admin | product_manager | financial_manager | other

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'hr_manager') {
      navigate('/leaverequestform');
      return;
    }
    fetchAllRequests();
  }, [user]);

  const fetchAllRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/leave-requests');
      if (res.ok) {
        const data = await res.json();
        setAllRequests(data);
      }
    } catch (e) {
      console.error('Failed to fetch leave requests', e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    if (user?.role !== 'hr_manager') return;
    try {
      const res = await fetch(`http://localhost:5000/api/leave-requests/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
      if (res.ok) {
        // Refresh list after update
        fetchAllRequests();
      }
    } catch (e) {
      console.error('Failed to update request', e);
    }
  };

  // Normalize employee category into a stable key from the request
  const normalizeCategory = (req) => {
    const raw = (req?.category || req?.employeeType || req?.role || '')
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '_');
    if (raw === 'delivery_manager' || raw === 'delivery') return 'delivery_manager';
    if (raw === 'admin') return 'other';
    // Map legacy HR values to product_manager per new naming
    if (raw === 'product_manager' || raw === 'hr_manager' || raw === 'hrmanager' || raw === 'hr') return 'product_manager';
    if (raw === 'financial_manager' || raw === 'finance_manager' || raw === 'financial' || raw === 'finance') return 'financial_manager';
    return 'other';
  };

  const categorizedRequests = useMemo(() => ({
    pending: allRequests.filter(r => r.status === 'pending'),
    approved: allRequests.filter(r => r.status === 'approved'),
    rejected: allRequests.filter(r => r.status === 'rejected'),
  }), [allRequests]);

  const byTypeCounts = useMemo(() => {
    const list = categorizedRequests[activeTab] || [];
    const counts = { all: list.length, delivery_manager: 0, product_manager: 0, financial_manager: 0, other: 0 };
    for (const r of list) {
      const key = normalizeCategory(r);
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [categorizedRequests, activeTab]);

  const statusChartData = useMemo(() => {
    const base = { approved: 0, pending: 0, rejected: 0 };
    for (const r of allRequests) {
      const s = (r?.status || '').toString().toLowerCase();
      if (base.hasOwnProperty(s)) base[s] += 1;
    }
    return [
      { name: 'Approved', key: 'approved', value: base.approved },
      { name: 'Pending', key: 'pending', value: base.pending },
      { name: 'Rejected', key: 'rejected', value: base.rejected },
    ];
  }, [allRequests]);

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      let y = margin;

      try {
        const img = new Image();
        img.src = logo;
        doc.addImage(img, 'PNG', margin, y, 50, 50);
      } catch (_) {}

      doc.setFontSize(18); doc.setTextColor('#92400e');
      doc.text('CinnaCeylon - Leave Requests Report', margin + 60, y + 18);
      doc.setFontSize(10); doc.setTextColor('#6b7280');
      doc.text('Email: info@cinnaceylon.com  •  www.cinnaceylon.com', margin + 60, y + 36);
      doc.setDrawColor('#d97706'); doc.setLineWidth(2);
      doc.line(margin, y + 60, pageWidth - margin, y + 60);
      y += 80;

      const total = allRequests.length;
      const approved = allRequests.filter(r => (r?.status || '').toLowerCase() === 'approved').length;
      const pending = allRequests.filter(r => (r?.status || '').toLowerCase() === 'pending').length;
      const rejected = allRequests.filter(r => (r?.status || '').toLowerCase() === 'rejected').length;
      const uniqueEmployees = new Set(allRequests.map(r => `${r?.employeeName || ''}|${r?.employeeId || ''}`)).size;

      doc.setFontSize(12); doc.setTextColor('#92400e');
      doc.text('Summary', margin, y); y += 16; doc.setFontSize(11); doc.setTextColor('#111111');
      doc.text(`Total Requests: ${total}`, margin, y); y += 14;
      doc.text(`Approved: ${approved}   Pending: ${pending}   Rejected: ${rejected}`, margin, y); y += 14;
      doc.text(`Employees: ${uniqueEmployees}`, margin, y); y += 20;

      const ensureSpace = (h = 16) => { if (y + h > pageHeight - margin) { doc.addPage(); y = margin; } };

      doc.setFontSize(12); doc.setTextColor('#92400e');
      doc.text('Requests', margin, y); y += 12; doc.setTextColor('#111111');

      const header = ['Employee', 'ID', 'Category', 'Type', 'Start', 'End', 'Days', 'Status'];
      const colX = [margin, margin + 150, margin + 220, margin + 320, margin + 380, margin + 440, margin + 500, margin + 550];
      doc.setFontSize(10); doc.setTextColor('#374151');
      header.forEach((h, i) => doc.text(h, colX[i], y));
      doc.setDrawColor('#fbbf24'); doc.setLineWidth(1); doc.line(margin, y + 4, pageWidth - margin, y + 4);
      y += 16; doc.setTextColor('#111111');

      const sorted = [...allRequests].sort((a, b) => new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0));
      sorted.forEach((r) => {
        ensureSpace(18);
        const name = (r?.employeeName || '').toString() || '-';
        const id = (r?.employeeId || '').toString() || '-';
        const catKey = normalizeCategory(r);
        const category = CATEGORY_LABELS[catKey] || catKey;
        const type = (r?.leaveType || '').toString() || '-';
        const start = r?.startDate ? new Date(r.startDate).toLocaleDateString() : '-';
        const end = r?.endDate ? new Date(r.endDate).toLocaleDateString() : '-';
        const days = Number.isFinite(r?.duration) ? Number(r.duration) : calculateWorkingDays(r?.startDate, r?.endDate);
        const status = (r?.status || '').toString();

        doc.text(name, colX[0], y);
        doc.text(id, colX[1], y);
        doc.text(category, colX[2], y);
        doc.text(type, colX[3], y);
        doc.text(start, colX[4], y);
        doc.text(end, colX[5], y);
        doc.text(`${days}`, colX[6], y);
        doc.setTextColor(status.toLowerCase()==='approved' ? '#16a34a' : status.toLowerCase()==='rejected' ? '#dc2626' : '#f59e0b');
        doc.text(status, colX[7], y);
        doc.setTextColor('#111111');
        y += 16;

        if (r?.reason) {
          const wrapped = doc.splitTextToSize(`Reason: ${String(r.reason)}`, pageWidth - 2 * margin);
          wrapped.forEach(line => { ensureSpace(14); doc.text(line, margin, y); y += 12; });
          y += 4;
        }
      });

      if (y > pageHeight - margin - 30) { doc.addPage(); y = margin; }
      doc.setFontSize(9); doc.setTextColor('#6b7280');
      doc.text('Report generated by CinnaCeylon', pageWidth / 2, pageHeight - 30, { align: 'center' });
      doc.text('Contact: info@cinnaceylon.com', pageWidth / 2, pageHeight - 16, { align: 'center' });

      const filename = `leave-requests-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (e) {
      alert('Failed to generate PDF.');
    }
  };

  const categoryStackData = useMemo(() => {
    const buckets = {
      delivery_manager: Object.fromEntries(KNOWN_LEAVE_TYPES.map(k => [k, 0])),
      product_manager: Object.fromEntries(KNOWN_LEAVE_TYPES.map(k => [k, 0])),
      financial_manager: Object.fromEntries(KNOWN_LEAVE_TYPES.map(k => [k, 0])),
      other: Object.fromEntries(KNOWN_LEAVE_TYPES.map(k => [k, 0])),
    };
    for (const r of allRequests) {
      const cat = normalizeCategory(r);
      const lt = (r?.leaveType || '').toString();
      if (!KNOWN_LEAVE_TYPES.includes(lt)) continue;
      if (!buckets[cat]) continue;
      buckets[cat][lt] += 1;
    }
    return Object.entries(buckets).map(([key, values]) => ({
      categoryKey: key,
      category: CATEGORY_LABELS[key] || key,
      ...values,
    }));
  }, [allRequests]);

  // Helpers for UI details
  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    const sizes = ['B','KB','MB','GB'];
    const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
    const val = (bytes / Math.pow(1024, i)).toFixed(1);
    return `${val} ${sizes[i]}`;
  };

  const categoryLabel = (req) => {
    const key = normalizeCategory(req);
    const map = {
      delivery_manager: 'Delivery Manager',
      product_manager: 'Product Manager',
      financial_manager: 'Financial Manager',
      other: 'Other'
    };
    return map[key] || 'Other';
  };

  // Fallback: calculate working days if duration is missing
  const isWeekend = (date) => {
    const d = new Date(date).getDay();
    return d === 0 || d === 6;
  };
  const calculateWorkingDays = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    let count = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    let cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const renderList = (requests) => {
    const visible = typeFilter === 'all' ? requests : requests.filter(r => normalizeCategory(r) === typeFilter);
    if (visible.length === 0) {
      return <div className="text-center py-12 text-gray-500">No requests in this category.</div>;
    }
    return (
      <div className="space-y-4">
        {visible.map(req => (
          <div key={req._id} className="hr-card bg-white rounded-xl shadow-md p-5 border border-gray-100 transition-shadow hover:shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{req.employeeName}</h3>
                <p className="text-xs text-gray-400">ID: {req.employeeId || '—'}</p>
              </div>
              <div className={`hr-badge ${req.status === 'approved' ? 'hr-badge--approved' : req.status === 'rejected' ? 'hr-badge--rejected' : 'hr-badge--pending'}`}>
                {req.status}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4 text-sm">
              <InfoItem label="Start Date" value={new Date(req.startDate).toLocaleDateString()} />
              <InfoItem label="End Date" value={new Date(req.endDate).toLocaleDateString()} />
              <InfoItem label="Duration" value={`${(Number.isFinite(req.duration) ? req.duration : calculateWorkingDays(req.startDate, req.endDate)) || 0} days`} />
              <InfoItem label="Leave Type" value={req.leaveType || '—'} />
              <InfoItem label="Employee ID" value={req.employeeId || '—'} />
              <InfoItem label="Submitted" value={req.createdAt ? new Date(req.createdAt).toLocaleString() : '—'} />
              <InfoItem label="Employee Type" value={categoryLabel(req)} />
              <InfoItem
                label="Certification"
                value={
                  req.certificationUrl
                    ? (
                        <>
                          <a
                            href={req.certificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="text-amber-700 hover:underline"
                          >
                            {req.certificationName || 'Download certification'}
                          </a>
                          {` • ${(req.certificationMime || '').split('/').pop()?.toUpperCase() || ''} • ${formatBytes(req.certificationSize)}`}
                        </>
                      )
                    : (req.certificationName
                        ? `${req.certificationName} • ${(req.certificationMime || '').split('/').pop()?.toUpperCase() || ''} • ${formatBytes(req.certificationSize)}`
                        : '—')
                }
              />
            </div>
            {req.reason && <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md"><strong>Reason:</strong> {req.reason}</p>}
            {req.status === 'pending' && (
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button onClick={() => updateStatus(req._id, 'approved')} className="hr-btn hr-btn--approve">Approve</button>
                <button onClick={() => updateStatus(req._id, 'rejected')} className="hr-btn hr-btn--reject">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>;
  }

  return (
    <div className="hr-dashboard min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="hr-hero mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">Leave Management Dashboard</h1>
              <p className="mt-1">Review and manage employee leave requests.</p>
            </div>
            <button
              onClick={handleExportPDF}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow-md hover:shadow-lg hover:from-red-600 hover:to-pink-600 transition"
            >
              📄 Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-200">
            <h3 className="text-xl font-bold text-[#4b2e14] mb-2">Requests by Status</h3>
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {statusChartData.map((entry, index) => (
                      <Cell key={`c-${index}`} fill={STATUS_COLORS[entry.key]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-200">
            <h3 className="text-xl font-bold text-[#4b2e14] mb-2">Leave by Category & Type</h3>
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStackData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {KNOWN_LEAVE_TYPES.map((k) => (
                    <Bar key={k} dataKey={k} stackId="a" fill={TYPE_COLORS[k]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-amber-100 bg-amber-50/60">
                <h3 className="font-semibold text-[#4b2e14]">Categories</h3>
                <p className="text-xs text-amber-900/60">Filter by leave type</p>
              </div>
              <nav className="p-2">
                <button onClick={() => setTypeFilter('all')} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-lg border-l-4 mb-2 transition ${typeFilter==='all' ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-transparent text-gray-700 hover:bg-amber-50/60'}`}>
                  <span>All</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">{byTypeCounts.all}</span>
                </button>
                <button onClick={() => setTypeFilter('delivery_manager')} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-lg border-l-4 mb-2 transition ${typeFilter==='delivery_manager' ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-transparent text-gray-700 hover:bg-amber-50/60'}`}>
                  <span>Delivery Manager</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">{byTypeCounts.delivery_manager}</span>
                </button>
                <button onClick={() => setTypeFilter('product_manager')} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-lg border-l-4 mb-2 transition ${typeFilter==='product_manager' ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-transparent text-gray-700 hover:bg-amber-50/60'}`}>
                  <span>Product Manager</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">{byTypeCounts.product_manager}</span>
                </button>
                <button onClick={() => setTypeFilter('financial_manager')} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-lg border-l-4 mb-2 transition ${typeFilter==='financial_manager' ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-transparent text-gray-700 hover:bg-amber-50/60'}`}>
                  <span>Financial Manager</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">{byTypeCounts.financial_manager}</span>
                </button>
                <button onClick={() => setTypeFilter('other')} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-lg border-l-4 transition ${typeFilter==='other' ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-transparent text-gray-700 hover:bg-amber-50/60'}`}>
                  <span>Other</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">{byTypeCounts.other}</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <section className="lg:col-span-9">
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200">
              <div className="border-b border-amber-100">
                <nav className="-mb-px flex gap-6 px-6">
                  <TabButton title="Pending" count={categorizedRequests.pending.length} isActive={activeTab === 'pending'} onClick={() => setActiveTab('pending')} />
                  <TabButton title="Approved" count={categorizedRequests.approved.length} isActive={activeTab === 'approved'} onClick={() => setActiveTab('approved')} />
                  <TabButton title="Rejected" count={categorizedRequests.rejected.length} isActive={activeTab === 'rejected'} onClick={() => setActiveTab('rejected')} />
                </nav>
              </div>
              <div className="p-6">
                {renderList(categorizedRequests[activeTab])}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ title, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`hr-tab ${isActive ? 'is-active' : ''}`}>
    {title} <span className={`hr-tab__count ${isActive ? 'is-active' : ''}`}>{count}</span>
  </button>
);

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 font-medium">{label}</p>
    <p className="font-semibold text-gray-800">{value}</p>
  </div>
);

export default HRManagerDashboard;
