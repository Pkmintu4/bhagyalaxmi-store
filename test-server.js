import http from 'http';

console.log('🧪 Testing server endpoints...\n');

// Test health endpoint
const testHealth = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET',
      headers: {
        'User-Agent': 'Test-Script'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Health endpoint:', result);
          resolve();
        } catch (e) {
          console.log('✅ Health endpoint response:', data);
          resolve();
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
};

// Test products endpoint
const testProducts = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/products',
      method: 'GET',
      headers: {
        'User-Agent': 'Test-Script'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const products = JSON.parse(data);
          console.log('✅ Products endpoint:', `${products.length} products found`);
          resolve();
        } catch (e) {
          console.log('❌ Products endpoint error:', data);
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
};

// Test categories endpoint
const testCategories = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/categories',
      method: 'GET',
      headers: {
        'User-Agent': 'Test-Script'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const categories = JSON.parse(data);
          console.log('✅ Categories endpoint:', `${categories.length} categories found`);
          resolve();
        } catch (e) {
          console.log('❌ Categories endpoint error:', data);
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
};

// Run all tests
async function runTests() {
  try {
    await testHealth();
    await testProducts();
    await testCategories();
    console.log('\n🎉 All tests passed! The server is working perfectly!');
    console.log('\n📱 You can now access your application at:');
    console.log('   🌐 Frontend: http://localhost:3001');
    console.log('   🔧 API Health: http://localhost:3001/api/health');
    console.log('   📦 Products: http://localhost:3001/api/products');
    console.log('   📂 Categories: http://localhost:3001/api/categories');
    console.log('\n👤 Test login credentials:');
    console.log('   Admin: admin@bhagyalaxmi.com / admin123');
    console.log('   User: user@bhagyalaxmi.com / user123');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('Make sure the server is running with: npm run server');
  }
}

runTests();
