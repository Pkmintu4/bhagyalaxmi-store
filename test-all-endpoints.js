import http from 'http';

console.log('🔍 Testing All API Endpoints...\n');

const testEndpoint = (path, name) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const result = JSON.parse(data);
            console.log(`✅ ${name}: ${res.statusCode} - ${typeof result === 'object' ? Object.keys(result).length + ' items' : 'OK'}`);
            resolve(result);
          } else {
            console.log(`❌ ${name}: ${res.statusCode} - ${data}`);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        } catch (e) {
          console.log(`⚠️  ${name}: ${res.statusCode} - Non-JSON response`);
          resolve(data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${name}: Connection failed - ${error.message}`);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${name}: Timeout`);
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
};

async function testAllEndpoints() {
  const endpoints = [
    { path: '/api/health', name: 'Health Check' },
    { path: '/api/info', name: 'API Info' },
    { path: '/api/categories', name: 'Categories' },
    { path: '/api/products', name: 'Products' },
    { path: '/api/products/category/jewellery', name: 'Jewellery Products' },
    { path: '/api/products/category/fashion', name: 'Fashion Products' }
  ];
  
  console.log('📊 Testing API Endpoints:');
  console.log('=' .repeat(50));
  
  let successCount = 0;
  let totalCount = endpoints.length;
  
  for (const endpoint of endpoints) {
    try {
      await testEndpoint(endpoint.path, endpoint.name);
      successCount++;
    } catch (error) {
      // Error already logged
    }
  }
  
  console.log('\n📈 Test Results:');
  console.log('=' .repeat(50));
  console.log(`✅ Successful: ${successCount}/${totalCount}`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 All API endpoints are working perfectly!');
  } else {
    console.log('\n⚠️  Some endpoints need attention.');
  }
  
  // Test frontend serving
  console.log('\n🌐 Testing Frontend Serving:');
  console.log('=' .repeat(50));
  
  try {
    await testEndpoint('/', 'Frontend (Home)');
    console.log('✅ Frontend is being served correctly');
  } catch (error) {
    console.log('❌ Frontend serving issue');
  }
}

testAllEndpoints();
