import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RawMaterialForm from './RawMaterialForm';
import RawMaterialList from './RawMaterialList';
import SupplierChart from './SupplierChart';

const SupplierDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [showRawMaterialForm, setShowRawMaterialForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSupplierDetails();
    fetchRawMaterials();
  }, [id]);

  const fetchSupplierDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/suppliers/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSupplier(data);
      } else {
        setError('Failed to fetch supplier details');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const fetchRawMaterials = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/raw-materials/supplier/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRawMaterials(data);
      }
    } catch (err) {
      console.error('Error fetching raw materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    if (supplier?.whatsappNumber) {
      const message = `Hello ${supplier.name}, I'm interested in your products. Can we discuss further?`;
      const whatsappUrl = `https://wa.me/${supplier.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleUpdateSupplier = () => {
    navigate(`/supplier-edit/${id}`);
  };

  const handleDeleteSupplier = async () => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/suppliers/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          navigate('/suppliers');
        } else {
          setError('Failed to delete supplier');
        }
      } catch (err) {
        setError('Network error');
      }
    }
  };

  const handleExportPDF = () => {
    // This will be implemented in the PDF export component
    navigate(`/supplier-report/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Supplier not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
                <p className="text-gray-600">Supplier Dashboard</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleWhatsAppContact}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Supplier Details Card */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="text-center mb-6">
                {supplier.profileImage ? (
                  <img
                    src={`http://localhost:5000/uploads/${supplier.profileImage}`}
                    alt={supplier.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gray-100 flex items-center justify-center">
                    <span className="text-2xl text-gray-500">👤</span>
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900">{supplier.name}</h2>
                <p className="text-gray-600 text-sm">Supplier</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500 w-4">📧</span>
                  <span className="text-gray-700">{supplier.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500 w-4">📞</span>
                  <span className="text-gray-700">{supplier.contactNumber}</span>
                </div>
                {supplier.whatsappNumber && (
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600 w-4">📱</span>
                    <span className="text-gray-700">{supplier.whatsappNumber}</span>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <span className="text-gray-500 w-4">📍</span>
                  <span className="text-gray-700">{supplier.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500 w-4">📅</span>
                  <span className="text-gray-700">
                    Joined: {new Date(supplier.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={handleUpdateSupplier}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Edit Supplier
                </button>
                <button
                  onClick={handleDeleteSupplier}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Delete Supplier
                </button>
              </div>
            </div>
          </div>

          {/* Raw Materials Section */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Raw Materials</h3>
                <button
                  onClick={() => navigate(`/raw-material-form/${id}`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 font-medium"
                >
                  <span>Add Material</span>
                </button>
              </div>

              <RawMaterialList
                rawMaterials={rawMaterials}
                onEdit={fetchRawMaterials}
                onDelete={fetchRawMaterials}
              />
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Materials</p>
                    <p className="text-2xl font-bold text-gray-900">{rawMaterials.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xl">📦</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {rawMaterials.reduce((sum, material) => sum + parseFloat(material.quantity || 0), 0).toFixed(1)} kg
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl">⚖️</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      LKR {rawMaterials.reduce((sum, material) => 
                        sum + (parseFloat(material.quantity || 0) * parseFloat(material.pricePerKg || 0)), 0
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-xl">💰</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="mt-8">
              <SupplierChart supplierId={id} rawMaterials={rawMaterials} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;