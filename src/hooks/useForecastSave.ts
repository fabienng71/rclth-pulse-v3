
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { saveForecast } from '@/services/forecastService';
import type { ForecastResult } from '@/types/forecast';
import type { ForecastFormData } from '@/components/procurement/forecast/form/forecastFormSchema';

export const useForecastSave = () => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthStore();

  const handleSave = async (formData: ForecastFormData, results: ForecastResult[]) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);
      const forecastId = await saveForecast(formData, results, user.id);
      return forecastId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save forecast');
      setError(error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    handleSave,
    saving,
    error
  };
};
