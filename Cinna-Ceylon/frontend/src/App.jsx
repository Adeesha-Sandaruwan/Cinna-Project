import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Website pages
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';

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
import { BuyerDashboard, SupplierDashboard, DriverDashboard, AdminDashboard } from './components/dashboard';
import AttendanceRecords from './components/dashboard/AttendanceRecords';

// E-commerce
import Cart from "./components/Cart.jsx";
import Checkout from "./components/Checkout.jsx";

// HR & Finance
import LeaveRequestForm from "./components/LeaveRequestForm.jsx";
import SuplierForm from "./components/SupplierForm.jsx";
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

// Management System
// Management Systems
import MaintenanceManagement from "./components/MaintenanceManagement.jsx";
import AccidentManagement from "./components/AccidentManagement.jsx";
import EmergencyManagement from "./components/EmergencyManagement.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
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
        
        {/* Admin Management Routes */}
        <Route path="/admin/products" element={<ProductManagement />} />
        <Route path="/admin/dashboard" element={<ProductManagerDashboard />} />
        <Route path="/leaverequestform" element={<LeaveRequestForm />} />
        <Route path="/supplierform" element={<SuplierForm />} />
        <Route path='/salary_form' element={<SalaryForm />} />
        <Route path='/financial-report-form' element={<FinancialReportForm />} />
        <Route path='/sup-payment-form' element={<SupPaymentForm />} />
        <Route path='/delivery-payout-form' element={<DeliveryPayoutForm />} />
        <Route path='/offer-card' element={<OfferCard />} />
        <Route path='/offer-form' element={<OfferForm />} />
        <Route path='/offer-page' element={<OffersPage />} />
        <Route path='/buyer-offers' element={<BuyerOffersPage />} />
        
        {/* Vehicle Management Routes */}
        <Route path="/vehicles" element={<VehicleManagerDashboard />} />
        <Route path="/vehicle-manager" element={<VehicleManagerDashboard />} />
        <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
        <Route path="/vehicle/:id" element={<VehicleDetailsPage />} />
        <Route path="/vehicle/:id/update" element={<VehicleUpdatePage />} />
        <Route path="/delivery" element={<DeliveryManagerDashboard />} />
        <Route path="/delivery-manager" element={<DeliveryManagerDashboard />} />
        <Route path="/driver" element={<DriverDashboard />} />
        
        {/* Management System Routes */}
        <Route path="/maintenance" element={<MaintenanceManagement />} />
        <Route path="/accidents" element={<AccidentManagement />} />
        <Route path="/emergencies" element={<EmergencyManagement />} />

        {/* Duplicate routes from second section */}
          {/* Main Website Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Product Routes */}
          <Route path="/product_form" element={<ProductForm />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
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
          <Route path="/dashboard/attendance-records" element={<AttendanceRecords />} />

          {/* E-commerce */}
          <Route path="/cart/:userId?" element={<Cart />} />
          <Route path="/checkout/:userId?" element={<Checkout />} />
          <Route path="/supplierform" element={<SuplierForm />} />

          {/* Vehicle Management */}
          <Route path="/vehicles" element={<VehicleManagerDashboard />} />
          <Route path="/vehicle-manager" element={<VehicleManagerDashboard />} />
          <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
          <Route path="/vehicle/:id" element={<VehicleDetailsPage />} />
          <Route path="/vehicle/:id/update" element={<VehicleUpdatePage />} />
          <Route path="/delivery" element={<DeliveryManagerDashboard />} />
          <Route path="/delivery-manager" element={<DeliveryManagerDashboard />} />

          {/* Management Systems */}
          <Route path="/maintenance" element={<MaintenanceManagement />} />
          <Route path="/accidents" element={<AccidentManagement />} />
          <Route path="/emergencies" element={<EmergencyManagement />} />
        </Routes>
        <Footer />
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
}

export default App;
