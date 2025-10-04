import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaCarSide, FaCalendarAlt, FaClipboardCheck, FaExclamationTriangle, FaFileAlt } from 'react-icons/fa';
import DownloadVehiclePDFButton from './DownloadVehiclePDFButton';

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [loading, setLoading] = useState(false);
  const [maintenanceFile, setMaintenanceFile] = useState(null);
  const [accidentFile, setAccidentFile] = useState(null);
  const [maintenanceCost, setMaintenanceCost] = useState("");
  const [accidentCost, setAccidentCost] = useState("");
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [accidentHistory, setAccidentHistory] = useState([]);
  const maintenanceFileRef = useRef(null);
  const accidentFileRef = useRef(null);

  useEffect(() => {
    // Fetch vehicle details
    fetch(`http://localhost:5000/api/vehicles/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setVehicle(data))
      .catch(err => {
        console.error("Error fetching vehicle details:", err);
        setMessage("Error loading vehicle details");
        setMessageType("error");
      });
    
    // Fetch maintenance history
    fetch(`http://localhost:5000/api/vehicles/${id}/maintenance-history`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setMaintenanceHistory(data))
      .catch(err => console.error("Error fetching maintenance history:", err));
    
    // Fetch accident history
    fetch(`http://localhost:5000/api/vehicles/${id}/accident-history`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setAccidentHistory(data))
      .catch(err => console.error("Error fetching accident history:", err));
  }, [id]);

  const handleFileChange = (setter) => (e) => {
    setter(e.target.files[0]);
  };

  const handleSubmit = async (type) => {
    setMessage("");
    setMessageType("");
    setLoading(true);
    
    console.log("Frontend submission - Type:", type);
    console.log("Frontend submission - Maintenance file:", maintenanceFile);
    console.log("Frontend submission - Accident file:", accidentFile);
    
    const formData = new FormData();
    let endpoint = "";
    
    if (type === "maintenance") {
      if (!maintenanceFile || !maintenanceCost) {
        setMessage("Please provide both a file and cost for maintenance.");
        setMessageType("error");
        setLoading(false);
        return;
      }
      formData.append("maintenanceReport", maintenanceFile);
      formData.append("maintenanceCost", maintenanceCost);
      endpoint = `http://localhost:5000/api/vehicles/${id}/maintenance`;
      console.log("Frontend maintenance - FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
    }
    
    if (type === "accident") {
      if (!accidentFile || !accidentCost) {
        setMessage("Please provide both a file and cost for accident.");
        setMessageType("error");
        setLoading(false);
        return;
      }
      formData.append("accidentReport", accidentFile);
      formData.append("accidentCost", accidentCost);
      formData.append("severity", "Minor"); // Default severity
      endpoint = `http://localhost:5000/api/vehicles/${id}/accident`;
      console.log("Frontend accident - FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
    }
    
    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Report submitted successfully!");
        setMessageType("success");
        setVehicle(data.vehicle);
        
        // Refresh history after successful submission
        if (type === "maintenance") {
          fetch(`http://localhost:5000/api/vehicles/${id}/maintenance-history`)
            .then(res => res.json())
            .then(data => setMaintenanceHistory(data))
            .catch(err => console.error("Error refreshing maintenance history:", err));
        }
        
        if (type === "accident") {
          fetch(`http://localhost:5000/api/vehicles/${id}/accident-history`)
            .then(res => res.json())
            .then(data => setAccidentHistory(data))
            .catch(err => console.error("Error refreshing accident history:", err));
        }
        
        // Clear form fields after successful submission
        if (type === "maintenance") {
          setMaintenanceFile(null);
          setMaintenanceCost("");
          if (maintenanceFileRef.current) maintenanceFileRef.current.value = '';
        }
        if (type === "accident") {
          setAccidentFile(null);
          setAccidentCost("");
          if (accidentFileRef.current) accidentFileRef.current.value = '';
        }
      } else {
        setMessage(data.message || "Error submitting report.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage("Network error. Please try again.");
      setMessageType("error");
    }
    
    setLoading(false);
  };

  if (!vehicle) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg">
      <h2 className="text-3xl font-extrabold mb-2 text-[#8B4513] tracking-tight flex items-center gap-2">
        <FaCarSide className="inline-block mr-2 text-[#CC7722]" /> Vehicle Details
      </h2>
      <div className="text-lg font-bold text-[#CC7722] mb-6">ID: {vehicle.vehicleId || '-'}</div>
      {message && (
        <div className={`mb-4 px-4 py-2 rounded shadow ${
          messageType === "success" 
            ? "bg-green-100 text-green-800 border border-green-200" 
            : "bg-red-100 text-red-800 border border-red-200"
        }`}>
          {message}
        </div>
      )}
      <DownloadVehiclePDFButton vehicle={vehicle} />
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4 text-[#CC7722] flex items-center gap-2">
          <FaFileAlt className="inline-block mr-2" /> Vehicle Info
        </h3>
        <div className="grid grid-cols-2 gap-4 text-lg">
          <p><strong>Type:</strong> {vehicle.vehicleType}</p>
          <p><strong>Capacity:</strong> {vehicle.capacity}</p>
          <p><strong>Status:</strong> {vehicle.status}</p>
          <p><strong>Insurance No:</strong> {vehicle.insuranceNo}</p>
          <p><strong>Insurance Expiry:</strong> {vehicle.insuranceExpDate ? new Date(vehicle.insuranceExpDate).toLocaleDateString() : ""}</p>
          <p><strong>Service Date:</strong> {vehicle.serviceDate ? new Date(vehicle.serviceDate).toLocaleDateString() : ""}</p>
          <p className="col-span-2">
            <strong>
              <FaClipboardCheck className="inline-block mr-1 text-green-600" /> Maintenance Status:
            </strong>
            <span className={vehicle.maintenanceReport ? "text-green-700 font-semibold" : "text-gray-500"}>
              {vehicle.maintenanceReport ? `Submitted (Cost: ${vehicle.maintenanceCost !== undefined && vehicle.maintenanceCost !== null ? vehicle.maintenanceCost : 'N/A'})` : "Not Submitted"}
            </span>
          </p>
          <p className="col-span-2">
            <strong>
              <FaExclamationTriangle className="inline-block mr-1 text-red-600" /> Accident Status:
            </strong>
            <span className={vehicle.accidentReport ? "text-red-700 font-semibold" : "text-gray-500"}>
              {vehicle.accidentReport ? `Submitted (Cost: ${vehicle.accidentCost !== undefined && vehicle.accidentCost !== null ? vehicle.accidentCost : 'N/A'})` : "Not Submitted"}
            </span>
          </p>
        </div>
      </div>
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <h3 className="font-bold mb-2 text-[#CC7722] flex items-center gap-2">
          <FaClipboardCheck className="inline-block mr-2" /> Submit Maintenance Report
        </h3>
        <input 
          type="file" 
          accept=".pdf,.jpg,.png" 
          ref={maintenanceFileRef}
          onChange={handleFileChange(setMaintenanceFile)} 
          className="mb-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2" 
          required 
        />
        <input 
          type="number" 
          min="0" 
          step="0.01" 
          placeholder="Maintenance Cost (required)" 
          value={maintenanceCost} 
          onChange={e => setMaintenanceCost(e.target.value)} 
          className="mb-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          required 
        />
        <button onClick={() => handleSubmit("maintenance")} 
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Submitting..." : "Submit Maintenance"}
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold mb-2 text-[#CC7722] flex items-center gap-2">
          <FaExclamationTriangle className="inline-block mr-2" /> Submit Accident Report
        </h3>
        <input 
          type="file" 
          accept=".pdf,.jpg,.png" 
          ref={accidentFileRef}
          onChange={handleFileChange(setAccidentFile)} 
          className="mb-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2" 
          required 
        />
        <input 
          type="number" 
          min="0" 
          step="0.01" 
          placeholder="Accident Cost (required)" 
          value={accidentCost} 
          onChange={e => setAccidentCost(e.target.value)} 
          className="mb-2 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-red-500 focus:border-red-500" 
          required 
        />
        <button onClick={() => handleSubmit("accident")} 
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Submitting..." : "Submit Accident"}
        </button>
      </div>
      
      {/* Maintenance History */}
      {maintenanceHistory.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-4 text-[#CC7722] flex items-center gap-2">
            <FaClipboardCheck className="inline-block mr-2" /> Maintenance History
          </h3>
          <div className="space-y-3">
            {maintenanceHistory.map((record, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{record.description}</p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(record.serviceDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cost: ${record.serviceCost}
                    </p>
                    {record.mechanicName && (
                      <p className="text-sm text-gray-600">Mechanic: {record.mechanicName}</p>
                    )}
                    {record.partsReplaced && (
                      <p className="text-sm text-gray-600">Parts Replaced: {record.partsReplaced}</p>
                    )}
                    {record.maintenanceReportUrl && (
                      <a
                        href={record.maintenanceReportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-1 text-blue-700 underline text-sm"
                      >
                        Download Report
                      </a>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    record.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    record.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {record.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Accident History */}
      {accidentHistory.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-4 text-[#CC7722] flex items-center gap-2">
            <FaExclamationTriangle className="inline-block mr-2" /> Accident History
          </h3>
          <div className="space-y-3">
            {accidentHistory.map((record, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{record.description}</p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(record.accidentDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cost: ${record.accidentCost}
                    </p>
                    {record.location && (
                      <p className="text-sm text-gray-600">Location: {record.location}</p>
                    )}
                    {record.driverName && (
                      <p className="text-sm text-gray-600">Driver: {record.driverName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      record.severity === 'Critical' ? 'bg-red-100 text-red-800' : 
                      record.severity === 'Major' ? 'bg-orange-100 text-orange-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.severity}
                    </span>
                    <br />
                    <span className={`mt-1 px-2 py-1 rounded text-xs font-medium ${
                      record.repairStatus === 'Completed' ? 'bg-green-100 text-green-800' : 
                      record.repairStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.repairStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetailsPage;
