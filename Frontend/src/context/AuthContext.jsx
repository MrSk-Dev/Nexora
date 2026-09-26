import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get('/auth/me');
        setUser(res.data.data);
      } catch (error) {
        sessionStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    const { token, ...userData } = res.data.data;
    sessionStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await axiosInstance.post('/auth/register', formData);
    const { token, ...userData } = res.data.data;
    sessionStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  // Re-fetches the current user's profile from the backend.
  // Needed after actions that change the user's role server-side
  // (e.g. a customer applying to become a vendor) so the frontend's
  // cached role stays in sync without requiring a full logout/login.
  const refreshUser = async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
      setUser(res.data.data);
      return res.data.data;
    } catch (error) {
      return null;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};