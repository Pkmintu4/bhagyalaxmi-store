import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function manageUsers() {
  try {
    console.log('🔐 User Management System');
    console.log('========================\n');

    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'add':
        await addUser(args[1], args[2], args[3], args[4]);
        break;
      case 'delete':
        await deleteUser(args[1]);
        break;
      case 'list':
        await listUsers();
        break;
      case 'update':
        await updateUser(args[1], args[2], args[3], args[4]);
        break;
      default:
        console.log('Usage:');
        console.log('  node manage-users.js add <email> <password> <name> [role]');
        console.log('  node manage-users.js delete <email>');
        console.log('  node manage-users.js list');
        console.log('  node manage-users.js update <email> <field> <value>');
        console.log('\nExamples:');
        console.log('  node manage-users.js add john@test.com password123 "John Doe" USER');
        console.log('  node manage-users.js delete john@test.com');
        console.log('  node manage-users.js list');
        console.log('  node manage-users.js update john@test.com role ADMIN');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function addUser(email, password, name, role = 'USER') {
  if (!email || !password || !name) {
    console.log('❌ Email, password, and name are required');
    return;
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`❌ User ${email} already exists`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role.toUpperCase()
      }
    });

    console.log(`✅ Created user: ${user.email} (${user.role})`);
  } catch (error) {
    console.error('❌ Error creating user:', error);
  }
}

async function deleteUser(email) {
  if (!email) {
    console.log('❌ Email is required');
    return;
  }

  try {
    const user = await prisma.user.delete({
      where: { email }
    });

    console.log(`✅ Deleted user: ${user.email}`);
  } catch (error) {
    console.error('❌ Error deleting user:', error);
  }
}

async function listUsers() {
  try {
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
      console.log('❌ No users found');
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
    console.error('❌ Error listing users:', error);
  }
}

async function updateUser(email, field, value) {
  if (!email || !field || !value) {
    console.log('❌ Email, field, and value are required');
    return;
  }

  try {
    const updateData = {};
    
    if (field === 'password') {
      updateData.password = await bcrypt.hash(value, 10);
    } else if (field === 'role') {
      updateData.role = value.toUpperCase();
    } else {
      updateData[field] = value;
    }

    const user = await prisma.user.update({
      where: { email },
      data: updateData
    });

    console.log(`✅ Updated user: ${user.email} (${field} = ${value})`);
  } catch (error) {
    console.error('❌ Error updating user:', error);
  }
}

manageUsers(); 