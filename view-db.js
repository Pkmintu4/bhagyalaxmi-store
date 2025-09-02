import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function viewData() {
  console.log('=== CATEGORIES ===')
  const categories = await prisma.category.findMany()
  console.log(categories)

  console.log('\n=== PRODUCTS ===')
  const products = await prisma.product.findMany({
    include: {
      category: true
    }
  })
  console.log(products.map(p => ({
    id: p.id,
    title: p.title,
    price: p.price,
    category: p.category.name,
    stock: p.stock
  })))

  console.log('\n=== USERS ===')
  const users = await prisma.user.findMany()
  console.log(users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role
  })))

  await prisma.$disconnect()
}

viewData().catch(console.error) 