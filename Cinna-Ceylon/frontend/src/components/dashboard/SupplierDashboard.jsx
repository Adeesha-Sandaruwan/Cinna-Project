import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import RawMaterialList from '../../components/RawMaterialList';
import SupplierChart from '../../components/SupplierChart';
import DashboardHeader from '../../components/supplier/DashboardHeader';
import StatsCards from '../../components/supplier/StatsCards';
import InventorySection from '../../components/supplier/InventorySection';
import AnalyticsSection from '../../components/supplier/AnalyticsSection';
import RecentActivity from '../supplier/RecentActivity';
import DashboardSidebar from '../supplier/DashboardSidebar';
import jsPDF from 'jspdf';
import logo from '../../assets/images/logo.png';

const SupplierDashboard = () => {
  const { user, logout } = useAuth();
  const { id: routeId } = useParams();
  const viewedSupplierId = routeId || user?.id || user?._id;
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState('');

  const fetchSupplier = async (supplierId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/suppliers/${supplierId}`);
      if (res.ok) {
        const sup = await res.json();
        setSupplier(prev => ({ ...prev, ...sup }));
      }
    } catch (err) {
      console.error('Error fetching supplier profile:', err);
    }
  };

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
      doc.text('CinnaCeylon - Supplier Inventory', margin + 60, y + 18);
      doc.setFontSize(10); doc.setTextColor('#6b7280');
      doc.text('Email: info@cinnaceylon.com  •  www.cinnaceylon.com', margin + 60, y + 36);
      doc.setDrawColor('#d97706'); doc.setLineWidth(2);
      doc.line(margin, y + 60, pageWidth - margin, y + 60);
      y += 80;

      const totalMaterials = rawMaterials.length;
      const totalQuantity = rawMaterials.reduce((s, m) => s + Number(m.quantity || 0), 0);
      const totalValue = rawMaterials.reduce((s, m) => s + (Number(m.quantity || 0) * Number(m.pricePerKg || 0)), 0);

      doc.setFontSize(12); doc.setTextColor('#92400e');
      doc.text('Supplier', margin, y); y += 16;
      doc.setFontSize(11); doc.setTextColor('#111111');
      doc.text(`Name: ${supplier?.name || '-'}`, margin, y); y += 14;
      doc.text(`Email: ${supplier?.email || '-'}`, margin, y); y += 14;
      doc.text(`Contact: ${supplier?.contactNumber || '-'}`, margin, y); y += 20;

      doc.setFontSize(12); doc.setTextColor('#92400e');
      doc.text('Summary', margin, y); y += 16; doc.setFontSize(11); doc.setTextColor('#111111');
      doc.text(`Total Materials: ${totalMaterials}`, margin, y); y += 14;
      doc.text(`Total Quantity: ${Number(totalQuantity).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`, margin, y); y += 14;
      doc.text(`Total Value: LKR ${Number(totalValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin, y); y += 20;

      const ensureSpace = (h = 16) => {
        if (y + h > pageHeight - margin) { doc.addPage(); y = margin; }
      };

      doc.setFontSize(12); doc.setTextColor('#92400e');
      doc.text('Raw Materials', margin, y); y += 16; doc.setFontSize(11); doc.setTextColor('#111111');

      rawMaterials.forEach((m, idx) => {
        ensureSpace(28);
        doc.setFillColor('#fef3c7');
        doc.rect(margin, y - 6, pageWidth - 2 * margin, 24, 'F');
        doc.setTextColor('#92400e');
        const title = (m.materialName && String(m.materialName).trim()) ? m.materialName : (m.quality ? `Cinnamon ${m.quality}` : 'Cinnamon Raw Material');
        doc.text(`${idx + 1}. ${title}`, margin + 8, y + 10);
        y += 28; doc.setTextColor('#111111');

        const fields = [
          `Quality: ${m.quality || '-'}`,
          `Quantity: ${Number(m.quantity || 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`,
          `Price/kg: LKR ${Number(m.pricePerKg || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `Total: LKR ${Number((Number(m.quantity || 0) * Number(m.pricePerKg || 0)) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `Location: ${m.location || '-'}`,
          `Status: ${m.status || '-'}`,
          ...(m.harvestDate ? [`Harvested: ${new Date(m.harvestDate).toLocaleDateString()}`] : []),
          ...(m.moistureContent ? [`Moisture: ${m.moistureContent}%`] : []),
          ...(m.processingMethod ? [`Method: ${m.processingMethod}`] : []),
        ];

        fields.forEach(line => { ensureSpace(16); doc.text(line, margin, y); y += 14; });

        if (m.description) {
          ensureSpace(16);
          doc.setTextColor('#374151'); doc.text('Description:', margin, y); y += 14; doc.setTextColor('#111111');
          const wrapped = doc.splitTextToSize(String(m.description), pageWidth - 2 * margin);
          wrapped.forEach(t => { ensureSpace(14); doc.text(t, margin, y); y += 14; });
        }

        y += 10;
      });

      if (y > pageHeight - margin - 30) { doc.addPage(); y = margin; }
      doc.setFontSize(9); doc.setTextColor('#6b7280');
      doc.text('Report generated by CinnaCeylon', pageWidth / 2, pageHeight - 30, { align: 'center' });
      doc.text('Contact: info@cinnaceylon.com', pageWidth / 2, pageHeight - 16, { align: 'center' });

      const filename = `supplier-inventory-${(supplier?.name || 'supplier').toString().replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error('Failed to generate PDF', e);
      alert('Failed to generate PDF.');
    }
  };

  useEffect(() => {
    if (user) {
      setIsInitialLoad(false);
      const supplierIdToView = viewedSupplierId;

      // If current user is a supplier, they can view their own dashboard
      if (user.userType === 'supplier') {
        const selfId = user.id || user._id;
        if (!supplierIdToView || supplierIdToView === selfId) {
          const base = {
            id: selfId,
            name: user.username || user.profile?.name || 'Supplier',
            email: user.email,
            contactNumber: user.profile?.phone || '',
            address: user.profile?.address || '',
            whatsappNumber: user.profile?.phone || ''
          };
          setSupplier(base);
          fetchSupplier(selfId);
          fetchRawMaterials(selfId);
          return;
        }
        // Suppliers cannot view other suppliers
        setError('Access denied: You can only view your own dashboard');
        setLoading(false);
        navigate('/');
        return;
      }

      // Admins and supplier managers can view any supplier by ID
      const isAdminOrManager = user.role === 'admin' || user.userType === 'admin' || user.role === 'supplier_manager';
      if (isAdminOrManager) {
        // If no supplier id is present in the URL, auto-redirect to the first available supplier
        if (!routeId) {
          (async () => {
            try {
              const res = await fetch('http://localhost:5000/api/suppliers');
              const list = res.ok ? await res.json() : [];
              const first = Array.isArray(list) ? list[0] : null;
              if (first && (first._id || first.id)) {
                navigate(`/supplier-dashboard/${first._id || first.id}`, { replace: true });
              } else {
                setError('No suppliers found');
                setLoading(false);
              }
            } catch (e) {
              setError('Failed to load suppliers');
              setLoading(false);
            }
          })();
          return;
        }
        // Otherwise, use the id from the URL
        const sid = routeId;
        setSupplier(prev => ({ ...(prev || {}), id: sid }));
        fetchSupplier(sid);
        fetchRawMaterials(sid);
        return;
      }

      // Other users
      setError('Access denied: Supplier or Admin access required');
      setLoading(false);
      navigate('/');
    } else if (isInitialLoad === false) {
      setError('User not authenticated');
      setLoading(false);
      navigate('/login');
    }
  }, [user, navigate, isInitialLoad, viewedSupplierId]);

  const fetchRawMaterials = async (supplierId) => {
    try {
      const userId = supplierId;
      const response = await fetch(`http://localhost:5000/api/raw-materials/supplier/${userId}`);
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

  const handleUpdateSupplier = () => {
    navigate(`/supplier-edit/${viewedSupplierId}`);
  };

  const handleDeleteSupplier = async () => {
    if (window.confirm('Are you sure you want to delete this supplier account? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/suppliers/${viewedSupplierId}`, {
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

  

  const totalQuantity = rawMaterials.reduce((sum, material) => sum + parseFloat(material.quantity || 0), 0);
  const totalValue = rawMaterials.reduce((sum, material) =>
    sum + (parseFloat(material.quantity || 0) * parseFloat(material.pricePerKg || 0)), 0
  );

  if (loading || isInitialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fef7ed] via-[#f3e7db] to-[#e5cdb4]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#d97706] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#7a4522] text-lg font-medium">Loading supplier dashboard...</p>
          <p className="text-[#b36f3d] text-sm mt-2">Please wait while we load your information</p>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fef7ed] via-[#f3e7db] to-[#e5cdb4]">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-[#e5cdb4] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-[#d97706]">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-[#7a4522] mb-2">Unable to Load Dashboard</h3>
          <p className="text-[#d97706] text-lg mb-6">{error || 'Supplier not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#d97706] text-white rounded-xl hover:bg-[#b45309] transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-dashboard min-h-screen bg-gradient-to-br from-[#fef7ed] via-[#f3e7db] to-[#e5cdb4]">

      {/* Header */}
      <div className="dashboard-header shadow-xl bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-medium text-slate-700 mb-0.5">{supplier.name}</h1>
              <p className="text-slate-500 text-sm">Supplier Management Dashboard</p>
            </div>
          </div>
          
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          

          

          {/* Main Content */}
          <div className="lg:col-span-12 xl:col-span-12 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat-card-materials bg-gradient-to-br from-[#d97706] to-[#b36f3d] rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#e5cdb4] text-sm font-medium">Total Materials</p>
                    <p className="text-3xl font-bold mt-2">{rawMaterials.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">📦</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#e5cdb4]/30">
                  <p className="text-[#e5cdb4] text-sm">Active listings</p>
                </div>
              </div>
              <div className="stat-card-quantity bg-gradient-to-br from-[#ea580c] to-[#c2410c] rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#f3e7db] text-sm font-medium">Total Quantity</p>
                    <p className="text-3xl font-bold mt-2">{Number(totalQuantity).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">⚖️</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#ea580c]/30">
                  <p className="text-[#f3e7db] text-sm">Available stock</p>
                </div>
              </div>
              <div className="stat-card-value bg-gradient-to-br from-[#ea580c] to-[#c2410c] rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#f3e7db] text-sm font-medium">Total Value</p>
                    <p className="text-3xl font-bold mt-2">LKR {Number(totalValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#ea580c]/30">
                  <p className="text-[#f3e7db] text-sm">Inventory value</p>
                </div>
              </div>
            </div>

            {/* Raw Materials Section */}
            <div id="inventory" className="content-card bg-white border-2 border-[#e5cdb4] rounded-2xl shadow-xl overflow-hidden">
              <div className="content-card-header px-6 py-4 border-b-2 border-[#e5cdb4] bg-gradient-to-r from-[#fef7ed] to-[#f3e7db]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-[#7a4522]">Raw Materials Inventory</h3>
                    <p className="text-[#b36f3d] mt-1">Manage your material listings and availability</p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center gap-3">
                    <button
                      onClick={handleExportPDF}
                      className="btn-primary-brown bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2 px-6 py-3"
                    >
                      <span>📄</span>
                      <span>Export PDF</span>
                    </button>
                    <button
                      onClick={() => navigate(`/raw-material-form/${viewedSupplierId}`)}
                      className="btn-primary-brown bg-gradient-to-r from-[#d97706] to-[#b36f3d] text-white rounded-xl hover:from-[#b45309] hover:to-[#9a582a] transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2 px-6 py-3"
                    >
                      <span>+</span>
                      <span>Add New Material</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <RawMaterialList
                  rawMaterials={rawMaterials}
                  onEdit={() => fetchRawMaterials(viewedSupplierId)}
                  onDelete={() => fetchRawMaterials(viewedSupplierId)}
                />
              </div>
            </div>

            {/* Charts Section */}
            <div id="analytics" className="content-card bg-white border-2 border-[#e5cdb4] rounded-2xl shadow-xl p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#7a4522] mb-2">Performance Analytics</h3>
                <p className="text-[#b36f3d]">Visual insights into your material inventory and performance</p>
              </div>
              <SupplierChart supplierId={viewedSupplierId} rawMaterials={rawMaterials} />
            </div>

            {/* Recent Activity */}
            <div className="content-card bg-white border-2 border-[#e5cdb4] rounded-2xl shadow-xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-[#7a4522]">Recent Activity</h3>
              </div>
              <ul className="space-y-3">
                {rawMaterials.slice(0, 5).map((m) => (
                  <li key={m._id || m.id} className="flex items-center justify-between p-3 rounded-xl bg-[#fef7ed]">
                    <div>
                      <p className="font-medium text-[#7a4522]">
                        {m.materialName && m.materialName.trim()
                          ? m.materialName
                          : (m.quality ? `Cinnamon ${m.quality}` : 'Cinnamon Raw Material')}
                      </p>
                      <p className="text-sm text-[#b36f3d]">Qty: {Number(m.quantity || 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg • LKR {Number(m.pricePerKg || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per kg</p>
                    </div>
                    <span className="text-xs text-[#d97706] bg-[#e5cdb4] px-2 py-1 rounded-lg">Updated</span>
                  </li>
                ))}
                {rawMaterials.length === 0 && (
                  <li className="p-3 rounded-xl bg-[#f3e7db] text-[#b36f3d]">No recent activity yet.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;