import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') {
      setWishlist({ products: [] });
      console.log('User is not authenticated or not a customer. Wishlist cleared.');
      return;
    }

    const loadWishlist = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/wishlist');
        setWishlist(res.data.data);
      } catch (error) {
        console.error('Failed to fetch wishlist:', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [isAuthenticated, user]);

  const addToWishlist = async (productId) => {
    const res = await axiosInstance.post('/wishlist', { productId });
    setWishlist(res.data.data);
    return res.data.data;
  };

  const removeFromWishlist = async (productId) => {
    const res = await axiosInstance.delete(`/wishlist/${productId}`);
    setWishlist(res.data.data);
    return res.data.data;
  };

  const isInWishlist = (productId) => {
    return wishlist.products?.some((p) => p._id === productId) || false;
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};