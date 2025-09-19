
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { fetchForecasts, deleteForecast } from '@/services/forecastService';
import type { Forecast } from '@/types/forecast';

export const useForecasts = () => {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthStore();

  const loadForecasts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchForecasts();
      setForecasts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load forecasts'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForecast = async (id: string) => {
    try {
      await deleteForecast(id);
      setForecasts(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete forecast'));
      throw err;
    }
  };

  useEffect(() => {
    loadForecasts();
  }, [user]);

  return {
    forecasts,
    loading,
    error,
    loadForecasts,
    deleteForecast: handleDeleteForecast
  };
};
