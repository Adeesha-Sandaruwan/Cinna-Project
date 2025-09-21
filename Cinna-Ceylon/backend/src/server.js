import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
  
// Import Routes
import productRoutes from './routes/ProductRoutes.js';
import cartRoutes from './routes/CartRoutes.js';
import orderRoutes from './routes/OrderRoutes.js';
import reviewRoutes from './routes/ReviewRoutes.js';
import supplierRoutes from './routes/SupplierRoutes.js';
import supplyRecordRoutes from './routes/SupplyRecordRoutes.js';
import rawMaterialRoutes from './routes/RawMaterialRoutes.js';
import leaveReqRoutes from './routes/LeaveReqRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';
import supPaymentRoutes from "./routes/supPaymentRoutes.js";
import deliveryPayoutRoutes from "./routes/deliveryPayoutRoutes.js";
import financialReportRoutes from "./routes/financialReportRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";

// Vehicle Management Routes
import vehicleRoutes from './routes/vehicleRoutes.js';
import accidentRoutes from './routes/accidentRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';



import userRoutes from "./routes/userRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import attendanceAdminRoutes from "./routes/attendanceAdminRoutes.js";



dotenv.config();

const app = express();

// Enhanced CORS configuration for frontend
app.use(cors({
  origin: [
    'http://localhost:3000',    // Default React port
    'http://localhost:3002',    // Configured React port  
    'http://127.0.0.1:3000',    // Also allow the IP version
    'http://127.0.0.1:3002',    // Configured IP version
    'http://localhost:3002',    // Keep your existing one if needed
    'http://127.0.0.1:3002'     // Keep your existing one if needed
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// ✅ Serve uploaded images (new part)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.resolve('uploads');
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/supply-records', supplyRecordRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/leave-requests', leaveReqRoutes);
// Vehicle Management Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/accidents', accidentRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/supplier-payments", supPaymentRoutes);
app.use("/api/delivery-payouts", deliveryPayoutRoutes);
app.use("/api/financial-reports", financialReportRoutes);
app.use("/api/offers", offerRoutes);

// User routes
app.use("/api/users", userRoutes);
// Admin user management routes
app.use("/api/admin/users", adminUserRoutes);

// Attendance routes
app.use("/api/attendance", attendanceRoutes);
// Admin attendance management
app.use("/api/admin/attendance", attendanceAdminRoutes);


// Root test endpoint
app.get('/', (req, res) => {
  res.send('🌿 CinnaCeylon API is running 🚀');
});

// Port - Fixed to 5000 to avoid conflicts
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Backend Server running on port ${PORT}`);
  console.log(`🌐 Backend accessible at: http://localhost:${PORT}`);
  console.log(`🔗 Frontend should connect to: http://localhost:3002`);
  
  // Connect to DB after server starts
  connectDB().catch(err => {
    console.error('❌ Database connection failed:', err);
    server.close();
    process.exit(1);
  });
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please try a different port.`);
    console.error(`💡 You can set a different port in your .env file: PORT=5001`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});
