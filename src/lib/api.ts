export const api = {
  baseURL: 'http://localhost:3001/api'
};

const API_BASE_URL = '/api';

export interface Product {
  id: string
  title: string
  description?: string
  price: number
  image?: string
  categoryId: string
  stock: number
  isActive: boolean
  category: {
    id: string
    name: string
    slug: string
  }
}

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  slug: string
}

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Product API functions
export const getProducts = async (): Promise<Product[]> => {
  return await apiCall('/products');
}

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    return await apiCall(`/products/${id}`);
  } catch (error) {
    if (error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

export const getProductsByCategory = async (categorySlug: string): Promise<Product[]> => {
  return await apiCall(`/products/category/${categorySlug}`);
}

export const searchProducts = async (query: string): Promise<Product[]> => {
  return await apiCall(`/products/search/${encodeURIComponent(query)}`);
}

// Category API functions
export const getCategories = async (): Promise<Category[]> => {
  return await apiCall('/categories');
}

export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  try {
    return await apiCall(`/categories/${slug}`);
  } catch (error) {
    if (error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

// Cart API functions
export const createCartItem = async (userId: string, productId: string, quantity: number) => {
  return await apiCall('/cart', {
    method: 'POST',
    body: JSON.stringify({ userId, productId, quantity }),
  });
}

export const getCartItems = async (userId: string) => {
  return await apiCall(`/cart/${userId}`);
}

export const updateCartItemQuantity = async (userId: string, productId: string, quantity: number) => {
  if (quantity <= 0) {
    return await apiCall(`/cart/${userId}/${productId}`, {
      method: 'DELETE',
    });
  }

  return await apiCall('/cart', {
    method: 'POST',
    body: JSON.stringify({ userId, productId, quantity }),
  });
}

export const removeCartItem = async (userId: string, productId: string) => {
  return await apiCall(`/cart/${userId}/${productId}`, {
    method: 'DELETE',
  });
} 