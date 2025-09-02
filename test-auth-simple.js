import dotenv from 'dotenv';
dotenv.config();

console.log('🔐 Authentication System Check\n');

// Check environment variables
console.log('Environment Variables:');
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not set'}`);
console.log(`VITE_GOOGLE_CLIENT_ID: ${process.env.VITE_GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not set'}\n`);

// Test JWT functionality
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

console.log('JWT Test:');
try {
  const testPayload = { userId: 'test-123', email: 'test@example.com', role: 'USER' };
  const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '24h' });
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ JWT generation and verification working');
  console.log(`   Sample token created and verified successfully\n`);
} catch (error) {
  console.log('❌ JWT test failed:', error.message);
}

// Test bcrypt functionality
import bcrypt from 'bcryptjs';
console.log('Password Hashing Test:');
try {
  const testPassword = 'testPassword123';
  const hashedPassword = await bcrypt.hash(testPassword, 10);
  const isValid = await bcrypt.compare(testPassword, hashedPassword);
  console.log(`✅ Password hashing: ${isValid ? 'Working' : 'Failed'}\n`);
} catch (error) {
  console.log('❌ Password hashing test failed:', error.message);
}

console.log('Authentication components are ready!');
