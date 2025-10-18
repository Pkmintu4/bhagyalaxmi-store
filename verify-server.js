import { spawn } from 'child_process';
import http from 'http';

console.log('🔍 Verifying server status...\n');

// Check if server is running
const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001/api/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Server is running!');
        console.log('📊 Health response:', data);
        resolve(true);
      });
    });
    
    req.on('error', () => {
      console.log('❌ Server is not running');
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      console.log('⏰ Server connection timeout');
      resolve(false);
    });
  });
};

// Start server if not running
const startServer = () => {
  console.log('🚀 Starting server...');
  const server = spawn('npm', ['run', 'server'], {
    stdio: 'pipe',
    shell: true
  });
  
  server.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Server running on')) {
      console.log('✅ Server started successfully!');
      setTimeout(() => {
        checkServer().then((isRunning) => {
          if (isRunning) {
            console.log('\n🎉 SUCCESS! Your application is working!');
            console.log('🌐 Open your browser and go to: http://localhost:3001');
            console.log('👤 Test login: admin@bhagyalaxmi.com / admin123');
            process.exit(0);
          }
        });
      }, 3000);
    }
  });
  
  server.stderr.on('data', (data) => {
    console.log('Server error:', data.toString());
  });
  
  return server;
};

// Main verification
async function verify() {
  const isRunning = await checkServer();
  
  if (!isRunning) {
    console.log('Starting server...');
    startServer();
  } else {
    console.log('\n🎉 SUCCESS! Your application is working!');
    console.log('🌐 Open your browser and go to: http://localhost:3001');
    console.log('👤 Test login: admin@bhagyalaxmi.com / admin123');
  }
}

verify();
