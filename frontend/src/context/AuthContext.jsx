import { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  /**
   * Normalize backend user object to include `name` from `fullName`.
   * Backend stores `fullName` but frontend components consistently read `user?.name`.
   */
  const normalizeUser = useCallback((rawUser) => {
    if (!rawUser) return null;
    return {
      ...rawUser,
      name: rawUser.fullName || rawUser.name || rawUser.username || ''
    };
  }, []);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      const response = await authAPI.getMe();
      if (response.data.success) {
        setUser(normalizeUser(response.data.data.user));
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (emailOrUsername, password, rememberMe = false) => {
    try {
      const response = await authAPI.login({ emailOrUsername, password, rememberMe });
      if (response.data.success) {
        const { accessToken, refreshToken, user: userData } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        const normalized = normalizeUser(userData);
        localStorage.setItem('user', JSON.stringify(normalized));
        setUser(normalized);
      }
      return response.data;
    } catch (error) {
      // Re-throw with the server error message for the UI to display
      const message = error.response?.data?.message || 'Unable to connect to server. Please check your connection.';
      const enhancedError = new Error(message);
      enhancedError.response = error.response;
      throw enhancedError;
    }
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    return response.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // ignore
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    initialized,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isCompany: user?.role === 'company',
    isUser: user?.role === 'user'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
