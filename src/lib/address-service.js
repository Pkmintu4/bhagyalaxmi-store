import { authService } from './auth-service';

export const addressService = {
  // Get user's addresses
  async getAddresses() {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = authService.getToken();
      const response = await fetch(`/api/addresses/${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  // Add new address
  async addAddress(addressData) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = authService.getToken();
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...addressData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add address');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  },

  // Update address
  async updateAddress(addressId, addressData) {
    try {
      const token = authService.getToken();
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        throw new Error('Failed to update address');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  // Delete address
  async deleteAddress(addressId) {
    try {
      const token = authService.getToken();
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },
}; 