import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
  
// Import Routes
import productRoutes from './routes/ProductRoutes.js';
import cartRoutes from './routes/CartRoutes.js';
import orderRoutes from './routes/OrderRoutes.js';
import inventoryRoutes from './routes/InventoryRoutes.js';
import reviewRoutes from './routes/ReviewRoutes.js';
import supplierRoutes from './routes/SupplierRoutes.js';
import supplyRecordRoutes from './routes/SupplyRecordRoutes.js';
import leaveReqRoutes from './routes/LeaveReqRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/supply-records', supplyRecordRoutes);
app.use('/api/leave-requests', leaveReqRoutes);

// Root test endpoint
app.get('/', (req, res) => {
  res.send('🌿 CinnaCeylon API is running 🚀');
});

// Port
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Server accessible at: http://localhost:${PORT}`);
  
  // Connect to DB after server starts
  connectDB().catch(err => {
    console.error('❌ Database connection failed:', err);
    server.close();
    process.exit(1);
  });
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});
