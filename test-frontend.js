// Using built-in fetch

async function testFrontend() {
  try {
    console.log('Testing frontend...');
    
    // Test the main page
    const response = await fetch('http://localhost:8080');
    console.log('Frontend status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    const text = await response.text();
    console.log('First 200 chars:', text.substring(0, 200));
    
    // Test API endpoints
    console.log('\nTesting API endpoints...');
    
    const healthResponse = await fetch('http://localhost:3001/api/health');
    console.log('Health endpoint status:', healthResponse.status);
    
    const productsResponse = await fetch('http://localhost:3001/api/products');
    console.log('Products endpoint status:', productsResponse.status);
    
    const categoriesResponse = await fetch('http://localhost:3001/api/categories');
    console.log('Categories endpoint status:', categoriesResponse.status);
    
  } catch (error) {
    console.error('Error testing frontend:', error);
  }
}

testFrontend(); 