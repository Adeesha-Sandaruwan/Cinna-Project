import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Toasts
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Common Pages
import HomePage from './components/HomePage';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';

// Product
import ProductForm from './components/ProductForm';
import ProductList from "./components/ProductList.jsx";
import ProductDetails from "./components/ProductDetails.jsx";
import ProductManagement from "./components/ProductManagement.jsx";
import ProductManagerDashboard from "./components/ProductManagerDashboard.jsx";

// User Management Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Layout
import Header from './components/Header';
import Footer from './components/Footer';

// Dashboards
import { BuyerDashboard, SupplierDashboard, DriverDashboard, AdminDashboard, HRManagerDashboard } from './components/dashboard';
import AttendanceRecords from './components/dashboard/AttendanceRecords';
import LeaveQuickActions from './components/leave/LeaveQuickActions.jsx';
import MyLeaves from './components/leave/MyLeaves.jsx';
import LeaveAnalytics from './components/leave/LeaveAnalytics.jsx';
import FinancialOfficerDashboard from './components/dashboard/FinancialOfficerDashboard.jsx';

// E-commerce
import Cart from "./components/Cart.jsx";
import Checkout from "./components/Checkout.jsx";

// Supplier & HR
import SupplierForm from "./components/SupplierForm.jsx";
import SupplierReport from "./components/SupplierReport.jsx";
import RawMaterialPage from "./components/RawMaterialPage.jsx";
import WholesalePage from "./components/WholesalePage.jsx";
import WholesaleProductDetails from "./components/WholesaleProductDetails.jsx";
import LeaveRequestManagement from "./components/LeaveRequestManagement.jsx";
import LeaveRequestForm from "./components/LeaveRequestForm.jsx";
import SalaryForm from './components/SalaryForm';
import FinancialReportForm from './components/FinancialReportForm';
import SupPaymentForm from './components/SupPaymentForm';
import DeliveryPayoutForm from './components/DeliveryPayoutForm';

// Offers
import OfferCard from './components/OfferCard';
import OfferForm from './components/OfferForm';
import OffersPage from './components/OffersPage';
import BuyerOffersPage from './components/BuyerOffersPage';

// Vehicle Management
import VehicleManagerDashboard from "./components/VehicleManagerDashboard.jsx";
import DeliveryManagerDashboard from "./components/DeliveryManagerDashboard.jsx";
import VehicleDetailsPage from "./components/VehicleDetailsPage.jsx";
import VehicleUpdatePage from "./components/VehicleUpdatePage.jsx";

// Management Systems
import MaintenanceManagement from "./components/MaintenanceManagement.jsx";
import AccidentManagement from "./components/AccidentManagement.jsx";
import EmergencyManagement from "./components/EmergencyManagement.jsx";

// Inner component to allow useLocation hook (for conditional layout)
function AppContent() {
  const location = useLocation();
  const noLayoutRoutes = ['/login', '/register'];
  const hideLayout = noLayoutRoutes.includes(location.pathname.toLowerCase());

  return (
    <>
      {!hideLayout && <Header />}
      <Routes>
            {/* Main Website Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />

            {/* Product Routes */}
            <Route path="/product_form" element={<ProductForm />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart/:userId?" element={<Cart />} />
            <Route path="/checkout/:userId?" element={<Checkout />} />

            {/* Admin/Product Management */}
            <Route path="/admin/products" element={<ProductManagement />} />
            <Route path="/admin/dashboard" element={<ProductManagerDashboard />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />

            {/* Dashboards */}
            <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
            <Route path="/dashboard/supplier" element={<SupplierDashboard />} />
            <Route path="/dashboard/driver" element={<DriverDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/hr" element={<HRManagerDashboard />} />
            <Route path="/dashboard/attendance-records" element={<AttendanceRecords />} />

            {/* Supplier & HR Management */}
            <Route path="/supplierform" element={<SupplierForm />} />
            <Route path="/supplier-dashboard/:id" element={<SupplierDashboard />} />
            <Route path="/supplier-report/:id" element={<SupplierReport />} />
            <Route path="/raw-material-form/:supplierId" element={<RawMaterialPage />} />
            <Route path="/wholesale" element={<WholesalePage />} />
            <Route path="/wholesale/product/:id" element={<WholesaleProductDetails />} />
            <Route path="/leave-management" element={<LeaveRequestManagement />} />
            <Route path="/leaverequestform" element={<LeaveRequestForm />} />
            <Route path="/my-leaves" element={<MyLeaves />} />
            <Route path="/leave-analytics" element={<LeaveAnalytics />} />
            <Route path='/salary_form' element={<SalaryForm />} />
            <Route path='/financial-report-form' element={<FinancialReportForm />} />
            <Route path='/sup-payment-form' element={<SupPaymentForm />} />
            <Route path='/delivery-payout-form' element={<DeliveryPayoutForm />} />

            {/* Offers */}
            <Route path='/offer-card' element={<OfferCard />} />
            <Route path='/offer-form' element={<OfferForm />} />
            <Route path='/offer-page' element={<OffersPage />} />
            <Route path='/buyer-offers' element={<BuyerOffersPage />} />

            {/* Vehicle Management */}
            <Route path="/vehicles" element={<VehicleManagerDashboard />} />
            <Route path="/vehicle-manager" element={<VehicleManagerDashboard />} />
            <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
            <Route path="/vehicle/:id" element={<VehicleDetailsPage />} />
            <Route path="/vehicle/:id/update" element={<VehicleUpdatePage />} />
            <Route path="/delivery" element={<DeliveryManagerDashboard />} />
            <Route path="/delivery-manager" element={<DeliveryManagerDashboard />} />
            <Route path="/financial-officer-dashboard" element={<FinancialOfficerDashboard />} />

            {/* Management Systems */}
            <Route path="/maintenance" element={<MaintenanceManagement />} />
            <Route path="/accidents" element={<AccidentManagement />} />
            <Route path="/emergencies" element={<EmergencyManagement />} />
      </Routes>
      <LeaveQuickActions />
      {!hideLayout && <Footer />}
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
