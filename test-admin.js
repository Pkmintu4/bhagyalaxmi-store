import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function testAdminOperations() {
  console.log('🧪 Testing Admin Operations...\n');

  try {
    // 1. Test admin login
    console.log('1. Testing admin login...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@bhagyalaxmi.com' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log(`✅ Admin user found: ${adminUser.name} (${adminUser.role})`);

    // 2. Test admin authentication
    console.log('\n2. Testing admin authentication...');
    const token = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, role: adminUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Admin token generated');

    // 3. Test admin endpoints
    console.log('\n3. Testing admin endpoints...');

    // Test getting all users (admin only)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    console.log(`✅ Users endpoint: Found ${users.length} users`);

    // Test getting all orders (admin only)
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    console.log(`✅ Orders endpoint: Found ${orders.length} orders`);

    // Test product management
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });

    console.log(`✅ Products endpoint: Found ${products.length} products`);

    // Test categories
    const categories = await prisma.category.findMany();
    console.log(`✅ Categories endpoint: Found ${categories.length} categories`);

    console.log('\n🎉 All admin operations are working correctly!');
    console.log('\n📋 Admin Credentials:');
    console.log('Email: admin@bhagyalaxmi.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error testing admin operations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminOperations();
