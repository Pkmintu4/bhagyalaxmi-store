import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../lib/cart-service';

export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  images?: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
}

type CartAction = 
  | { type: 'SET_CART_ITEMS'; items: CartItem[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART_ITEMS':
      return {
        ...state,
        items: action.items,
        loading: false,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.loading,
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
};

interface CartContextType extends CartState {
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  loadCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], loading: false });
  const { isAuthenticated } = useAuth();

  const loadCart = async () => {
    if (!isAuthenticated) {
      dispatch({ type: 'SET_CART_ITEMS', items: [] });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      const cartItems = await cartService.getCartItems();
      dispatch({ type: 'SET_CART_ITEMS', items: cartItems });
    } catch (error) {
      console.error('Error loading cart:', error);
      dispatch({ type: 'SET_CART_ITEMS', items: [] });
    }
  };

  const addToCart = async (product: Product) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      await cartService.addToCart(product.id, 1);
      await loadCart(); // Reload cart from database
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      await cartService.removeFromCart(productId);
      await loadCart(); // Reload cart from database
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      await cartService.updateQuantity(productId, quantity);
      await loadCart(); // Reload cart from database
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      await cartService.clearCart();
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Load cart when user authentication changes
  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      loadCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};