import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Log environment variable status
console.log('🔍 Environment check:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:8081'
];
const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins]));

console.log('🌐 CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser or same-origin
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// JWT Middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Shop API Server', 
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      cart: '/api/cart'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER'
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  // In a real app, you might want to blacklist the token
  // For now, we'll just return a success message
  res.json({ message: 'Logout successful' });
});

// Google OAuth endpoints
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create new user with Google data
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password: '', // Google users don't need a password
          role: 'USER'
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Google authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('❌ Google authentication error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Attempting to fetch products...');
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true
      }
    });
    
    console.log(`✅ Successfully fetched ${products.length} products`);
    
    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      categoryId: product.categoryId,
      stock: product.stock,
      isActive: product.isActive,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug
      }
    }));
    
    res.json(formattedProducts);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true
      }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get products by category
app.get('/api/products/category/:categorySlug', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        category: {
          slug: req.params.categorySlug
        }
      },
      include: {
        category: true
      }
    });
    
    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      categoryId: product.categoryId,
      stock: product.stock,
      isActive: product.isActive,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug
      }
    }));
    
    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

// Search products
app.get('/api/products/search/:query', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            title: {
              contains: req.params.query
            }
          },
          {
            category: {
              name: {
                contains: req.params.query
              }
            }
          }
        ]
      },
      include: {
        category: true
      }
    });
    
    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      categoryId: product.categoryId,
      stock: product.stock,
      isActive: product.isActive,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug
      }
    }));
    
    res.json(formattedProducts);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    console.log('📂 Attempting to fetch categories...');
    const categories = await prisma.category.findMany();
    console.log(`✅ Successfully fetched ${categories.length} categories`);
    res.json(categories);
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ error: 'Failed to fetch categories', details: error.message });
  }
});

// Get category by slug
app.get('/api/categories/:slug', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Cart endpoints (protected routes)
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.userId },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });
    
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    console.log('Cart request:', {
      userId: req.user.userId,
      productId,
      quantity,
      userInfo: req.user
    });

    // Validate input
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('Product found:', product.title);
    
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: req.user.userId,
          productId
        }
      },
      update: {
        quantity
      },
      create: {
        userId: req.user.userId,
        productId,
        quantity
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });
    
    console.log('Cart item created/updated:', cartItem.id);
    res.json(cartItem);
  } catch (error) {
    console.error('Error updating cart:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      error: 'Failed to update cart',
      details: error.message 
    });
  }
});

app.delete('/api/cart/:productId', authenticateToken, async (req, res) => {
  try {
    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId: req.user.userId,
          productId: req.params.productId
        }
      }
    });
    
    res.json({ message: 'Cart item removed' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// Address endpoints (protected routes)
app.get('/api/addresses/:userId', authenticateToken, async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.params.userId },
      orderBy: { isDefault: 'desc' }
    });
    
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

app.post('/api/addresses', authenticateToken, async (req, res) => {
  try {
    const { 
      userId, 
      street, 
      city, 
      state, 
      postalCode, 
      country, 
      latitude,
      longitude,
      placeId,
      formattedAddress,
      isDefault, 
      addressType 
    } = req.body;
    
    // If this is set as default, update other addresses to not be default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }
    
    const newAddress = await prisma.address.create({
      data: {
        userId,
        street,
        city,
        state,
        postalCode,
        country: country || 'India',
        latitude: latitude || null,
        longitude: longitude || null,
        placeId: placeId || null,
        formattedAddress: formattedAddress || null,
        isDefault: isDefault || false,
        addressType: addressType || 'HOME'
      }
    });
    
    res.json(newAddress);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ error: 'Failed to create address' });
  }
});

app.put('/api/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const { 
      street, 
      city, 
      state, 
      postalCode, 
      country, 
      latitude,
      longitude,
      placeId,
      formattedAddress,
      isDefault, 
      addressType 
    } = req.body;
    
    // If setting as default, unset other default addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: req.user.userId,
          id: { not: req.params.id }
        },
        data: { isDefault: false }
      });
    }
    
    const updatedAddress = await prisma.address.update({
      where: { id: req.params.id },
      data: {
        street,
        city,
        state,
        postalCode,
        country: country || 'India',
        latitude: latitude || null,
        longitude: longitude || null,
        placeId: placeId || null,
        formattedAddress: formattedAddress || null,
        isDefault: isDefault !== undefined ? isDefault : false,
        addressType: addressType || 'HOME'
      }
    });
    
    res.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

app.delete('/api/addresses/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.address.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// Wishlist endpoints (protected routes)
app.get('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: req.user.userId },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });
    
    res.json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

app.post('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: req.user.userId,
        productId
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });
    
    res.json(wishlistItem);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

app.delete('/api/wishlist/:productId', authenticateToken, async (req, res) => {
  try {
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: req.user.userId,
          productId: req.params.productId
        }
      }
    });
    
    res.json({ message: 'Wishlist item removed' });
  } catch (error) {
    console.error('Error removing wishlist item:', error);
    res.status(500).json({ error: 'Failed to remove wishlist item' });
  }
});

// Admin middleware - check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// File upload endpoint for product images
app.post('/api/upload', authenticateToken, requireAdmin, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    res.json({
      message: 'Files uploaded successfully',
      images: imageUrls
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Admin product management endpoints
app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, price, stock, isActive, images } = req.body;
    
    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(isActive !== undefined && { isActive }),
        ...(images && { images })
      },
      include: {
        category: true
      }
    });
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, price, image, images, stock, categoryId, isActive } = req.body;
    
    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        image,
        images: images || [],
        stock: parseInt(stock),
        categoryId,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        category: true
      }
    });
    
    res.json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Admin orders endpoint
app.get('/api/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
app.put('/api/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
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
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Admin users endpoint
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Category management endpoints
app.post('/api/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, slug } = req.body;
    
    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
        slug
      }
    });
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, slug } = req.body;
    
    const updatedCategory = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(slug && { slug })
      }
    });
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Discount management endpoints
app.get('/api/discounts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(discounts);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({ error: 'Failed to fetch discounts' });
  }
});

app.post('/api/discounts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { code, percentage, maxUsage, validUntil } = req.body;
    
    const newDiscount = await prisma.discount.create({
      data: {
        code,
        percentage: parseFloat(percentage),
        maxUsage: parseInt(maxUsage),
        validUntil: new Date(validUntil),
        isActive: true,
        usageCount: 0
      }
    });
    
    res.status(201).json(newDiscount);
  } catch (error) {
    console.error('Error creating discount:', error);
    res.status(500).json({ error: 'Failed to create discount' });
  }
});

// Serve frontend build (SPA) - after API routes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.join(__dirname, 'dist');

if (fs.existsSync(clientDir)) {
  app.use(express.static(clientDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDir, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
}); 