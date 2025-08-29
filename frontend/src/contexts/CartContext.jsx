import { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (err) {
      setError(err.message);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (menuItemId, quantity = 1, customizations = {}) => {
    try {
      setError(null);
      const response = await cartService.addToCart(menuItemId, quantity, customizations);
      setCart(response.cart || response); // Handle both response formats
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeFromCart = async (menuItemId) => {
    try {
      setError(null);
      const response = await cartService.removeFromCart(menuItemId);
      setCart(response.cart || response); // Handle both response formats
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCartItem = async (menuItemId, quantity) => {
    try {
      setError(null);
      const response = await cartService.updateCartItem(menuItemId, quantity);
      setCart(response.cart || response); // Handle both response formats
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const applyDiscount = async (discountCode) => {
    try {
      setError(null);
      const response = await cartService.applyDiscount(discountCode);
      setCart(response.cart || response); // Handle both response formats
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeDiscount = async () => {
    try {
      setError(null);
      const response = await cartService.removeDiscount();
      setCart(response.cart || response); // Handle both response formats
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      await cartService.clearCart();
      setCart(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getCartItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    if (!cart) return 0;
    return cart.totalAfterDiscount || cart.totalAmount || 0;
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    applyDiscount,
    removeDiscount,
    clearCart,
    getCartItemCount,
    getCartTotal,
    clearError
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
