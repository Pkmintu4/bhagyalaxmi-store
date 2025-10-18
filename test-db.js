import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

console.log('🔍 Testing database connection...\n');

async function testDatabase() {
  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test categories
    console.log('\n📂 Testing categories...');
    const categories = await prisma.category.findMany();
    console.log(`✅ Found ${categories.length} categories:`, categories.map(c => c.name));
    
    // Test products
    console.log('\n📦 Testing products...');
    const products = await prisma.product.findMany();
    console.log(`✅ Found ${products.length} products:`, products.map(p => p.title));
    
    // Test users
    console.log('\n👤 Testing users...');
    const users = await prisma.user.findMany();
    console.log(`✅ Found ${users.length} users:`, users.map(u => u.email));
    
    console.log('\n🎉 Database is working perfectly!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Users: ${users.length}`);
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();