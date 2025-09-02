import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function viewUsers() {
  try {
    console.log('👥 Viewing all users in database...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`📊 Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error viewing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

viewUsers(); 