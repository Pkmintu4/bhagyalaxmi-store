import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function debugCart() {
  try {
    console.log('🔍 Debugging cart issue...\n');

    // Check database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected\n');

    // Check if users exist
    console.log('2. Checking users...');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    });
    console.log(`Found ${users.length} users:`);
    users.forEach(user => console.log(`  - ${user.email} (${user.role})`));
    console.log('');

    // Check if products exist
    console.log('3. Checking products...');
    const products = await prisma.product.findMany({
      select: { id: true, title: true, price: true, stock: true, isActive: true },
      take: 5
    });
    console.log(`Found ${products.length} products:`);
    products.forEach(product => console.log(`  - ${product.title} (₹${product.price})`));
    console.log('');

    // Check if categories exist
    console.log('4. Checking categories...');
    const categories = await prisma.category.findMany({
      select: { id: true, name: true }
    });
    console.log(`Found ${categories.length} categories:`);
    categories.forEach(cat => console.log(`  - ${cat.name}`));
    console.log('');

    // Check cart items
    console.log('5. Checking existing cart items...');
    const cartItems = await prisma.cartItem.findMany({
      include: {
        user: { select: { email: true } },
        product: { select: { title: true } }
      }
    });
    console.log(`Found ${cartItems.length} cart items:`);
    cartItems.forEach(item => console.log(`  - ${item.user.email}: ${item.product.title} (qty: ${item.quantity})`));
    console.log('');

    if (products.length === 0) {
      console.log('❌ No products found! Run: node add-data.js');
    }
    
    if (users.length === 0) {
      console.log('❌ No users found! Run: node add-users.js');
    }

    console.log('✅ Debug complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCart();
