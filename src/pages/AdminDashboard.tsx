import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import { 
  Edit, 
  Trash2, 
  Plus, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Settings,
  UserCheck,
  Tag,
  AlertTriangle,
  Percent,
  MessageSquare,
  Calendar,
  Filter
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  isActive: boolean;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  orderItems: Array<{
    product: {
      title: string;
      price: number;
    };
    quantity: number;
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Discount {
  id: string;
  code: string;
  percentage: number;
  isActive: boolean;
  validUntil: string;
  usageCount: number;
  maxUsage: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddDiscount, setShowAddDiscount] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
    images: [] as string[],
    stock: '',
    categoryId: '',
    isActive: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    slug: ''
  });

  const [discountForm, setDiscountForm] = useState({
    code: '',
    percentage: '',
    maxUsage: '',
    validUntil: ''
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const [productsData, categoriesData, ordersData, usersData, discountsData] = await Promise.all([
        fetch('/api/products', { headers }).then(res => res.json()),
        fetch('/api/categories', { headers }).then(res => res.json()),
        fetch('/api/orders', { headers }).then(res => res.json()),
        fetch('/api/users', { headers }).then(res => res.json()),
        fetch('/api/discounts', { headers }).then(res => res.json())
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setOrders(ordersData);
      setUsers(usersData);
      setDiscounts(discountsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Product Management
  const handleUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
        loadAdminData();
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock)
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product added successfully",
        });
        setShowAddProduct(false);
        setProductForm({
          title: '',
          description: '',
          price: '',
          image: '',
          images: [],
          stock: '',
          categoryId: '',
          isActive: true
        });
        loadAdminData();
      } else {
        throw new Error('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        loadAdminData();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  // Category Management
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category added successfully",
        });
        setShowAddCategory(false);
        setCategoryForm({ name: '', description: '', slug: '' });
        loadAdminData();
      } else {
        throw new Error('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  // Order Management
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Order status updated successfully",
        });
        loadAdminData();
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  // Discount Management
  const handleAddDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/discounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...discountForm,
          percentage: parseFloat(discountForm.percentage),
          maxUsage: parseInt(discountForm.maxUsage)
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Discount code added successfully",
        });
        setShowAddDiscount(false);
        setDiscountForm({ code: '', percentage: '', maxUsage: '', validUntil: '' });
        loadAdminData();
      } else {
        throw new Error('Failed to add discount');
      }
    } catch (error) {
      console.error('Error adding discount:', error);
      toast({
        title: "Error",
        description: "Failed to add discount",
        variant: "destructive",
      });
    }
  };

  // Analytics and Insights
  const calculateInsights = () => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStockProducts = products.filter(p => p.stock < 10).length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const totalUsers = users.length;
    const activeDiscounts = discounts.filter(d => d.isActive).length;

    // Monthly revenue calculation
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = orders
      .filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalProducts,
      activeProducts,
      totalValue,
      lowStockProducts,
      totalOrders,
      totalRevenue,
      monthlyRevenue,
      pendingOrders,
      totalUsers,
      activeDiscounts
    };
  };

  const insights = calculateInsights();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      {/* Enhanced Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {insights.activeProducts} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{insights.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ₹{insights.monthlyRevenue.toLocaleString()} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              {insights.totalOrders} total orders
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Product Management</h2>
            <Button onClick={() => setShowAddProduct(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold">{product.title}</h3>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">{product.category.name}</Badge>
                          {product.stock < 10 && (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Low Stock
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">₹{product.price}</div>
                        <div className="text-sm text-muted-foreground">Stock: {product.stock}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <h2 className="text-2xl font-bold">Order Management</h2>
          
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                        <Badge variant={
                          order.status === 'COMPLETED' ? 'default' :
                          order.status === 'PENDING' ? 'secondary' :
                          order.status === 'CANCELLED' ? 'destructive' : 'outline'
                        }>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Customer: {order.user.name} ({order.user.email})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Items: {order.orderItems.length} | Total: ₹{order.totalAmount}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="PROCESSING">Processing</SelectItem>
                          <SelectItem value="SHIPPED">Shipped</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <h2 className="text-2xl font-bold">User Management</h2>
          
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Category Management</h2>
            <Button onClick={() => setShowAddCategory(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
          
          <div className="grid gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Tag className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                        <p className="text-xs text-muted-foreground">Slug: {category.slug}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Discounts Tab */}
        <TabsContent value="discounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Discount Management</h2>
            <Button onClick={() => setShowAddDiscount(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Discount
            </Button>
          </div>
          
          <div className="grid gap-4">
            {discounts.map((discount) => (
              <Card key={discount.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Percent className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{discount.code}</h3>
                        <p className="text-sm text-muted-foreground">
                          {discount.percentage}% off
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Used: {discount.usageCount}/{discount.maxUsage} | 
                          Valid until: {new Date(discount.validUntil).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={discount.isActive ? "default" : "secondary"}>
                        {discount.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-2xl font-bold">Business Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alert</CardTitle>
                <CardDescription>Products with stock less than 10</CardDescription>
              </CardHeader>
              <CardContent>
                {products.filter(p => p.stock < 10).map(product => (
                  <div key={product.id} className="flex justify-between items-center py-2">
                    <span>{product.title}</span>
                    <Badge variant="destructive">{product.stock} left</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products by Stock Value</CardTitle>
                <CardDescription>Products with highest inventory value</CardDescription>
              </CardHeader>
              <CardContent>
                {products
                  .sort((a, b) => (b.price * b.stock) - (a.price * a.stock))
                  .slice(0, 5)
                  .map(product => (
                    <div key={product.id} className="flex justify-between items-center py-2">
                      <span>{product.title}</span>
                      <span className="font-medium">₹{(product.price * product.stock).toLocaleString()}</span>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest 5 orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex justify-between items-center py-2">
                    <div>
                      <div className="font-medium">{order.user.name}</div>
                      <div className="text-sm text-muted-foreground">{order.user.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{order.totalAmount}</div>
                      <Badge variant="outline">{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
                <CardDescription>Financial overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-bold">₹{insights.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>This Month:</span>
                  <span className="font-bold">₹{insights.monthlyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Orders:</span>
                  <span className="font-bold">{insights.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Orders:</span>
                  <span className="font-bold text-orange-600">{insights.pendingOrders}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={productForm.title}
                    onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="image">Main Image URL (Optional)</Label>
                  <Input
                    id="image"
                    value={productForm.image}
                    onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                    placeholder="Enter main image URL or upload images below"
                  />
                </div>
                <div>
                  <ImageUpload
                    onImagesUploaded={(imageUrls) => setProductForm({...productForm, images: imageUrls})}
                    maxImages={5}
                    existingImages={productForm.images}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={productForm.categoryId}
                    onValueChange={(value) => setProductForm({...productForm, categoryId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">Add Product</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddProduct(false);
                      setProductForm({
                        title: '',
                        description: '',
                        price: '',
                        image: '',
                        images: [],
                        stock: '',
                        categoryId: '',
                        isActive: true
                      });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <Label htmlFor="category-name">Name</Label>
                  <Input
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category-description">Description</Label>
                  <Textarea
                    id="category-description"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category-slug">Slug</Label>
                  <Input
                    id="category-slug"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">Add Category</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddCategory(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Discount Modal */}
      {showAddDiscount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Discount Code</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddDiscount} className="space-y-4">
                <div>
                  <Label htmlFor="discount-code">Code</Label>
                  <Input
                    id="discount-code"
                    value={discountForm.code}
                    onChange={(e) => setDiscountForm({...discountForm, code: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discount-percentage">Percentage (%)</Label>
                  <Input
                    id="discount-percentage"
                    type="number"
                    min="1"
                    max="100"
                    value={discountForm.percentage}
                    onChange={(e) => setDiscountForm({...discountForm, percentage: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discount-max-usage">Max Usage</Label>
                  <Input
                    id="discount-max-usage"
                    type="number"
                    value={discountForm.maxUsage}
                    onChange={(e) => setDiscountForm({...discountForm, maxUsage: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discount-valid-until">Valid Until</Label>
                  <Input
                    id="discount-valid-until"
                    type="date"
                    value={discountForm.validUntil}
                    onChange={(e) => setDiscountForm({...discountForm, validUntil: e.target.value})}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">Add Discount</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddDiscount(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price">Price (₹)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => {
                      handleUpdateProduct(editingProduct.id, {
                        title: editingProduct.title,
                        price: editingProduct.price,
                        stock: editingProduct.stock
                      });
                      setEditingProduct(null);
                    }}
                    className="flex-1"
                  >
                    Update
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingProduct(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Order Details - #{selectedOrder.id.slice(-8)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Customer Information</h3>
                  <p>Name: {selectedOrder.user.name}</p>
                  <p>Email: {selectedOrder.user.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Order Items</h3>
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between py-2">
                      <span>{item.product.title} x {item.quantity}</span>
                      <span>₹{item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₹{selectedOrder.totalAmount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 