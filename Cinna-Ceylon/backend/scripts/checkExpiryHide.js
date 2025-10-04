// Quick manual test script for expiry privatization
// Usage: node scripts/checkExpiryHide.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import connectDB from '../src/config/db.js';

dotenv.config();

async function run() {
  await connectDB();
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);

  // Create two sample products (one expired, one future) if not existing
  const expiredName = '__test_expired_product__';
  const futureName = '__test_future_product__';

  const expired = await Product.findOne({ name: expiredName }) || await Product.create({
    name: expiredName,
    type: 'test',
    price: 10,
    stock: 5,
    expiryDate: new Date(todayStart.getTime() - 86400000), // yesterday
    visibility: 'public'
  });

  const future = await Product.findOne({ name: futureName }) || await Product.create({
    name: futureName,
    type: 'test',
    price: 10,
    stock: 5,
    expiryDate: new Date(todayStart.getTime() + 86400000 * 5), // 5 days future
    visibility: 'public'
  });

  // Simulate listing call logic
  const result = await Product.find({ visibility: 'public', expiryDate: { $gte: todayStart } });

  console.log('Public non-expired products found:', result.map(p => p.name));

  if (result.some(p => p.name === expiredName)) {
    console.error('❌ Expired product still visible');
  } else {
    console.log('✅ Expired product hidden');
  }

  await mongoose.connection.close();
}

run().catch(e => { console.error(e); process.exit(1); });
