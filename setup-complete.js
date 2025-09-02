import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function setupComplete() {
  try {
    console.log('🚀 Setting up complete shop application...\n');

    // 1. Test database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected\n');

    // 2. Clear existing data (optional - comment out if you want to keep existing data)
    console.log('2. Clearing existing data...');
    await prisma.cartItem.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleared\n');

    // 3. Create categories
    console.log('3. Creating categories...');
    const jewelleryCategory = await prisma.category.create({
      data: {
        name: 'JEWELLERY',
        description: 'Elegant jewellery pieces for every occasion',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
        slug: 'jewellery'
      }
    });

    const fashionCategory = await prisma.category.create({
      data: {
        name: 'FASHION',
        description: 'Trendy fashion items and accessories',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
        slug: 'fashion'
      }
    });

    console.log('✅ Categories created\n');

    // 4. Create products
    console.log('4. Creating products...');
    const products = [
      // Jewellery products
      {
        title: 'Diamond Stud Earrings - 14K White Gold',
        description: 'Elegant diamond stud earrings perfect for any occasion. Crafted with premium 14K white gold.',
        price: 12999.99,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
        stock: 15,
        categoryId: jewelleryCategory.id,
        isActive: true
      },
      {
        title: 'Pearl Necklace - Freshwater Pearls',
        description: 'Beautiful freshwater pearl necklace with elegant design. Perfect for special occasions.',
        price: 8999.99,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=300&fit=crop',
        stock: 20,
        categoryId: jewelleryCategory.id,
        isActive: true
      },
      {
        title: 'Gold Chain Bracelet',
        description: 'Stylish gold chain bracelet with intricate design. Made with high-quality materials.',
        price: 15999.99,
        image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=300&fit=crop',
        stock: 12,
        categoryId: jewelleryCategory.id,
        isActive: true
      },
      // Fashion products
      {
        title: 'Designer Silk Saree',
        description: 'Premium silk saree with traditional embroidery. Perfect for weddings and festivals.',
        price: 25999.99,
        image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=300&fit=crop',
        stock: 8,
        categoryId: fashionCategory.id,
        isActive: true
      },
      {
        title: 'Cotton Kurta Set',
        description: 'Comfortable cotton kurta set for daily wear. Available in multiple colors.',
        price: 2999.99,
        image: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=400&h=300&fit=crop',
        stock: 25,
        categoryId: fashionCategory.id,
        isActive: true
      },
      {
        title: 'Leather Handbag',
        description: 'Premium leather handbag with modern design. Perfect for office and casual use.',
        price: 7999.99,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
        stock: 18,
        categoryId: fashionCategory.id,
        isActive: true
      },
    ];

    for (const productData of products) {
      await prisma.product.create({ data: productData });
    }
    console.log(`✅ ${products.length} products created\n`);

    // 5. Create users
    console.log('5. Creating users...');
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
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role
        }
      });
    }
    console.log(`✅ ${users.length} users created\n`);

    // 6. Create sample discount codes
    console.log('6. Creating discount codes...');
    const discounts = [
      {
        code: 'WELCOME10',
        percentage: 10,
        isActive: true,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        maxUsage: 100,
        usageCount: 0
      },
      {
        code: 'SAVE20',
        percentage: 20,
        isActive: true,
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        maxUsage: 50,
        usageCount: 0
      }
    ];

    for (const discountData of discounts) {
      await prisma.discount.create({ data: discountData });
    }
    console.log(`✅ ${discounts.length} discount codes created\n`);

    // 7. Verify setup
    console.log('7. Verifying setup...');
    const categoryCount = await prisma.category.count();
    const productCount = await prisma.product.count();
    const userCount = await prisma.user.count();
    const discountCount = await prisma.discount.count();

    console.log(`📊 Setup Summary:`);
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Discounts: ${discountCount}\n`);

    console.log('🎉 Complete setup finished successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('   Admin: admin@bhagyalaxmi.com / admin123');
    console.log('   User: user@bhagyalaxmi.com / user123');
    console.log('   John: john@example.com / john123');
    console.log('   Jane: jane@example.com / jane123\n');
    
    console.log('🚀 Next steps:');
    console.log('   1. Run: npm run dev:full');
    console.log('   2. Open: http://localhost:5173');
    console.log('   3. Login and test cart/wishlist functionality');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupComplete();
