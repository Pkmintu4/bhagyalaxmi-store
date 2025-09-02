import { authService } from './auth-service';

export const wishlistService = {
  // Get user's wishlist
  async getWishlist() {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = authService.getToken();
      const response = await fetch('/api/wishlist', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }

      const wishlistItems = await response.json();
      return wishlistItems.map(item => ({
        id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        image: item.product.image,
        category: {
          id: item.product.category.id,
          name: item.product.category.name,
          slug: item.product.category.slug,
        },
        addedAt: item.createdAt,
      }));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  // Add item to wishlist
  async addToWishlist(productId) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = authService.getToken();
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to wishlist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  // Remove item from wishlist
  async removeFromWishlist(productId) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = authService.getToken();
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  // Check if product is in wishlist
  async isInWishlist(productId) {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.some(item => item.id === productId);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return false;
    }
  },
}; 