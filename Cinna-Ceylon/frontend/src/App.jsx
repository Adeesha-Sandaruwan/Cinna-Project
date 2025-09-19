import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Website pages
import HomePage from './components/HomePage';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';

// Product
import ProductForm from './components/ProductForm';
import ProductList from "./components/ProductList.jsx";
import ProductDetails from "./components/ProductDetails.jsx";
import ProductManagement from "./components/ProductManagement.jsx";
import Cart from "./components/Cart.jsx";
import Checkout from "./components/Checkout.jsx";

// HR & Finance
import LeaveRequestForm from "./components/LeaveRequestForm.jsx";
import SuplierForm from "./components/SupplierForm.jsx";
import SalaryForm from './components/SalaryForm';
import FinancialReportForm from './components/FinancialReportForm';
import SupPaymentForm from './components/SupPaymentForm';
import DeliveryPayoutForm from './components/DeliveryPayoutForm';
import SalaryDashoard from './components/SalaryDashboard';

// Offers
import OfferCard from './components/OfferCard';
import OfferForm from './components/OfferForm';
import OffersPage from './components/OffersPage';
import BuyerOffersPage from './components/BuyerOffersPage';

// Vehicle Management
import VehicleManagerDashboard from "./components/VehicleManagerDashboard.jsx";
import DeliveryManagerDashboard from "./components/DeliveryManagerDashboard.jsx";
import DriverDashboard from "./components/DriverDashboard.jsx";
import VehicleDetailsPage from "./components/VehicleDetailsPage.jsx";
import VehicleUpdatePage from "./components/VehicleUpdatePage.jsx";

// Management System
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
        <Route path="/cart/:userId?" element={<Cart />} />
        <Route path="/checkout/:userId?" element={<Checkout />} />
        
        {/* Admin Management Routes */}
        <Route path="/admin/products" element={<ProductManagement />} />
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
        <Route path='/salary-dashboard' element={<SalaryDashoard />} />
        
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
      </Routes>
    </Router>
  );
}

export default App;
