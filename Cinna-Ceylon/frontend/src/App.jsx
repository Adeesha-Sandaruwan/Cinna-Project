import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';

// Common Pages
import HomePage from './components/HomePage';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import ProductForm from './components/ProductForm';
import ProductList from "./components/ProductList.jsx";
import ProductDetails from "./components/ProductDetails.jsx";
import ProductManagement from "./components/ProductManagement.jsx";

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
import LeaveRequestForm from "./components/LeaveRequestForm.jsx";
import Cart from "./components/Cart.jsx";
import Checkout from "./components/Checkout.jsx";
import SuplierForm from "./components/SupplierForm.jsx";

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
          <Route path="/admin/products" element={<ProductManagement />} />

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
          <Route path="/leaverequestform" element={<LeaveRequestForm />} />
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
