import { useState, useEffect } from 'react';
import { dashboardAPI } from '../lib/api';
import { toast } from 'react-toastify';

export const useDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
      toast.error(error.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    loading,
    refreshStats: loadStats,
  };
};