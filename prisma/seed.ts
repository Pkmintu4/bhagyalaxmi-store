import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories
  const categories = [
    {
      name: 'JEWELLERY',
      description: 'Elegant jewellery pieces for every occasion',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
      slug: 'jewellery'
    },
    {
      name: 'FASHION',
      description: 'Trendy fashion items and accessories',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
      slug: 'fashion'
    }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    })
  }

  console.log('✅ Categories seeded')

  // Get category IDs for product creation
  const jewelleryCategory = await prisma.category.findUnique({ where: { slug: 'jewellery' } })
  const fashionCategory = await prisma.category.findUnique({ where: { slug: 'fashion' } })

  // Create jewellery products
  const jewelleryProducts = [
    {
      title: 'Diamond Stud Earrings - 14K White Gold',
      description: 'Elegant diamond stud earrings perfect for any occasion',
      price: 24900,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
      stock: 10
    },
    {
      title: 'Pearl Necklace - Freshwater Pearls',
      description: 'Beautiful freshwater pearl necklace with elegant design',
      price: 7499,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=300&fit=crop',
      stock: 15
    },
    {
      title: 'Gold Chain Bracelet - 18K Gold',
      description: 'Premium 18K gold chain bracelet with secure clasp',
      price: 16600,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=300&fit=crop',
      stock: 8
    },
    {
      title: 'Sapphire Ring - Sterling Silver',
      description: 'Beautiful sapphire ring with sterling silver setting',
      price: 12999,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=300&fit=crop',
      stock: 12
    },
    {
      title: 'Ruby Pendant - 14K Gold',
      description: 'Stunning ruby pendant with 14K gold chain',
      price: 18999,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
      stock: 6
    }
  ]

  // Create fashion products
  const fashionProducts = [
    {
      title: 'Classic White T-Shirt',
      description: 'Premium cotton classic white t-shirt',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
      stock: 50
    },
    {
      title: 'Denim Jeans - Slim Fit',
      description: 'Comfortable slim fit denim jeans',
      price: 2499,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop',
      stock: 30
    },
    {
      title: 'Leather Jacket - Black',
      description: 'Stylish black leather jacket',
      price: 8999,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
      stock: 15
    },
    {
      title: 'Running Shoes - Athletic',
      description: 'Comfortable athletic running shoes',
      price: 3999,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
      stock: 25
    },
    {
      title: 'Casual Dress - Summer',
      description: 'Light and comfortable summer dress',
      price: 1999,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=300&fit=crop',
      stock: 20
    },
    {
      title: 'Formal Shirt - Business',
      description: 'Professional business formal shirt',
      price: 1799,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
      stock: 35
    },
    {
      title: 'Winter Coat - Warm',
      description: 'Warm and stylish winter coat',
      price: 5999,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
      stock: 12
    },
    {
      title: 'Sneakers - Casual',
      description: 'Comfortable casual sneakers',
      price: 2499,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
      stock: 40
    },
    {
      title: 'Handbag - Designer',
      description: 'Elegant designer handbag',
      price: 4999,
      image: 'https://images.unsplash.com/photo-1520903920245-4d4c2c1c0e1a?w=400&h=300&fit=crop',
      stock: 30
    },
    {
      title: 'Belt - Genuine Leather',
      description: 'High-quality genuine leather belt',
      price: 2910,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
      stock: 55
    }
  ]

  // Create jewellery products
  for (const product of jewelleryProducts) {
    await prisma.product.upsert({
      where: { 
        title_categoryId: {
          title: product.title,
          categoryId: jewelleryCategory!.id
        }
      },
      update: product,
      create: {
        ...product,
        categoryId: jewelleryCategory!.id
      }
    })
  }

  // Create fashion products
  for (const product of fashionProducts) {
    await prisma.product.upsert({
      where: { 
        title_categoryId: {
          title: product.title,
          categoryId: fashionCategory!.id
        }
      },
      update: product,
      create: {
        ...product,
        categoryId: fashionCategory!.id
      }
    })
  }

  console.log('✅ Products seeded')

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword123', // In real app, this would be properly hashed
      role: 'USER'
    }
  })

  console.log('✅ User seeded')
  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 