
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { downloadCSV } from './downloadCSV';
import { useNavigate } from 'react-router-dom';

const initialForm = {
  username: '',
  email: '',
  password: '',
  userType: 'buyer',
  role: '',
  isAdmin: false,
  profile: { name: '', address: '', phone: '' }
};



const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');


  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
      else toast.error(data.message || 'Failed to fetch users');
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
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

  // Handle form input
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('profile.')) {
      setForm(f => ({ ...f, profile: { ...f.profile, [name.split('.')[1]]: value } }));
    } else if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Create user (popup)
  const handleCreate = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { ...form };
      if (!form.password) delete body.password;
      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('User created');
        setForm(initialForm);
        setShowCreate(false);
        fetchUsers();
      } else {
        toast.error(data.message || 'Create failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };


  // Edit user (popup)
  const handleEdit = user => {
    setForm({
      username: user.username,
      email: user.email,
      password: '',
      userType: user.userType,
      role: user.role || '',
      isAdmin: user.isAdmin,
      profile: {
        name: user.profile?.name || '',
        address: user.profile?.address || '',
        phone: user.profile?.phone || ''
      }
    });
    setEditingId(user._id);
  };

  // Update user (popup)
  const handleUpdate = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { ...form };
      if (!form.password) delete body.password;
      const res = await fetch(`http://localhost:5000/api/admin/users/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('User updated');
        setForm(initialForm);
        setEditingId(null);
        fetchUsers();
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('User deleted');
        fetchUsers();
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit or create
  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowCreate(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="mb-8">
        <button onClick={() => setShowCreate(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4">Create User</button>
        {/* Create User Modal */}
        {showCreate && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
              <button onClick={handleCancel} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
              <h2 className="text-xl font-semibold mb-4">Create User</h2>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="username" value={form.username} onChange={handleChange} placeholder="Username" className="border p-2 rounded" required />
                <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded" required />
                <input name="password" value={form.password} onChange={handleChange} placeholder="Password" className="border p-2 rounded" type="password" required />
                <select name="userType" value={form.userType} onChange={handleChange} className="border p-2 rounded">
                  <option value="buyer">Buyer</option>
                  <option value="supplier">Supplier</option>
                  <option value="driver">Driver</option>
                </select>
                {/* Only show role for managers */}
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="border p-2 rounded"
                  disabled={form.userType !== 'delivery manager' && form.userType !== 'product manager' && form.userType !== 'finance manager' && form.userType !== 'user manager'}
                >
                  <option value="">Select Role (Managers Only)</option>
                  <option value="delivery manager">Delivery Manager</option>
                  <option value="product manager">Product Manager</option>
                  <option value="finance manager">Finance Manager</option>
                  <option value="user manager">User Manager</option>
                </select>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isAdmin" checked={form.isAdmin} onChange={handleChange} /> Admin
                </label>
                <input name="profile.name" value={form.profile.name} onChange={handleChange} placeholder="Full Name" className="border p-2 rounded" />
                <input name="profile.address" value={form.profile.address} onChange={handleChange} placeholder="Address" className="border p-2 rounded" />
                <input name="profile.phone" value={form.profile.phone} onChange={handleChange} placeholder="Phone" className="border p-2 rounded" />
                <div className="col-span-2 flex gap-2 mt-2">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={loading}>Create</button>
                  <button type="button" onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Edit User Modal */}
        {editingId && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
              <button onClick={handleCancel} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
              <h2 className="text-xl font-semibold mb-4">Edit User</h2>
              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="username" value={form.username} onChange={handleChange} placeholder="Username" className="border p-2 rounded" required />
                <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded" required />
                <input name="password" value={form.password} onChange={handleChange} placeholder="New Password (optional)" className="border p-2 rounded" type="password" />
                <select name="userType" value={form.userType} onChange={handleChange} className="border p-2 rounded">
                  <option value="buyer">Buyer</option>
                  <option value="supplier">Supplier</option>
                  <option value="driver">Driver</option>
                </select>
                {/* Only show role for managers */}
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="border p-2 rounded"
                  disabled={!(form.userType === 'driver' || form.userType === 'supplier' || form.userType === 'buyer') ? false : true}
                >
                  <option value="">Select Role (Managers Only)</option>
                  <option value="delivery manager">Delivery Manager</option>
                  <option value="product manager">Product Manager</option>
                  <option value="finance manager">Finance Manager</option>
                  <option value="user manager">User Manager</option>
                </select>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isAdmin" checked={form.isAdmin} onChange={handleChange} /> Admin
                </label>
                <input name="profile.name" value={form.profile.name} onChange={handleChange} placeholder="Full Name" className="border p-2 rounded" />
                <input name="profile.address" value={form.profile.address} onChange={handleChange} placeholder="Address" className="border p-2 rounded" />
                <input name="profile.phone" value={form.profile.phone} onChange={handleChange} placeholder="Phone" className="border p-2 rounded" />
                <div className="col-span-2 flex gap-2 mt-2">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={loading}>Update</button>
                  <button type="button" onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">All Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="p-2 border">Username</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Admin</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Address</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="text-center">
                  <td className="p-2 border">{u.username}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border capitalize">{u.userType}</td>
                  <td className="p-2 border capitalize">{u.role || '-'}</td>
                  <td className="p-2 border">{u.isAdmin ? 'Yes' : 'No'}</td>
                  <td className="p-2 border">{u.profile?.name || ''}</td>
                  <td className="p-2 border">{u.profile?.address || ''}</td>
                  <td className="p-2 border">{u.profile?.phone || ''}</td>
                  <td className="p-2 border flex gap-2 justify-center">
                    <button onClick={() => handleEdit(u)} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700">Edit</button>
                    <button onClick={() => handleDelete(u._id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Section Link */}
      <div className="mt-12">
        <button onClick={() => navigate('/dashboard/attendance-records')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          View Attendance Records
        </button>
      </div>
    </div>
  );
};


export default AdminDashboard;
