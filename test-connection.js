const API_BASE_URL = 'http://localhost:3001/api';

async function testConnection() {
  try {
    console.log('🔍 Testing frontend-backend connection...');
    
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test categories endpoint
    const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories fetched:', categoriesData.length);
    
    // Test products endpoint
    const productsResponse = await fetch(`${API_BASE_URL}/products`);
    const productsData = await productsResponse.json();
    console.log('✅ Products fetched:', productsData.length);
    
    console.log('🎉 Frontend-backend connection successful!');
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection(); 