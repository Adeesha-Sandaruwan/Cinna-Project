// Import required packages
import express from 'express';        // Express.js framework for building APIs
import cors from 'cors';              // Middleware to handle Cross-Origin Resource Sharing
import dotenv from 'dotenv';          // Loads environment variables from a .env file
import path from 'path';              // Node.js path utilities for file/directory handling
import { fileURLToPath } from 'url';  // Helper to get __filename and __dirname in ES modules

// Import database connection function
import connectDB from './config/db.js';
  
// Import application routes (organized by features/modules)
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

// User & Attendance Routes
import userRoutes from "./routes/userRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import attendanceAdminRoutes from "./routes/attendanceAdminRoutes.js";

// Load environment variables (like DB connection string, PORT, etc.)
dotenv.config();

// Create an Express app instance
const app = express();

// 🔒 Configure CORS (allow frontend to communicate with backend securely)
app.use(cors({
  origin: [
    'http://localhost:3000',    // Default React development server
    'http://localhost:3002',    // Alternative frontend port
    'http://127.0.0.1:3000',    // Localhost via IP
    'http://127.0.0.1:3002'     // Alternative IP version
  ],
  credentials: true,  // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] // Allowed headers
}));

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Serve uploaded files (e.g., product images) from the "uploads" directory
const __filename = fileURLToPath(import.meta.url);   // Get current file name
const __dirname = path.dirname(__filename);          // Get current directory
const uploadsPath = path.resolve('uploads');         // Absolute path to "uploads" folder
app.use('/uploads', express.static(uploadsPath));    // Make /uploads publicly accessible

// ------------------ API ROUTES ------------------
// Product & Order Management
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Supplier & Raw Material Management
app.use('/api/suppliers', supplierRoutes);
app.use('/api/supply-records', supplyRecordRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/leave-requests', leaveReqRoutes);

// Vehicle Management
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/accidents', accidentRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Financial Management
app.use("/api/salaries", salaryRoutes);
app.use("/api/supplier-payments", supPaymentRoutes);
app.use("/api/delivery-payouts", deliveryPayoutRoutes);
app.use("/api/financial-reports", financialReportRoutes);
app.use("/api/offers", offerRoutes);

// User Management
app.use("/api/users", userRoutes);              // Normal users
app.use("/api/admin/users", adminUserRoutes);   // Admin-level user management

// Attendance Management
app.use("/api/attendance", attendanceRoutes);              // Normal attendance
app.use("/api/admin/attendance", attendanceAdminRoutes);   // Admin-level attendance control

// Root test endpoint (just to check if API is running)
app.get('/', (req, res) => {
  res.send('🌿 CinnaCeylon API is running 🚀');
});

// ------------------ SERVER SETUP ------------------
// Choose port (fixed to 5000 if not defined in .env)
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Backend Server running on port ${PORT}`);
  console.log(`🌐 Backend accessible at: http://localhost:${PORT}`);
  console.log(`🔗 Frontend should connect to: http://localhost:3002`);
  
  // Connect to MongoDB after server starts
  connectDB().catch(err => {
    console.error('❌ Database connection failed:', err);
    server.close(); // Shut down server if DB connection fails
    process.exit(1); // Exit process with error
  });
});

// Handle server startup errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please try a different port.`);
    console.error(`💡 You can set a different port in your .env file: PORT=5001`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});
