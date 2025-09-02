import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function addUsers() {
  try {
    console.log('🔐 Adding test users to database...');

    // Test users data
    const users = [
      {
        email: 'admin@bhagyalaxmi.com',
        name: 'Admin User',
        password: 'admin123',
        role: 'ADMIN'
      },
      {
        email: 'user@bhagyalaxmi.com',
        name: 'Test User',
        password: 'user123',
        role: 'USER'
      },
      {
        email: 'john@example.com',
        name: 'John Doe',
        password: 'john123',
        role: 'USER'
      },
      {
        email: 'jane@example.com',
        name: 'Jane Smith',
        password: 'jane123',
        role: 'USER'
      }
    ];

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role
        }
      });

      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }

    console.log('\n🎉 All users added successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@bhagyalaxmi.com / admin123');
    console.log('User: user@bhagyalaxmi.com / user123');
    console.log('John: john@example.com / john123');
    console.log('Jane: jane@example.com / jane123');

  } catch (error) {
    console.error('❌ Error adding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addUsers(); 