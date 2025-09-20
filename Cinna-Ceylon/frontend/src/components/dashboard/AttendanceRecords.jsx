import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { downloadCSV } from './downloadCSV';
import { useNavigate } from 'react-router-dom';

const AttendanceRecords = () => {
  const [attendance, setAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [filter, setFilter] = useState({ username: '', email: '', role: '', status: '', date: '' });
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Fetch all attendance records
  const fetchAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/attendance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setAttendance(data);
      else toast.error(data.message || 'Failed to fetch attendance');
    } catch (err) {
      toast.error('Network error');
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  // Download attendance report as CSV
  const handleDownloadReport = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/attendance/report', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to download report');
      }
      const csv = await res.text();
      downloadCSV(csv);
    } catch (err) {
      toast.error(err.message || 'Download failed');
    }
  };

  // Filtering logic
  const filtered = attendance.filter(a => {
    return (
      (!filter.username || (a.user?.username || '').toLowerCase().includes(filter.username.toLowerCase())) &&
      (!filter.email || (a.user?.email || '').toLowerCase().includes(filter.email.toLowerCase())) &&
      (!filter.role || (a.role || '').toLowerCase().includes(filter.role.toLowerCase())) &&
      (!filter.status || (a.status || '').toLowerCase() === filter.status.toLowerCase()) &&
      (!filter.date || new Date(a.date).toISOString().slice(0, 10) === filter.date)
    );
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Attendance Records</h1>
        <button onClick={() => navigate('/dashboard/admin')} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700">Back to Dashboard</button>
      </div>
      <div className="flex flex-wrap gap-4 mb-4">
        <input placeholder="Username" value={filter.username} onChange={e => setFilter(f => ({ ...f, username: e.target.value }))} className="border p-2 rounded" />
        <input placeholder="Email" value={filter.email} onChange={e => setFilter(f => ({ ...f, email: e.target.value }))} className="border p-2 rounded" />
        <input placeholder="Role" value={filter.role} onChange={e => setFilter(f => ({ ...f, role: e.target.value }))} className="border p-2 rounded" />
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} className="border p-2 rounded">
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
        </select>
        <input type="date" value={filter.date} onChange={e => setFilter(f => ({ ...f, date: e.target.value }))} className="border p-2 rounded" />
        <button onClick={handleDownloadReport} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Download Report (CSV)</button>
      </div>
      {attendanceLoading ? (
        <div>Loading attendance...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="p-2 border">Username</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a._id} className="text-center">
                  <td className="p-2 border">{a.user?.username || ''}</td>
                  <td className="p-2 border">{a.user?.email || ''}</td>
                  <td className="p-2 border">{a.user?.profile?.name || ''}</td>
                  <td className="p-2 border">{new Date(a.date).toLocaleString()}</td>
                  <td className="p-2 border">{a.role}</td>
                  <td className="p-2 border">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceRecords;
