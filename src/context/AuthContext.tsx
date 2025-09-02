import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../lib/auth-service';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string } | { idToken: string }) => Promise<void>;
  register: (userData: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear invalid auth data
      try {
        authService.logout();
      } catch (logoutError) {
        console.error('Logout error during auth check:', logoutError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string } | { idToken: string }) => {
    try {
      setIsLoading(true);
      let response;
      
      if ('idToken' in credentials) {
        // Google authentication
        response = await authService.googleAuth(credentials.idToken);
      } else {
        // Regular email/password authentication
        response = await authService.login(credentials);
      }
      
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; password: string; name: string }) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      setUser(response.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if API call fails
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 