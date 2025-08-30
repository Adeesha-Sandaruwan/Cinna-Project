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
import leaveReqRoutes from './routes/LeaveReqRoutes.js';

dotenv.config();

const app = express();

// Enhanced CORS configuration for frontend
app.use(cors({
  origin: ['http://localhost:3002', 'http://127.0.0.1:3002'],
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
app.use('/api/leave-requests', leaveReqRoutes);

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
