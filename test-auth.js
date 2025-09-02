import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function testAuthentication() {
  console.log('🔐 Testing Authentication System...\n');

  try {
    // Test 1: Database Connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');

    // Test 2: Check existing users
    console.log('2. Checking existing users...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log(`✅ Found ${users.length} users in database:`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    console.log('');

    // Test 3: Password hashing and verification
    console.log('3. Testing password hashing...');
    const testPassword = 'testPassword123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const isValidPassword = await bcrypt.compare(testPassword, hashedPassword);
    console.log(`✅ Password hashing: ${isValidPassword ? 'Working' : 'Failed'}\n`);

    // Test 4: JWT token generation and verification
    console.log('4. Testing JWT tokens...');
    const testUser = { userId: 'test-id', email: 'test@example.com', role: 'USER' };
    const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '24h' });
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ JWT token generation and verification: Working');
      console.log(`   Token payload: ${JSON.stringify(decoded, null, 2)}\n`);
    } catch (error) {
      console.log('❌ JWT token verification failed:', error.message);
    }

    // Test 5: Check admin users
    console.log('5. Checking admin users...');
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    if (adminUsers.length > 0) {
      console.log(`✅ Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach(admin => {
        console.log(`   - ${admin.name} (${admin.email})`);
      });
    } else {
      console.log('⚠️  No admin users found. You may need to create one.');
    }
    console.log('');

    // Test 6: Test login credentials for existing users
    console.log('6. Testing login credentials...');
    const testCredentials = [
      { email: 'admin@bhagyalaxmi.com', password: 'admin123' },
      { email: 'user@bhagyalaxmi.com', password: 'user123' }
    ];

    for (const cred of testCredentials) {
      const user = await prisma.user.findUnique({
        where: { email: cred.email }
      });

      if (user) {
        if (user.password) {
          const isValid = await bcrypt.compare(cred.password, user.password);
          console.log(`   ${cred.email}: ${isValid ? '✅ Valid' : '❌ Invalid'} password`);
        } else {
          console.log(`   ${cred.email}: ⚠️  No password (Google user)`);
        }
      } else {
        console.log(`   ${cred.email}: ❌ User not found`);
      }
    }
    console.log('');

    // Test 7: Environment variables check
    console.log('7. Checking environment variables...');
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
    console.log(`   GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not set'}`);
    console.log(`   VITE_GOOGLE_CLIENT_ID: ${process.env.VITE_GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not set'}`);
    console.log('');

    console.log('🎉 Authentication system test completed!');

  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAuthentication();
