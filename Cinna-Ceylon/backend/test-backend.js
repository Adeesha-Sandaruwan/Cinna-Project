import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testBackend() {
  try {
    console.log('🧪 Testing Backend Server...\n');
    
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/`);
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${await healthResponse.text()}\n`);
    
    // Test 2: Test orders endpoint
    console.log('2. Testing orders endpoint...');
    const ordersResponse = await fetch(`${BASE_URL}/api/orders`);
    console.log(`   Status: ${ordersResponse.status}`);
    if (ordersResponse.ok) {
      const orders = await ordersResponse.json();
      console.log(`   Found ${orders.length} orders\n`);
    } else {
      console.log(`   Error: ${ordersResponse.statusText}\n`);
    }
    
    // Test 3: Test products endpoint
    console.log('3. Testing products endpoint...');
    const productsResponse = await fetch(`${BASE_URL}/api/products`);
    console.log(`   Status: ${productsResponse.status}`);
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      console.log(`   Found ${products.length} products\n`);
    } else {
      console.log(`   Error: ${productsResponse.statusText}\n`);
    }
    
    console.log('✅ Backend tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 5000');
    console.log('   Run: npm start (in the backend directory)');
  }
}

testBackend();
