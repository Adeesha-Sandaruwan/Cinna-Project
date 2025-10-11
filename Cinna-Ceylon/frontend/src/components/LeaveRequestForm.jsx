import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const LeaveRequestForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get('edit');
  const isEditing = Boolean(editId);

  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    employeeType: '',
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    reason: '',
    certificationFile: null,
    certificationName: '',
    certificationMime: '',
    certificationSize: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [fileName, setFileName] = useState('');
  const { user } = useAuth();

  // Prefill from AuthContext/localStorage or query when creating a new request
  useEffect(() => {
    if (isEditing) return;
    const typeParam = (searchParams.get('type') || '').toString().toLowerCase().replace(/\s+/g, '_');
    const prefillNameParam = (searchParams.get('prefillName') || '').toString();
    const prefillIdParam = (searchParams.get('prefillId') || '').toString();
    const rawRole = (user?.role || '').toString().toLowerCase().replace(/\s+/g, '_');
    const normalizeType = (raw) => {
      if (raw === 'delivery_manager' || raw === 'delivery') return 'delivery_manager';
      if (raw === 'product_manager' || raw === 'hr_manager' || raw === 'hrmanager' || raw === 'hr') return 'product_manager';
      if (raw === 'financial_manager' || raw === 'finance_manager' || raw === 'financial' || raw === 'finance') return 'financial_manager';
      return '';
    };
    const preType = normalizeType(typeParam) || normalizeType(rawRole);

    const storedName = (localStorage.getItem('lr:employeeName') || '').toString();
    const storedId = (localStorage.getItem('lr:employeeId') || '').toString();
    const preName = (prefillNameParam || user?.profile?.name || user?.username || user?.name || storedName || '').toString();
    const preId = (prefillIdParam || user?.employeeId || user?.empId || user?.employeeCode || user?.idCode || storedId || '').toString();

    setFormData(prev => ({
      ...prev,
      employeeName: preName || prev.employeeName,
      employeeId: preId || prev.employeeId,
      employeeType: preType || prev.employeeType
    }));
  }, [isEditing, user, location.search]);

  useEffect(() => {
    const load = async () => {
      if (!isEditing) return;
      try {
        const res = await fetch(`http://localhost:5000/api/leave-requests/${editId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({
            ...prev,
            employeeName: data.employeeName || '',
            employeeId: data.employeeId || '',
            employeeType: (data.employeeType || data.category || '').toString().toLowerCase().replace(/\s+/g, '_'),
            leaveType: data.leaveType || 'Annual',
            startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
            endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
            reason: data.reason || '',
            certificationFile: null,
            certificationName: data.certificationName || '',
            certificationMime: data.certificationMime || '',
            certificationSize: data.certificationSize || 0
          }));
          setFileName(data.certificationName || '');
        }
      } catch (_) {}
    };
    load();
  }, [isEditing, editId]);

  // Validate employee name (letters and spaces only, each word starts with a capital letter)
  const validateEmployeeName = (name) => {
    const onlyLettersSpaces = /^[A-Za-z\s]+$/;
    if (!name.trim()) {
      return 'Employee name is required';
    }
    if (!onlyLettersSpaces.test(name)) {
      return 'Name can only contain letters and spaces (no numbers or special characters)';
    }
    // Enforce Title Case: Each word must start with a capital letter
    const titleCasePattern = /^([A-Z][a-z]+)(\s[A-Z][a-z]+)*$/;
    if (!titleCasePattern.test(name.trim())) {
      return 'Each word must start with a capital letter (e.g., John Doe)';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    return '';
  };

  // Validate employee ID (letters and numbers only)
  const validateEmployeeId = (id) => {
    if (!id.trim()) {
      return 'Employee ID is required';
    }
    if (id.trim().length < 3) {
      return 'Employee ID must be at least 3 characters long';
    }
    const idRegex = /^[A-Za-z0-9]+$/;
    if (!idRegex.test(id.trim())) {
      return 'Employee ID can only contain letters and numbers (no special characters)';
    }
    return '';
  };

  // Check if date is weekend (Saturday = 6, Sunday = 0)
  const isWeekend = (date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  };

  // Get next working day (skip weekends)
  const getNextWorkingDay = (date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    while (isWeekend(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    return nextDay.toISOString().split('T')[0];
  };

  // Validate dates
  const validateDates = (startDate, endDate) => {
    if (!startDate) {
      return 'Start date is required';
    }
    if (!endDate) {
      return 'End date is required';
    }
    if (isWeekend(startDate)) {
      return 'Start date cannot be on a weekend (Saturday or Sunday)';
    }
    if (isWeekend(endDate)) {
      return 'End date cannot be on a weekend (Saturday or Sunday)';
    }
    if (new Date(endDate) < new Date(startDate)) {
      return 'End date must be after start date';
    }
    return '';
  };

  // Helpers: Title Case formatting and blur handler for employee name
  const toTitleCase = (str) =>
    str
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const handleNameBlur = () => {
    const formatted = toTitleCase(formData.employeeName || '');
    setFormData((prev) => ({ ...prev, employeeName: formatted }));
    const err = validateEmployeeName(formatted);
    setValidationErrors((prev) => ({ ...prev, employeeName: err }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error for this field
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }));

    // Defer strict name validation to onBlur to avoid noisy errors while typing

    // Sanitize employee name: allow only letters and spaces while typing
    if (name === 'employeeName') {
      const clean = value.replace(/[^A-Za-z\s]/g, '');
      setFormData(prev => ({ ...prev, employeeName: clean }));
      return;
    }

    // Validate/sanitize employee ID in real-time (block special characters)
    if (name === 'employeeId') {
      const clean = value.replace(/[^A-Za-z0-9]/g, '');
      const idError = validateEmployeeId(clean);
      setValidationErrors(prev => ({
        ...prev,
        employeeId: idError
      }));
      setFormData(prev => ({ ...prev, employeeId: clean }));
      return;
    }

    // Validate dates and skip weekends
    if (name === 'startDate' || name === 'endDate') {
      // Check if selected date is a weekend
      if (isWeekend(value)) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: 'Please select a weekday (Monday-Friday). Weekends are not allowed.'
        }));
        return; // Don't update the date if it's a weekend
      }

      const newFormData = { ...formData, [name]: value };
      if (newFormData.startDate && newFormData.endDate) {
        const dateError = validateDates(newFormData.startDate, newFormData.endDate);
        if (dateError) {
          setValidationErrors(prev => ({
            ...prev,
            dates: dateError
          }));
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (only JPG image or PDF)
      const validTypes = ['image/jpeg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setValidationErrors(prev => ({
          ...prev,
          certificationFile: 'Please upload a valid JPG image or PDF file'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(prev => ({
          ...prev,
          certificationFile: 'File size must be less than 5MB'
        }));
        return;
      }

      setFileName(file.name);
      setFormData(prev => ({
        ...prev,
        certificationFile: file,
        certificationName: file.name,
        certificationMime: file.type,
        certificationSize: file.size
      }));
      setValidationErrors(prev => ({
        ...prev,
        certificationFile: ''
      }));
    }
  };

  // Calculate working days (excluding weekends)
  const calculateWorkingDays = (startDate, endDate) => {
    let count = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    while (start <= end) {
      const dayOfWeek = start.getDay();
      // Count only weekdays (Monday=1 to Friday=5)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      start.setDate(start.getDate() + 1);
    }
    return count;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors({});

    // Validate all fields before submission
    const nameError = validateEmployeeName(formData.employeeName);
    const idError = validateEmployeeId(formData.employeeId);
    const dateError = validateDates(formData.startDate, formData.endDate);
    const typeError = !formData.employeeType ? 'Employee type is required' : '';

    if (nameError || idError || dateError || typeError) {
      setValidationErrors({
        employeeName: nameError,
        employeeId: idError,
        dates: dateError,
        employeeType: typeError
      });
      setError('Please fix all validation errors before submitting');
      setLoading(false);
      return;
    }

    if (!isEditing && !formData.certificationFile) {
      setValidationErrors(prev => ({
        ...prev,
        certificationFile: 'Valid certification is required (JPG or PDF)'
      }));
      setError('Please attach a valid certification file.');
      setLoading(false);
      return;
    }

    try {
      // Persist identity locally so dashboards can filter and notify correctly
      try {
        localStorage.setItem('lr:employeeId', formData.employeeId || '');
        localStorage.setItem('lr:employeeName', formData.employeeName || '');
      } catch(_) {}
      // Calculate working days (excluding weekends)
      const duration = calculateWorkingDays(formData.startDate, formData.endDate);

      if (duration === 0) {
        setError('Leave request must include at least one working day (Monday-Friday)');
        setLoading(false);
        return;
      }

      let response;
      if (isEditing) {
        const payload = {
          employeeName: formData.employeeName,
          employeeId: formData.employeeId,
          employeeType: formData.employeeType,
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason || '',
          duration: duration,
          category: formData.employeeType || 'other'
        };
        response = await fetch(`http://localhost:5000/api/leave-requests/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        const fd = new FormData();
        fd.append('employeeName', formData.employeeName);
        fd.append('employeeId', formData.employeeId);
        fd.append('employeeType', formData.employeeType);
        fd.append('leaveType', formData.leaveType);
        fd.append('startDate', formData.startDate);
        fd.append('endDate', formData.endDate);
        fd.append('reason', formData.reason || '');
        fd.append('duration', String(duration));
        fd.append('category', formData.employeeType || 'other');
        if (formData.certificationFile) {
          fd.append('certificationFile', formData.certificationFile);
        }
        response = await fetch('http://localhost:5000/api/leave-requests', {
          method: 'POST',
          body: fd,
        });
      }

      if (response.ok) {
        if (isEditing) {
          toast.success('Leave request updated successfully');
          navigate('/my-leaves');
        } else {
          toast.success('Leave request submitted successfully');
          const nextRouteByType = {
            delivery_manager: '/delivery-manager',
            admin: '/dashboard/admin',
            product_manager: '/admin/dashboard',
            hr_manager: '/dashboard/hr',
            financial_manager: '/financial-report-form',
            other: '/leave-management'
          };
          const next = nextRouteByType[formData.employeeType] || '/leave-management';
          navigate(next);
        }
      } else {
        const errorData = await response.json();
        const msg = errorData.error || 'Failed to submit leave request';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-4 px-3">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#8B4513] mb-2">
            Leave Request Form
          </h1>
          <p className="text-gray-700 text-base">
            Submit your leave request for management review
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-amber-200 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee Information Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Employee Name *
                </label>
                <input
                  type="text"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleChange}
                  onBlur={handleNameBlur}
                  required
                  className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 text-base transition-all duration-200 ${
                    validationErrors.employeeName 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-amber-200 focus:ring-amber-500 focus:border-amber-500'
                  }`}
                  placeholder="Enter your full name"
                />
                {validationErrors.employeeName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.employeeName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Employee ID *
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  inputMode="text"
                  pattern="[A-Za-z0-9]+"
                  aria-invalid={!!validationErrors.employeeId}
                  required
                  className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 text-base transition-all duration-200 ${
                    validationErrors.employeeId 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-amber-200 focus:ring-amber-500 focus:border-amber-500'
                  }`}
                  placeholder="Enter your employee ID"
                />
                {validationErrors.employeeId && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.employeeId}</p>
                )}
              </div>
            </div>

            {/* Employee Type and Certification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Employee Type *
                </label>
                <select
                  name="employeeType"
                  value={formData.employeeType}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 text-base transition-all duration-200 ${
                    validationErrors.employeeType
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-amber-200 focus:ring-amber-500 focus:border-amber-500'
                  }`}
                >
                  <option value="">Select type</option>
                  <option value="delivery_manager">Delivery Manager</option>
                  <option value="product_manager">Product Manager</option>
                  <option value="financial_manager">Financial Manager</option>
                  <option value="other">Other</option>
                </select>
                {validationErrors.employeeType && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.employeeType}</p>
                )}
              </div>

              {/* Valid Certification (JPG or PDF) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valid Certification (JPG or PDF) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    name="certificationFile"
                    accept="image/jpeg,application/pdf,.jpg,.jpeg,.pdf"
                    onChange={handleFileChange}
                    required={!isEditing}
                    aria-invalid={!!validationErrors.certificationFile}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                </div>
                {fileName && (
                  <p className="mt-1 text-xs text-gray-600">Selected: {fileName}</p>
                )}
                {validationErrors.certificationFile && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.certificationFile}</p>
                )}
              </div>
            </div>

            {/* Leave Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Leave Type *
              </label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              >
                <option value="Annual">Annual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Personal">Personal Leave</option>
                <option value="Emergency">Emergency Leave</option>
                <option value="Maternity">Maternity Leave</option>
                <option value="Paternity">Paternity Leave</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-base transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-base transition-all duration-200"
                />
              </div>
            </div>

            {/* Date Validation Error */}
            {validationErrors.dates && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                âš ï¸ {validationErrors.dates}
              </div>
            )}

            {/* Duration Display */}
            {formData.startDate && formData.endDate && !validationErrors.dates && (
              <div className="bg-amber-50 rounded-xl p-3 border-2 border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-amber-800">
                    Total Duration (Working Days): {calculateWorkingDays(formData.startDate, formData.endDate)} days
                  </span>
                  <span className="text-xs text-amber-600">
                    (Weekends excluded)
                  </span>
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Leave
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base"
                placeholder="Please provide a brief reason for your leave request..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  const typeParam = (searchParams.get('type') || '').toString().toLowerCase().replace(/\s+/g, '_');
                  const rawRole = (user?.role || '').toString().toLowerCase().replace(/\s+/g, '_');
                  const rawType = typeParam || formData.employeeType || rawRole;
                  const t = (raw => {
                    if (raw === 'delivery_manager' || raw === 'delivery') return 'delivery_manager';
                    if (raw === 'product_manager' || raw === 'hr_manager' || raw === 'hrmanager' || raw === 'hr') return 'product_manager';
                    if (raw === 'financial_manager' || raw === 'finance_manager' || raw === 'financial' || raw === 'finance') return 'financial_manager';
                    return '';
                  })(rawType);
                  const map = {
                    delivery_manager: '/delivery-manager',
                    product_manager: '/admin/dashboard',
                    financial_manager: '/financial-report-form'
                  };
                  navigate(map[t] || '/');
                }}
                className="flex-1 px-5 py-2.5 border-2 border-amber-300 text-gray-700 rounded-xl hover:bg-amber-50 transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-4 border-2 border-amber-200 shadow-lg">
          <div className="text-center">
            <h3 className="text-lg font-bold text-[#8B4513] mb-2">What happens next?</h3>
            <p className="text-gray-800 text-base">
              Your leave request will be submitted to management for review. 
              You'll be notified once it's approved or rejected.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-amber-800">
          <p className="text-sm font-medium">CinnaCeylon Employee Leave Management System</p>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestForm;

