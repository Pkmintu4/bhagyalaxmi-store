import { spawn } from 'child_process';
import http from 'http';

console.log('🚀 Starting server and testing categories...\n');

let serverProcess = null;

// Start server
const startServer = () => {
  return new Promise((resolve, reject) => {
    console.log('📡 Starting server...');
    serverProcess = spawn('npm', ['run', 'server'], {
      stdio: 'pipe',
      shell: true
    });
    
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Server:', output.trim());
      
      if (output.includes('Server running on')) {
        console.log('✅ Server started successfully!');
        setTimeout(resolve, 2000); // Wait 2 seconds for server to be ready
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.log('Server Error:', data.toString());
    });
    
    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
      reject(error);
    });
  });
};

// Test categories API
const testCategories = () => {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Testing categories API...');
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/categories',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`📊 Status: ${res.statusCode}`);
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const categories = JSON.parse(data);
            console.log('✅ Categories loaded successfully!');
            console.log(`📂 Found ${categories.length} categories:`);
            categories.forEach(cat => {
              console.log(`   - ${cat.name} (${cat.slug})`);
            });
            resolve(categories);
          } else {
            console.log('❌ API Error:', data);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        } catch (e) {
          console.log('❌ Parse Error:', data);
          reject(e);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Request failed:', error.message);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      console.log('⏰ Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
};

// Main execution
async function main() {
  try {
    await startServer();
    await testCategories();
    
    console.log('\n🎉 SUCCESS! Categories are working!');
    console.log('🌐 Your app is ready at: http://localhost:3001');
    console.log('\nPress Ctrl+C to stop the server');
    
    // Keep server running
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping server...');
      if (serverProcess) {
        serverProcess.kill();
      }
      process.exit(0);
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(1);
  }
}

main();
