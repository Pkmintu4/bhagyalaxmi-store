import { authService } from './auth-service';

export const cartService = {
  // Get user's cart items
  async getCartItems() {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = authService.getToken();
      const response = await fetch('/api/cart', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }

      const cartItems = await response.json();
      return cartItems.map(item => ({
        id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        image: item.product.image,
        category: {
          id: item.product.category.id,
          name: item.product.category.name,
          slug: item.product.category.slug,
        },
        quantity: item.quantity,
      }));
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(productId, quantity = 1) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = authService.getToken();
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  async updateQuantity(productId, quantity) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = authService.getToken();
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(productId) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = authService.getToken();
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Clear cart
  async clearCart() {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const cartItems = await this.getCartItems();
      
      // Remove all items one by one
      for (const item of cartItems) {
        await this.removeFromCart(item.id);
      }

      return { message: 'Cart cleared successfully' };
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },
}; 