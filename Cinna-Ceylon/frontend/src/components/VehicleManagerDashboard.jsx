import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaCarSide, 
  FaTruck, 
  FaCalendarAlt, 
  FaClipboardCheck, 
  FaHistory, 
  FaExclamationTriangle,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilter,
  FaSearch,
  FaDownload,
  FaTools,
  FaCheckCircle
} from 'react-icons/fa';

// Use the public background image
const cinnamonBg = '/cinnamon-bg.jpeg';

// Custom CSS for animations
const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.8s ease-out;
  }

  .animate-bounceIn {
    animation: bounceIn 0.6s ease-out;
  }

  .animate-slideInRight {
    animation: slideInRight 0.7s ease-out;
  }

  .animate-pulse-slow {
    animation: pulse 3s ease-in-out infinite;
  }

  .vehicle-card {
    animation: fadeInUp 0.8s ease-out;
    animation-fill-mode: both;
  }

  .vehicle-card:nth-child(1) { animation-delay: 0.1s; }
  .vehicle-card:nth-child(2) { animation-delay: 0.2s; }
  .vehicle-card:nth-child(3) { animation-delay: 0.3s; }
  .vehicle-card:nth-child(4) { animation-delay: 0.4s; }

  .table-row {
    animation: fadeInUp 0.5s ease-out;
    animation-fill-mode: both;
  }

  .glass-effect {
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }
`;

// Add styles to head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

const VehicleManagerDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showMaintenanceHistory, setShowMaintenanceHistory] = useState(false);
  const [showAccidentHistory, setShowAccidentHistory] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [accidentHistory, setAccidentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    vehicleType: "",
    capacity: "",
    status: "Available",
    insuranceNo: "",
    insuranceExpDate: "",
    insuranceFile: null,
    serviceDate: "",
    serviceFile: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comprehensive validation functions
  const validateInsuranceNo = (value) => {
    const insurancePattern = /^INS\d{6}$/;
    return insurancePattern.test(value);
  };

  const validateCapacity = (value) => {
    const capacity = parseInt(value);
    return capacity > 0 && capacity <= 50000; // Reasonable capacity limits
  };

  const validateInsuranceExpDate = (value) => {
    if (!value) return false;
    const expDate = new Date(value);
    const today = new Date();
    return expDate > today; // Must be in the future
  };

  const validateServiceDate = (value) => {
    if (!value) return true; // Optional field
    const serviceDate = new Date(value);
    const today = new Date();
    return serviceDate <= today; // Cannot be in the future
  };

  const validateFile = (file, type) => {
    if (!file) return true; // Optional field
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSizeInMB = 5; // 5MB limit
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'Only PDF, JPG, and PNG files are allowed' };
    }
    
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return { valid: false, message: `File size must be less than ${maxSizeInMB}MB` };
    }
    
    return { valid: true };
  };

  // Form validation function
  const validateForm = () => {
    const errors = {};

    // Vehicle Type validation
    if (!form.vehicleType.trim()) {
      errors.vehicleType = 'Vehicle type is required';
    }

    // Capacity validation
    if (!form.capacity) {
      errors.capacity = 'Capacity is required';
    } else if (!validateCapacity(form.capacity)) {
      errors.capacity = 'Capacity must be between 1 and 50,000 kg';
    }

    // Insurance Number validation
    if (!form.insuranceNo.trim()) {
      errors.insuranceNo = 'Insurance number is required';
    } else if (!validateInsuranceNo(form.insuranceNo)) {
      errors.insuranceNo = 'Insurance number must start with "INS" followed by 6 digits (e.g., INS123456)';
    }

    // Insurance Expiry Date validation
    if (!form.insuranceExpDate) {
      errors.insuranceExpDate = 'Insurance expiry date is required';
    } else if (!validateInsuranceExpDate(form.insuranceExpDate)) {
      errors.insuranceExpDate = 'Insurance expiry date must be in the future';
    }

    // Service Date validation (optional)
    if (form.serviceDate && !validateServiceDate(form.serviceDate)) {
      errors.serviceDate = 'Service date cannot be in the future';
    }

    // File validations
    if (form.insuranceFile) {
      const insuranceFileValidation = validateFile(form.insuranceFile, 'insurance');
      if (!insuranceFileValidation.valid) {
        errors.insuranceFile = insuranceFileValidation.message;
      }
    }

    if (form.serviceFile) {
      const serviceFileValidation = validateFile(form.serviceFile, 'service');
      if (!serviceFileValidation.valid) {
        errors.serviceFile = serviceFileValidation.message;
      }
    }

    return errors;
  };

  // Fetch vehicles
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/vehicles")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setVehicles(data);
        setFilteredVehicles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching vehicles:", err);
        setLoading(false);
        setMessage("Error loading vehicles");
      });
  }, []);

  // Filter vehicles based on search and status
  useEffect(() => {
    let filtered = vehicles;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vehicle => 
        vehicle.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.insuranceNo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter && statusFilter !== "") {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }
    
    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, statusFilter]);

  // Handle form input changes with real-time validation
  const handleChange = e => {
    const { name, value, files } = e.target;
    const newValue = files ? files[0] : value;
    
    setForm(f => ({
      ...f,
      [name]: newValue
    }));

    // Real-time validation for each field
    const newErrors = { ...formErrors };

    switch (name) {
      case 'vehicleType':
        if (!value.trim()) {
          newErrors.vehicleType = 'Vehicle type is required';
        } else {
          delete newErrors.vehicleType;
        }
        break;

      case 'capacity':
        if (!value) {
          newErrors.capacity = 'Capacity is required';
        } else if (!validateCapacity(value)) {
          newErrors.capacity = 'Capacity must be between 1 and 50,000 kg';
        } else {
          delete newErrors.capacity;
        }
        break;

      case 'insuranceNo':
        if (!value.trim()) {
          newErrors.insuranceNo = 'Insurance number is required';
        } else if (!validateInsuranceNo(value)) {
          newErrors.insuranceNo = 'Format: INS followed by 6 digits (e.g., INS123456)';
        } else {
          delete newErrors.insuranceNo;
        }
        break;

      case 'insuranceExpDate':
        if (!value) {
          newErrors.insuranceExpDate = 'Insurance expiry date is required';
        } else if (!validateInsuranceExpDate(value)) {
          newErrors.insuranceExpDate = 'Insurance must not be expired';
        } else {
          delete newErrors.insuranceExpDate;
        }
        break;

      case 'serviceDate':
        if (value && !validateServiceDate(value)) {
          newErrors.serviceDate = 'Service date cannot be in the future';
        } else {
          delete newErrors.serviceDate;
        }
        break;

      case 'insuranceFile':
        if (newValue) {
          const validation = validateFile(newValue, 'insurance');
          if (!validation.valid) {
            newErrors.insuranceFile = validation.message;
          } else {
            delete newErrors.insuranceFile;
          }
        } else {
          delete newErrors.insuranceFile;
        }
        break;

      case 'serviceFile':
        if (newValue) {
          const validation = validateFile(newValue, 'service');
          if (!validation.valid) {
            newErrors.serviceFile = validation.message;
          } else {
            delete newErrors.serviceFile;
          }
        } else {
          delete newErrors.serviceFile;
        }
        break;

      default:
        break;
    }

    setFormErrors(newErrors);
  };

  // Generate and export PDF
  const generatePDF = () => {
    // Create PDF content with styling
    const printContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            h1 {
              color: #CC7722;
              text-align: center;
              margin-bottom: 30px;
            }
            .header-info {
              text-align: right;
              margin-bottom: 20px;
              font-size: 12px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #F5EFE6;
              color: #8B4513;
              padding: 12px;
              text-align: left;
              font-size: 14px;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
              font-size: 13px;
            }
            .status {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-available { background: #dcfce7; color: #166534; }
            .status-inuse { background: #dbeafe; color: #1e40af; }
            .status-maintenance { background: #fef9c3; color: #854d0e; }
            .status-outofservice { background: #fee2e2; color: #991b1b; }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>Vehicle Fleet Report</h1>
          <div class="header-info">
            <div>Generated on: ${new Date().toLocaleDateString()}</div>
            <div>Total Vehicles: ${filteredVehicles.length}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Insurance No</th>
                <th>Insurance Expiry</th>
              </tr>
            </thead>
            <tbody>
              ${filteredVehicles.map(vehicle => `
                <tr>
                  <td><strong>${vehicle.vehicleId || '-'}</strong></td>
                  <td>${vehicle.vehicleType || '-'}</td>
                  <td>${vehicle.capacity || '-'}</td>
                  <td>
                    <span class="status status-${vehicle.status?.toLowerCase().replace(/\s+/g, '')}">
                      ${vehicle.status || '-'}
                    </span>
                  </td>
                  <td>${vehicle.insuranceNo || '-'}</td>
                  <td>${vehicle.insuranceExpDate ? new Date(vehicle.insuranceExpDate).toLocaleDateString() : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Cinna Ceylon Vehicle Management System</p>
            <p>This is an automatically generated report. Please verify all information.</p>
          </div>
        </body>
      </html>
    `;
    
    // Open in new window and trigger print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Trigger print dialog after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      // Close the window after printing (optional)
      // printWindow.close();
    }, 250);
  };

  // Add vehicle with comprehensive validation
  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");

    // Perform comprehensive form validation
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setMessage("⚠️ Please fix all validation errors before submitting.");
      
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }

    // Clear any previous errors
    setFormErrors({});
    setIsSubmitting(true);

    try {
      // Check for duplicate insurance numbers
      const existingInsurance = vehicles.find(v => v.insuranceNo === form.insuranceNo);
      if (existingInsurance) {
        setFormErrors({ insuranceNo: 'This insurance number is already in use' });
        setMessage("⚠️ Insurance number already exists. Please use a unique number.");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        // Skip vehicleId as it should be auto-generated by the backend
        if (value && key !== 'vehicleId') formData.append(key, value);
      });

      const res = await fetch("http://localhost:5000/api/vehicles", {
        method: "POST",
        body: formData
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage("✅ Vehicle registered successfully!");
        setForm({
          vehicleType: "",
          capacity: "",
          status: "Available",
          insuranceNo: "",
          insuranceExpDate: "",
          insuranceFile: null,
          serviceDate: "",
          serviceFile: null,
        });
        
        // Clear form errors
        setFormErrors({});
        
        // Refresh vehicle list
        const refreshRes = await fetch("http://localhost:5000/api/vehicles");
        const refreshData = await refreshRes.json();
        setVehicles(refreshData);
        setFilteredVehicles(refreshData);
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Clear success message after 5 seconds
        setTimeout(() => setMessage(""), 5000);
        
      } else {
        setMessage(`❌ ${data.message || "Error adding vehicle."}`);
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      setMessage("🔌 Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete vehicle
  const handleDelete = async id => {
    setMessage("");
    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Vehicle deleted.");
        setVehicles(v => v.filter(vehicle => vehicle._id !== id));
      } else {
        setMessage(data.message || "Error deleting vehicle.");
      }
    } catch {
      setMessage("Network error. Please try again.");
    }
  };

  // Fetch maintenance history
  const fetchMaintenanceHistory = async (vehicleId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}/maintenance-history`);
      const data = await res.json();
      setMaintenanceHistory(data);
      setSelectedVehicle(vehicleId);
      setShowMaintenanceHistory(true);
    } catch (error) {
      console.error("Error fetching maintenance history:", error);
    }
  };

  // Fetch accident history
  const fetchAccidentHistory = async (vehicleId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}/accident-history`);
      const data = await res.json();
      setAccidentHistory(data);
      setSelectedVehicle(vehicleId);
      setShowAccidentHistory(true);
    } catch (error) {
      console.error("Error fetching accident history:", error);
    }
  };

  // Close modals
  const closeModals = () => {
    setShowMaintenanceHistory(false);
    setShowAccidentHistory(false);
    setSelectedVehicle(null);
  };

  // Download maintenance report
  const downloadMaintenanceReport = (record) => {
    // Generate professional HTML report for maintenance
    const reportHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Maintenance Report</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 40px; background: #f8f9fa; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 3px solid #28a745; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #8B4513; margin-bottom: 10px; }
          .report-title { font-size: 24px; color: #28a745; font-weight: bold; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
          .info-item { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; }
          .label { font-weight: bold; color: #495057; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .value { font-size: 16px; color: #212529; margin-top: 5px; }
          .description { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; }
          .status { padding: 5px 15px; border-radius: 20px; font-weight: bold; display: inline-block; }
          .status.completed { background: #d4edda; color: #155724; }
          .status.inprogress { background: #fff3cd; color: #856404; }
          .cost-highlight { font-size: 18px; font-weight: bold; color: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌿 Cinna Ceylon</div>
            <div class="report-title">VEHICLE MAINTENANCE REPORT</div>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="label">Vehicle ID</div>
              <div class="value">${record.vehicle?.vehicleId || selectedVehicle}</div>
            </div>
            <div class="info-item">
              <div class="label">Service Date</div>
              <div class="value">${new Date(record.serviceDate).toLocaleDateString()}</div>
            </div>
            <div class="info-item">
              <div class="label">Service Cost</div>
              <div class="value cost-highlight">LKR ${record.serviceCost ? record.serviceCost.toLocaleString() : 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="label">Status</div>
              <div class="value">
                <span class="status ${(record.status || 'completed').toLowerCase().replace(' ', '')}">${record.status || 'Completed'}</span>
              </div>
            </div>
            ${record.mechanicName ? `
            <div class="info-item">
              <div class="label">Mechanic</div>
              <div class="value">${record.mechanicName}</div>
            </div>` : ''}
            ${record.nextServiceDue ? `
            <div class="info-item">
              <div class="label">Next Service Due</div>
              <div class="value">${new Date(record.nextServiceDue).toLocaleDateString()}</div>
            </div>` : ''}
          </div>

          <div class="description">
            <div class="label">Service Description</div>
            <div class="value">${record.description || 'Regular maintenance service'}</div>
            ${record.partsReplaced ? `
            <br><br>
            <div class="label">Parts Replaced</div>
            <div class="value">${record.partsReplaced}</div>` : ''}
          </div>

          <div class="footer">
            <p>Report Generated: ${new Date().toLocaleString()}</p>
            <p>Cinna Ceylon Vehicle Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const element = document.createElement('a');
    const file = new Blob([reportHTML], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `maintenance-report-${new Date(record.serviceDate).toISOString().split('T')[0]}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Download accident report
  const downloadAccidentReport = (record) => {
    // Generate professional HTML report for accident
    const reportHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Accident Report</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 40px; background: #f8f9fa; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 3px solid #dc3545; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #8B4513; margin-bottom: 10px; }
          .report-title { font-size: 24px; color: #dc3545; font-weight: bold; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
          .info-item { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; }
          .label { font-weight: bold; color: #495057; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .value { font-size: 16px; color: #212529; margin-top: 5px; }
          .description { background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f5c6cb; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; }
          .status { padding: 5px 15px; border-radius: 20px; font-weight: bold; display: inline-block; }
          .severity-critical { background: #f8d7da; color: #721c24; }
          .severity-major { background: #ffeaa7; color: #856404; }
          .severity-minor { background: #fff3cd; color: #856404; }
          .repair-completed { background: #d4edda; color: #155724; }
          .repair-inprogress { background: #cce5ff; color: #004085; }
          .repair-pending { background: #f8f9fa; color: #6c757d; }
          .cost-highlight { font-size: 18px; font-weight: bold; color: #dc3545; }
          .urgent { background: #dc3545; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌿 Cinna Ceylon</div>
            <div class="report-title">VEHICLE ACCIDENT REPORT</div>
            ${record.severity === 'Critical' ? '<div class="urgent">⚠️ URGENT - CRITICAL ACCIDENT</div>' : ''}
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="label">Vehicle ID</div>
              <div class="value">${record.vehicle?.vehicleId || selectedVehicle}</div>
            </div>
            <div class="info-item">
              <div class="label">Accident Date</div>
              <div class="value">${record.accidentDate ? new Date(record.accidentDate).toLocaleDateString() : 'Not specified'}</div>
            </div>
            <div class="info-item">
              <div class="label">Accident Cost</div>
              <div class="value cost-highlight">LKR ${record.accidentCost ? record.accidentCost.toLocaleString() : 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="label">Severity Level</div>
              <div class="value">
                <span class="status severity-${(record.severity || 'minor').toLowerCase()}">${record.severity || 'Minor'}</span>
              </div>
            </div>
            ${record.location ? `
            <div class="info-item">
              <div class="label">Location</div>
              <div class="value">${record.location}</div>
            </div>` : ''}
            ${record.driverName ? `
            <div class="info-item">
              <div class="label">Driver Name</div>
              <div class="value">${record.driverName}</div>
            </div>` : ''}
            <div class="info-item">
              <div class="label">Repair Status</div>
              <div class="value">
                <span class="status repair-${(record.repairStatus || 'pending').toLowerCase().replace(' ', '')}">${record.repairStatus || 'Pending'}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="label">Insurance Claim</div>
              <div class="value">${record.insuranceClaim ? '✅ Filed' : '❌ Not Filed'}</div>
            </div>
          </div>

          <div class="description">
            <div class="label">Accident Description</div>
            <div class="value">${record.description || 'Accident report submitted via vehicle management system'}</div>
          </div>

          <div class="footer">
            <p>Report Generated: ${new Date().toLocaleString()}</p>
            <p>Cinna Ceylon Vehicle Management System</p>
            <p style="color: #dc3545; font-weight: bold;">This is an official accident report document</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const element = document.createElement('a');
    const file = new Blob([reportHTML], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `accident-report-${record.accidentDate ? new Date(record.accidentDate).toISOString().split('T')[0] : 'unknown-date'}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-8"
      style={{
        backgroundImage: `url(${cinnamonBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-7xl w-full p-8 bg-gradient-to-br from-white/95 to-amber-50/95 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20 animate-bounceIn">
        {/* Enhanced Header with Modern Design */}
        <div className="relative mb-8 p-6 bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#CD853F] rounded-2xl shadow-xl overflow-hidden animate-slideInRight">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12"></div>
          </div>
          
          {/* Header Content */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FaTruck className="text-3xl text-white animate-bounce" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Vehicle Management
                </h1>
                <p className="text-amber-100 text-lg font-medium mt-1">
                  Fleet Control Center
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white text-sm font-medium">Last Updated</p>
                <p className="text-amber-100 text-xs">
                  {new Date().toLocaleString()}
                </p>
              </div>
              <div className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-full shadow-lg animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  <span>Live Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Available Vehicles Card */}
          <div className="vehicle-card group relative transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-200 rounded-full animate-pulse"></div>
                  <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">Available</p>
                </div>
                <p className="text-4xl font-bold font-mono tracking-tight">
                  {vehicles.filter(v => v.status === 'Available').length}
                </p>
                <p className="text-emerald-100 text-sm font-medium">Vehicles Ready for Deployment</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                <FaCheckCircle className="text-4xl text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-300 to-green-300"></div>
          </div>
          
          {/* In Use Vehicles Card */}
          <div className="vehicle-card group relative transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-200 rounded-full animate-pulse"></div>
                  <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">In Use</p>
                </div>
                <p className="text-4xl font-bold font-mono tracking-tight">
                  {vehicles.filter(v => v.status === 'In Use').length}
                </p>
                <p className="text-blue-100 text-sm font-medium">Currently Active Fleet</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                <FaTruck className="text-4xl text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-indigo-300"></div>
          </div>
          
          {/* Maintenance Vehicles Card */}
          <div className="vehicle-card group relative transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-200 rounded-full animate-pulse"></div>
                  <p className="text-yellow-100 text-sm font-semibold uppercase tracking-wider">Maintenance</p>
                </div>
                <p className="text-4xl font-bold font-mono tracking-tight">
                  {vehicles.filter(v => v.status === 'Maintenance').length}
                </p>
                <p className="text-yellow-100 text-sm font-medium">Under Service & Repair</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                <FaTools className="text-4xl text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 to-orange-300"></div>
          </div>
          
          {/* Total Fleet Card */}
          <div className="vehicle-card group relative transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-200 rounded-full animate-pulse"></div>
                  <p className="text-purple-100 text-sm font-semibold uppercase tracking-wider">Total Fleet</p>
                </div>
                <p className="text-4xl font-bold font-mono tracking-tight">{vehicles.length}</p>
                <p className="text-purple-100 text-sm font-medium">Complete Vehicle Inventory</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                <FaCarSide className="text-4xl text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-300 to-purple-300"></div>
          </div>
        </div>

        {/* Enhanced Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 shadow-lg ${
            message.includes("successfully") 
              ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-500 text-emerald-800" 
              : "bg-gradient-to-r from-red-50 to-pink-50 border-red-500 text-red-800"
          }`}>
            <div className="flex items-center space-x-3">
              {message.includes("successfully") ? (
                <FaCheckCircle className="text-emerald-600 text-xl" />
              ) : (
                <FaExclamationTriangle className="text-red-600 text-xl" />
              )}
              <p className="font-medium">{message}</p>
            </div>
          </div>
        )}

        {/* Accident History Modal */}
        {showAccidentHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-[#CC7722] flex items-center gap-2">
                    <FaExclamationTriangle className="inline-block mr-2" /> Accident History
                  </h3>
                  <button 
                    onClick={closeModals}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                {accidentHistory.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No accident records found.</p>
                ) : (
                  <div className="space-y-4">
                    {accidentHistory.map((record, index) => (
                      <div key={index} className="border-l-4 border-red-500 pl-4 py-4 bg-red-50 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-lg">{record.description || 'Accident Report'}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-medium">Accident Date</p>
                                <p className="text-sm text-gray-800 font-medium">
                                  {record.accidentDate ? new Date(record.accidentDate).toLocaleDateString() : 'Not specified'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-medium">Cost</p>
                                <p className="text-sm text-gray-800 font-medium">
                                  LKR {record.accidentCost ? record.accidentCost.toLocaleString() : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-medium">Severity</p>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                  record.severity === 'Critical' ? 'bg-red-200 text-red-800' :
                                  record.severity === 'Major' ? 'bg-orange-200 text-orange-800' :
                                  'bg-yellow-200 text-yellow-800'
                                }`}>
                                  {record.severity || 'Minor'}
                                </span>
                              </div>
                              {record.location && (
                                <div>
                                  <p className="text-xs text-gray-500 uppercase font-medium">Location</p>
                                  <p className="text-sm text-gray-800">{record.location}</p>
                                </div>
                              )}
                              {record.driverName && (
                                <div>
                                  <p className="text-xs text-gray-500 uppercase font-medium">Driver</p>
                                  <p className="text-sm text-gray-800">{record.driverName}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-medium">Repair Status</p>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                  record.repairStatus === 'Completed' ? 'bg-green-200 text-green-800' :
                                  record.repairStatus === 'In Progress' ? 'bg-blue-200 text-blue-800' :
                                  'bg-gray-200 text-gray-800'
                                }`}>
                                  {record.repairStatus || 'Pending'}
                                </span>
                              </div>
                            </div>
                            {record.accidentReport && (
                              <div className="mt-3">
                                <button
                                  onClick={() => downloadAccidentReport(record)}
                                  className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 text-sm font-medium underline"
                                >
                                  <FaDownload className="text-xs" />
                                  Download Accident Report
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Vehicle Registration Form */}
        <div className="bg-gradient-to-br from-white/95 to-amber-50/80 rounded-2xl shadow-xl border border-white/50 p-8 mb-10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-[#CC7722] to-[#c5a35a] rounded-xl shadow-lg">
                <FaPlus className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8B4513]">Register New Vehicle</h3>
                <p className="text-[#CC7722] text-sm font-medium">Add a new vehicle to your fleet</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-[#CC7722]/10 text-[#CC7722] text-sm font-medium rounded-full">
              Fleet Expansion
            </div>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`p-4 rounded-lg border-l-4 ${
              message.includes('✅') || message.includes('successfully') 
                ? 'bg-green-50 border-green-500 text-green-800' 
                : 'bg-red-50 border-red-500 text-red-800'
            } animate-fadeInUp`}>
              <div className="flex items-center">
                {message.includes('✅') || message.includes('successfully') ? (
                  <FaCheckCircle className="mr-2 text-green-500" />
                ) : (
                  <FaExclamationTriangle className="mr-2 text-red-500" />
                )}
                <p className="font-medium">{message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Type */}
              <div className="space-y-2">
                <label htmlFor="vehicleType" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Vehicle Type <span className="text-red-500">*</span>
                </label>
                <select 
                  id="vehicleType" 
                  name="vehicleType" 
                  value={form.vehicleType} 
                  onChange={handleChange} 
                  required 
                  className={`w-full p-4 border-2 rounded-xl focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium ${
                    formErrors.vehicleType 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-[#CC7722] focus:ring-[#CC7722]/20'
                  }`}
                >
                  <option value="">Choose Vehicle Type</option>
                  <option value="Truck">🚛 Truck</option>
                  <option value="Van">🚐 Van</option>
                  <option value="Bike">🏍️ Bike</option>
                  <option value="Car">🚗 Car</option>
                </select>
                {formErrors.vehicleType && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                    <span>⚠️</span> {formErrors.vehicleType}
                  </p>
                )}
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <label htmlFor="capacity" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Capacity (kg) <span className="text-red-500">*</span>
                </label>
                <input 
                  id="capacity" 
                  name="capacity" 
                  type="number" 
                  placeholder="e.g. 2000" 
                  value={form.capacity} 
                  onChange={handleChange} 
                  required
                  min="1"
                  max="50000"
                  className={`w-full p-4 border-2 rounded-xl focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium ${
                    formErrors.capacity 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-[#CC7722] focus:ring-[#CC7722]/20'
                  }`}
                />
                {formErrors.capacity && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                    <span>⚠️</span> {formErrors.capacity}
                  </p>
                )}
                {!formErrors.capacity && form.capacity && (
                  <p className="text-green-600 text-sm font-medium flex items-center gap-1">
                    <span>✅</span> Valid capacity
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Initial Status
                </label>
                <select 
                  id="status" 
                  name="status" 
                  value={form.status} 
                  onChange={handleChange} 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#CC7722] focus:ring-4 focus:ring-[#CC7722]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
                >
                  <option value="Available">✅ Available</option>
                  <option value="In Use">🚛 In Use</option>
                  <option value="Maintenance">🔧 Maintenance</option>
                  <option value="Out of Service">❌ Out of Service</option>
                </select>
              </div>

              {/* Insurance Number */}
              <div className="space-y-2">
                <label htmlFor="insuranceNo" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Insurance Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    id="insuranceNo" 
                    name="insuranceNo" 
                    placeholder="INS123456" 
                    value={form.insuranceNo} 
                    onChange={handleChange} 
                    required 
                    className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-[#CC7722]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium ${
                      formErrors.insuranceNo 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 focus:border-[#CC7722]'
                    }`}
                    pattern="INS\d{6}"
                    title="Insurance number must start with INS followed by 6 digits"
                  />
                  {formErrors.insuranceNo && (
                    <div className="absolute -bottom-6 left-0 flex items-center space-x-2 text-red-600">
                      <FaExclamationTriangle className="text-sm" />
                      <p className="text-xs font-medium">{formErrors.insuranceNo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Insurance Expiry Date */}
              <div className="space-y-2">
                <label htmlFor="insuranceExpDate" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Insurance Expiry <span className="text-red-500">*</span>
                </label>
                <input 
                  id="insuranceExpDate" 
                  name="insuranceExpDate" 
                  type="date" 
                  value={form.insuranceExpDate} 
                  onChange={handleChange} 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full p-4 border-2 rounded-xl focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium ${
                    formErrors.insuranceExpDate 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-[#CC7722] focus:ring-[#CC7722]/20'
                  }`}
                />
                {formErrors.insuranceExpDate && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                    <span>⚠️</span> {formErrors.insuranceExpDate}
                  </p>
                )}
                {!formErrors.insuranceExpDate && form.insuranceExpDate && (
                  <p className="text-green-600 text-sm font-medium flex items-center gap-1">
                    <span>✅</span> Valid expiry date
                  </p>
                )}
              </div>

              {/* Insurance File */}
              <div className="space-y-2">
                <label htmlFor="insuranceFile" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Insurance Document
                </label>
                <input 
                  id="insuranceFile" 
                  name="insuranceFile" 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  onChange={handleChange} 
                  className={`w-full p-4 border-2 rounded-xl focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#CC7722] file:text-white file:font-medium hover:file:bg-[#A0522D] file:transition-colors ${
                    formErrors.insuranceFile 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-[#CC7722] focus:ring-[#CC7722]/20'
                  }`}
                />
                {formErrors.insuranceFile && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                    <span>⚠️</span> {formErrors.insuranceFile}
                  </p>
                )}
                <p className="text-gray-500 text-xs">
                  Supported formats: PDF, JPG, PNG (Max 5MB)
                </p>
              </div>

              {/* Service Date */}
              <div className="space-y-2">
                <label htmlFor="serviceDate" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Last Service Date
                </label>
                <input 
                  id="serviceDate" 
                  name="serviceDate" 
                  type="date" 
                  value={form.serviceDate} 
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full p-4 border-2 rounded-xl focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium ${
                    formErrors.serviceDate 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-[#CC7722] focus:ring-[#CC7722]/20'
                  }`}
                />
                {formErrors.serviceDate && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                    <span>⚠️</span> {formErrors.serviceDate}
                  </p>
                )}
                <p className="text-gray-500 text-xs">
                  Optional: Last maintenance service date
                </p>
              </div>

              {/* Service File */}
              <div className="space-y-2">
                <label htmlFor="serviceFile" className="block text-sm font-semibold text-[#8B4513] uppercase tracking-wide">
                  Service Document
                </label>
                <input 
                  id="serviceFile" 
                  name="serviceFile" 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  onChange={handleChange} 
                  className={`w-full p-4 border-2 rounded-xl focus:ring-4 transition-all duration-300 bg-white/80 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#CC7722] file:text-white file:font-medium hover:file:bg-[#A0522D] file:transition-colors ${
                    formErrors.serviceFile 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-[#CC7722] focus:ring-[#CC7722]/20'
                  }`}
                />
                {formErrors.serviceFile && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                    <span>⚠️</span> {formErrors.serviceFile}
                  </p>
                )}
                <p className="text-gray-500 text-xs">
                  Supported formats: PDF, JPG, PNG (Max 5MB)
                </p>
              </div>
            </div>

            {/* Validation Summary */}
            {Object.keys(formErrors).length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaExclamationTriangle className="text-red-500 mr-2" />
                  <h4 className="font-semibold text-red-800">Please fix the following errors:</h4>
                </div>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {Object.entries(formErrors).map(([field, error]) => (
                    <li key={field}>
                      <strong className="capitalize">{field.replace(/([A-Z])/g, ' $1')}:</strong> {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form Progress Indicator */}
            {Object.keys(formErrors).length === 0 && (form.vehicleType || form.capacity || form.insuranceNo) && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <p className="text-green-800 font-medium">
                    Form looks good! {Object.keys(validateForm()).length === 0 ? 'Ready to submit.' : 'Please complete all required fields.'}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button 
                type="submit" 
                disabled={Object.keys(formErrors).length > 0 || isSubmitting}
                className={`w-full group relative overflow-hidden py-4 px-8 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 ${
                  Object.keys(formErrors).length > 0 || isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-[#8B4513] via-[#CC7722] to-[#c5a35a] text-white hover:from-[#A0522D] hover:via-[#E4941B] hover:to-[#D4AF37] hover:shadow-2xl transform hover:scale-[1.02]'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      <span>Registering Vehicle...</span>
                    </>
                  ) : (
                    <>
                      <FaPlus className="text-xl group-hover:rotate-90 transition-transform duration-300" />
                      <span className="group-hover:tracking-wider transition-all duration-300">Register Vehicle</span>
                      <FaCarSide className="text-xl group-hover:translate-x-2 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
        {/* Enhanced Vehicle Management Section */}
        <div className="bg-gradient-to-br from-white/95 to-amber-50/80 rounded-2xl shadow-xl border border-white/50 p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-[#8B4513] to-[#CC7722] rounded-xl shadow-lg">
                <FaEye className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8B4513]">Registered Vehicles</h3>
                <p className="text-[#CC7722] text-sm font-medium">Manage your complete fleet</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-[#CC7722]/10 text-[#CC7722] text-sm font-medium rounded-full">
              Fleet Overview
            </div>
          </div>
          
          {/* Enhanced Search and Filter Bar */}
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-50/80 to-orange-50/80 rounded-xl border border-amber-200/50 backdrop-blur-sm">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[280px]">
                <div className="relative group">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#CC7722] transition-colors duration-300" />
                  <input
                    type="text"
                    placeholder="Search by Vehicle ID, Type, or Insurance Number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#CC7722] focus:ring-4 focus:ring-[#CC7722]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium placeholder-gray-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FaFilter className="text-[#CC7722]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#CC7722] focus:ring-4 focus:ring-[#CC7722]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
                >
                  <option value="">All Status</option>
                  <option value="Available">✅ Available</option>
                  <option value="In Use">🚛 In Use</option>
                  <option value="Maintenance">🔧 Maintenance</option>
                  <option value="Out of Service">❌ Out of Service</option>
                </select>
              </div>
              
              <button
                onClick={generatePDF}
                className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                title="Generate PDF Report"
              >
                <FaDownload className="text-sm group-hover:-translate-y-1 transition-transform duration-300" />
                <span className="group-hover:tracking-wider transition-all duration-300">Generate Report</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
              </button>
              
              <div className="px-4 py-2 bg-[#CC7722]/10 text-[#CC7722] text-sm font-semibold rounded-full border border-[#CC7722]/20">
                {filteredVehicles.length} of {vehicles.length} vehicles
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#CC7722]/20 border-t-[#CC7722]"></div>
                <FaTruck className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#CC7722] text-xl" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading your fleet...</p>
            </div>
          ) : (
            <div className="bg-white/60 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm border border-white/50">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#8B4513] to-[#CC7722] text-white">
                      <th className="px-6 py-4 text-left font-semibold">
                        <div className="flex items-center gap-2">
                          <FaCarSide className="text-amber-200" />
                          Vehicle ID
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        <div className="flex items-center gap-2">
                          <FaTruck className="text-amber-200" />
                          Type
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-amber-200" />
                          Capacity
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        <div className="flex items-center gap-2">
                          <FaCheckCircle className="text-amber-200" />
                          Status
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">Insurance Details</th>
                      <th className="px-6 py-4 text-center font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <FaTools className="text-amber-200" />
                          Actions
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredVehicles.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <FaCarSide className="text-4xl text-gray-300" />
                            <p className="text-gray-500 font-medium">
                              {searchTerm || statusFilter ? 'No vehicles match your search criteria' : 'No vehicles registered yet'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredVehicles.map((vehicle, index) => (
                        <tr key={vehicle._id} className="group hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 cursor-pointer">
                          <td className="px-6 py-4" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-[#CC7722] to-[#c5a35a] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {vehicle.vehicleType?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-[#8B4513]">{vehicle.vehicleId || '-'}</p>
                                <p className="text-xs text-gray-500">Vehicle #{index + 1}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>
                            <div className="flex items-center space-x-2">
                              {vehicle.vehicleType === 'Truck' && <FaTruck className="text-[#CC7722]" />}
                              {vehicle.vehicleType === 'Van' && <FaCarSide className="text-[#CC7722]" />}
                              {vehicle.vehicleType === 'Car' && <FaCarSide className="text-[#CC7722]" />}
                              {vehicle.vehicleType === 'Bike' && <FaCarSide className="text-[#CC7722]" />}
                              <span className="font-semibold text-gray-700">{vehicle.vehicleType}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>
                            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-full">
                              {vehicle.capacity} kg
                            </span>
                          </td>
                          <td className="px-6 py-4" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              vehicle.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                              vehicle.status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                              vehicle.status === 'Maintenance' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                vehicle.status === 'Available' ? 'bg-emerald-400' :
                                vehicle.status === 'In Use' ? 'bg-blue-400' :
                                vehicle.status === 'Maintenance' ? 'bg-amber-400' :
                                'bg-red-400'
                              }`}></div>
                              {vehicle.status}
                            </span>
                          </td>
                          <td className="px-6 py-4" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>
                            <div className="space-y-1">
                              <p className="font-medium text-gray-700">{vehicle.insuranceNo}</p>
                              <p className="text-xs text-gray-500">
                                Expires: {vehicle.insuranceExpDate ? new Date(vehicle.insuranceExpDate).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(vehicle._id);
                                }} 
                                className="group relative p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                                title="Delete Vehicle"
                              >
                                <FaTrash className="text-sm group-hover:rotate-12 transition-transform duration-200" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/vehicle/${vehicle._id}/update`);
                                }}
                                className="group relative p-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                                title="Update Vehicle"
                              >
                                <FaEdit className="text-sm group-hover:rotate-12 transition-transform duration-200" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fetchMaintenanceHistory(vehicle._id);
                                }}
                                className="group relative p-2 bg-emerald-500 text-white rounded-lg shadow-lg hover:bg-emerald-600 hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                                title="Maintenance History"
                              >
                                <FaClipboardCheck className="text-sm group-hover:rotate-12 transition-transform duration-200" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fetchAccidentHistory(vehicle._id);
                                }}
                                className="group relative p-2 bg-amber-500 text-white rounded-lg shadow-lg hover:bg-amber-600 hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                                title="Accident History"
                              >
                                <FaExclamationTriangle className="text-sm group-hover:rotate-12 transition-transform duration-200" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Maintenance History Modal */}
        {showMaintenanceHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#CC7722] flex items-center gap-2">
                  <FaClipboardCheck className="inline-block mr-2" /> Maintenance History
                </h3>
                <button 
                  onClick={closeModals}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {maintenanceHistory.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No maintenance records found.</p>
              ) : (
                <div className="space-y-4">
                  {maintenanceHistory.map((record, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4 py-4 bg-green-50 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-lg">{record.description}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-medium">Service Date</p>
                              <p className="text-sm text-gray-800 font-medium">
                                {new Date(record.serviceDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-medium">Cost</p>
                              <p className="text-sm text-gray-800 font-medium">
                                LKR {record.serviceCost ? record.serviceCost.toLocaleString() : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-medium">Status</p>
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                record.status === 'Completed' ? 'bg-green-200 text-green-800' : 
                                record.status === 'In Progress' ? 'bg-yellow-200 text-yellow-800' : 
                                'bg-gray-200 text-gray-800'
                              }`}>
                                {record.status || 'Completed'}
                              </span>
                            </div>
                            {record.mechanicName && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-medium">Mechanic</p>
                                <p className="text-sm text-gray-800">{record.mechanicName}</p>
                              </div>
                            )}
                            {record.partsReplaced && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-medium">Parts Replaced</p>
                                <p className="text-sm text-gray-800">{record.partsReplaced}</p>
                              </div>
                            )}
                            {record.nextServiceDue && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase font-medium">Next Service Due</p>
                                <p className="text-sm text-gray-800">
                                  {new Date(record.nextServiceDue).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 flex gap-3">
                            <button
                              onClick={() => downloadMaintenanceReport(record)}
                              className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 text-sm font-medium underline"
                            >
                              <FaDownload className="text-xs" />
                              Download Report
                            </button>
                            {record.maintenanceReportUrl && (
                              <a
                                href={record.maintenanceReportUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 text-sm font-medium underline"
                              >
                                <FaEye className="text-xs" />
                                View Original Report
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-[#CC7722] to-[#c5a35a] text-white w-12 h-12 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group relative"
          title="Add New Vehicle"
        >
          <FaPlus className="text-xl" />
          <span className="absolute right-full mr-3 bg-white text-[#CC7722] px-3 py-1 rounded-lg shadow-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Add New Vehicle
          </span>
        </button>
        
        <button
          onClick={generatePDF}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white w-12 h-12 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group relative"
          title="Generate PDF Report"
        >
          <FaDownload className="text-xl" />
          <span className="absolute right-full mr-3 bg-white text-green-600 px-3 py-1 rounded-lg shadow-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Generate PDF Report
          </span>
        </button>
      </div>
    </div>
  );
};

export default VehicleManagerDashboard;
