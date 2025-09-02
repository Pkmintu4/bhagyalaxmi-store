// Set environment variable before importing anything
process.env.DATABASE_URL = "mongodb+srv://thalladapraneeth:Pr%40neeth4@bhagyalaxmistore.3bi7qiy.mongodb.net/shop-project?retryWrites=true&w=majority&appName=BhagyaLaxmiStore";

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test the connection
    await prisma.$connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Try to fetch categories
    const categories = await prisma.category.findMany();
    console.log('✅ Categories fetched:', categories.length);
    
    // Try to fetch products
    const products = await prisma.product.findMany();
    console.log('✅ Products fetched:', products.length);
    
    await prisma.$disconnect();
    console.log('✅ Database connection test completed successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testConnection(); 