import http from 'http';

console.log('🔍 Testing Categories API Endpoint...\n');

const testCategoriesAPI = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/categories',
      method: 'GET',
      headers: {
        'User-Agent': 'Test-Script',
        'Accept': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const categories = JSON.parse(data);
            console.log('✅ Categories API Response:');
            console.log(JSON.stringify(categories, null, 2));
            resolve(categories);
          } else {
            console.log('❌ API Error Response:');
            console.log(data);
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          console.log('❌ JSON Parse Error:');
          console.log('Raw response:', data);
          reject(e);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Request Error:', error.message);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      console.log('⏰ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
};

// Test the API
testCategoriesAPI()
  .then((categories) => {
    console.log('\n🎉 Categories API is working!');
    console.log(`📊 Found ${categories.length} categories`);
  })
  .catch((error) => {
    console.log('\n❌ Categories API failed:');
    console.log(error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure server is running: npm run server');
    console.log('2. Check if port 3001 is available');
    console.log('3. Verify database connection');
  });
