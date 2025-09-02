import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addData() {
  console.log('🌱 Adding data to MongoDB...')

  try {
    // Create categories one by one
    console.log('Creating categories...')
    
    const jewelleryCategory = await prisma.category.create({
      data: {
        name: 'JEWELLERY',
        description: 'Elegant jewellery pieces for every occasion',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
        slug: 'jewellery'
      }
    })
    console.log('✅ Jewellery category created')

    const fashionCategory = await prisma.category.create({
      data: {
        name: 'FASHION',
        description: 'Trendy fashion items and accessories',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
        slug: 'fashion'
      }
    })
    console.log('✅ Fashion category created')

    // Create some jewellery products
    console.log('Creating jewellery products...')
    const jewelleryProducts = [
      {
        title: 'Diamond Stud Earrings - 14K White Gold',
        description: 'Elegant diamond stud earrings perfect for any occasion',
        price: 299.99,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
        stock: 10,
        categoryId: jewelleryCategory.id
      },
      {
        title: 'Pearl Necklace - Freshwater Pearls',
        description: 'Beautiful freshwater pearl necklace with elegant design',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=300&fit=crop',
        stock: 15,
        categoryId: jewelleryCategory.id
      }
    ]

    for (const product of jewelleryProducts) {
      await prisma.product.create({ data: product })
    }
    console.log('✅ Jewellery products created')

    // Create some fashion products
    console.log('Creating fashion products...')
    const fashionProducts = [
      {
        title: 'Classic White T-Shirt - Premium Cotton',
        description: 'Comfortable white t-shirt made from premium cotton',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
        stock: 50,
        categoryId: fashionCategory.id
      },
      {
        title: 'Denim Jacket - Vintage Style',
        description: 'Vintage style denim jacket perfect for casual wear',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=300&fit=crop',
        stock: 30,
        categoryId: fashionCategory.id
      }
    ]

    for (const product of fashionProducts) {
      await prisma.product.create({ data: product })
    }
    console.log('✅ Fashion products created')

    // Create a test user
    console.log('Creating test user...')
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword123',
        role: 'USER'
      }
    })
    console.log('✅ Test user created')

    console.log('🎉 All data added successfully!')

  } catch (error) {
    console.error('❌ Error adding data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addData() 