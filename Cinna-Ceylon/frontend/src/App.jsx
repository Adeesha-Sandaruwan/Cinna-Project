import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Toasts
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Common Pages
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
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
import { BuyerDashboard, SupplierDashboard, AdminDashboard } from './components/dashboard/index.jsx';
import AttendanceRecords from './components/dashboard/AttendanceRecords';
import DriverDashboard from './components/DriverDashboard.jsx';

// E-commerce
import Cart from "./components/Cart.jsx";
import Checkout from "./components/Checkout.jsx";
import SupplierForm from "./components/SupplierForm.jsx";

// Vehicle Management
import VehicleManagerDashboard from "./components/VehicleManagerDashboard.jsx";
import DeliveryManagerDashboard from "./components/DeliveryManagerDashboard.jsx";
import VehicleDetailsPage from "./components/VehicleDetailsPage.jsx";
import VehicleUpdatePage from "./components/VehicleUpdatePage.jsx";

// Management Systems
import MaintenanceManagement from "./components/MaintenanceManagement.jsx";
import AccidentManagement from "./components/AccidentManagement.jsx";
import EmergencyManagement from "./components/EmergencyManagement.jsx";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
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

            {/* Admin/Product Management */}
            <Route path="/admin/products" element={<ProductManagement />} />
            <Route path="/admin/dashboard" element={<ProductManagerDashboard />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />

          {/* E-commerce */}
          <Route path="/cart/:userId?" element={<Cart />} />
          <Route path="/checkout/:userId?" element={<Checkout />} />
          <Route path="/leaverequestform" element={<LeaveRequestForm />} />
          <Route path="/supplierform" element={<SupplierForm />} />

            {/* Supplier & HR Management */}
            <Route path="/supplierform" element={<SupplierForm />} />
            <Route path="/supplier-dashboard/:id" element={<SupplierDashboardPage />} />
            <Route path="/supplier-report/:id" element={<SupplierReport />} />
            <Route path="/raw-material-form/:supplierId" element={<RawMaterialPage />} />
            <Route path="/wholesale" element={<WholesalePage />} />
            <Route path="/leave-management" element={<LeaveRequestManagement />} />
            <Route path="/leaverequestform" element={<LeaveRequestForm />} />
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

            {/* Management Systems */}
            <Route path="/maintenance" element={<MaintenanceManagement />} />
            <Route path="/accidents" element={<AccidentManagement />} />
            <Route path="/emergencies" element={<EmergencyManagement />} />
          </Routes>
          <Footer />
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
