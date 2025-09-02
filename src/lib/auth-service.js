import { api } from './api';

export const authService = {
  // Register a new user
  async register(userData) {
    try {
      const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get user profile
  async getProfile() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  },

  // Google authentication
  async googleAuth(idToken) {
    try {
      const response = await fetch(`/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Google authentication failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Google authentication error:', error);
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        await fetch(`/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear localStorage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      return !!(token && user);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Get current user
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get token
  getToken() {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },
}; 