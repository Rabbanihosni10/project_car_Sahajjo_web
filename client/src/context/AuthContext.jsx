import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(sessionStorage.getItem('token') || localStorage.getItem('token'));

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Fetch user error:', error);
      // Clear invalid token
      if (error.response?.status === 401) {
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (email, password, remember = false) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user, requires2FA } = response.data;
      
      if (requires2FA) {
        // Do not set token/user yet; caller should trigger OTP verification
        toast.success('OTP sent. Please verify to continue.');
        return { success: true, requires2FA: true, user };
      }

      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      setToken(token);
      setUser(user);
      
      toast.success(`Welcome back, ${user.name}!`);
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData, remember = false) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      setToken(token);
      setUser(user);
      
      toast.success('Registration successful!');
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const logoutAll = async () => {
    try {
      await api.post('/auth/logout-all');
    } catch (_) {
      // ignore server errors; we'll still clear client tokens
    }
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out from all devices');
  };

  const completeLogin = (token, user, remember = false) => {
    if (remember) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    setToken(token);
    setUser(user);
  };
  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const isAdmin = user?.role === 'admin';
  const isDriver = user?.role === 'driver';
  const isOwner = user?.role === 'owner';

  const value = {
    user,
    loading,
    login,
    register,
    completeLogin,
    logout,
    logoutAll,
    updateUser,
    isAdmin,
    isDriver,
    isOwner,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
