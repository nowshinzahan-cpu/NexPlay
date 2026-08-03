import { createContext, useState, useCallback } from 'react';
import { adminAPI } from '../services/api';

export const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getDashboardStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    stats,
    loading,
    fetchStats
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
