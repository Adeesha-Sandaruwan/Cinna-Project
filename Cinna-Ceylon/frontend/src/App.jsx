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

import SupplierForm from "./components/SupplierForm.jsx";
import SupplierDashboard from "./components/SupplierDashboard.jsx";
import SupplierReport from "./components/SupplierReport.jsx";

import RawMaterialPage from "./components/RawMaterialPage.jsx";
import WholesalePage from "./components/WholesalePage.jsx";
import LeaveRequestManagement from "./components/LeaveRequestManagement.jsx";




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/product_form" element={<ProductForm />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart/:userId?" element={<Cart />} />
        <Route path="/checkout/:userId?" element={<Checkout />} />
        <Route path="/admin/products" element={<ProductManagement />} />
        <Route path="/leaverequestform" element={<LeaveRequestForm />} />
        <Route path="/supplierform" element={<SupplierForm />} />
        <Route path="/supplier-dashboard/:id" element={<SupplierDashboard />} />
        <Route path="/supplier-report/:id" element={<SupplierReport />} />
        <Route path="/raw-material-form/:supplierId" element={<RawMaterialPage />} />
        <Route path="/wholesale" element={<WholesalePage />} />
        <Route path="/leave-management" element={<LeaveRequestManagement />} />

        
        
        



      </Routes>
    </Router>
  );
}

export default App;