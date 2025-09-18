import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import ProductForm from './components/ProductForm';
import ProductList from "./components/ProductList.jsx";
import ProductDetails from "./components/ProductDetails.jsx";
import ProductManagement from "./components/ProductManagement.jsx";
import LeaveRequestForm from "./components/LeaveRequestForm.jsx";
import Cart from "./components/Cart.jsx";
import Checkout from "./components/Checkout.jsx";
import SuplierForm from "./components/SupplierForm.jsx";
// Vehicle Management Imports
import VehicleManagerDashboard from "./components/VehicleManagerDashboard.jsx";
import DeliveryManagerDashboard from "./components/DeliveryManagerDashboard.jsx";
import DriverDashboard from "./components/DriverDashboard.jsx";
import VehicleDetailsPage from "./components/VehicleDetailsPage.jsx";
import VehicleUpdatePage from "./components/VehicleUpdatePage.jsx";
// Management System Imports
import MaintenanceManagement from "./components/MaintenanceManagement.jsx";
import AccidentManagement from "./components/AccidentManagement.jsx";
import EmergencyManagement from "./components/EmergencyManagement.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Website Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        
        {/* Product Routes */}
        <Route path="/product_form" element={<ProductForm />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        
        {/* E-commerce Routes */}
        <Route path="/cart/:userId?" element={<Cart />} />
        <Route path="/checkout/:userId?" element={<Checkout />} />
        
        {/* Admin Management Routes */}
        <Route path="/admin/products" element={<ProductManagement />} />
        
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
        
        {/* Employee & HR Routes */}
        <Route path="/leaverequestform" element={<LeaveRequestForm />} />
        <Route path="/supplierform" element={<SuplierForm />} />

      </Routes>
    </Router>
  );
}

export default App;