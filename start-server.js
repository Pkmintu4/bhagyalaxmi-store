import { spawn } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set the environment variable if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "mongodb+srv://thalladapraneeth:Pr%40neeth4@bhagyalaxmistore.3bi7qiy.mongodb.net/shop-project?retryWrites=true&w=majority&appName=BhagyaLaxmiStore";
}

console.log('🚀 Starting server with DATABASE_URL set...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

// Import and start the server
import('./server.js'); 