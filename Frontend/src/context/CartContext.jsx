import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'customer') return;
    setLoading(true);
    try {
      const res = await axiosInstance.get('/cart');
      setCart(res.data.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer') {
      fetchCart();
    } else {
      setCart({ items: [] });
    }
  }, [isAuthenticated, user, fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await axiosInstance.post('/cart', { productId, quantity });
    setCart(res.data.data);
    return res.data.data;
  };

  const updateCartItem = async (productId, quantity) => {
    const res = await axiosInstance.put(`/cart/${productId}`, { quantity });
    setCart(res.data.data);
    return res.data.data;
  };

  const removeFromCart = async (productId) => {
    const res = await axiosInstance.delete(`/cart/${productId}`);
    setCart(res.data.data);
    return res.data.data;
  };

  const clearCart = async () => {
    const res = await axiosInstance.delete('/cart');
    setCart(res.data.data);
    return res.data.data;
  };

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const value = {
    cart,
    loading,
    cartCount,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};