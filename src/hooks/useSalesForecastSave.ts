
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface SalesForecastData {
  vendor_code: string;
  item_code: string;
  forecast_quantity: number;
  eta_date: string | null;
  notes: string | null;
  salesperson_id: string | null;
  forecast_session_id?: string;
}

export const useSalesForecastSave = () => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveForecast = async (forecasts: SalesForecastData[]) => {
    setSaving(true);
    setError(null);
    
    try {
      console.log('Saving forecasts:', forecasts);
      
      // Validate data before saving
      const validForecasts = forecasts.filter(forecast => 
        forecast.vendor_code && 
        forecast.item_code && 
        forecast.forecast_quantity > 0
      );

      if (validForecasts.length === 0) {
        throw new Error('No valid forecasts to save');
      }

      // Save to sales_forecasts table
      const { data, error: insertError } = await supabase
        .from('sales_forecasts')
        .insert(validForecasts.map(forecast => ({
          vendor_code: forecast.vendor_code,
          item_code: forecast.item_code,
          forecast_quantity: forecast.forecast_quantity,
          eta_date: forecast.eta_date,
          notes: forecast.notes,
          salesperson_id: forecast.salesperson_id,
          forecast_session_id: forecast.forecast_session_id,
          status: 'active'
        })))
        .select();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Failed to save forecast: ${insertError.message}`);
      }

      console.log('Successfully saved forecasts:', data);
      return data;
      
    } catch (error) {
      console.error('Error saving sales forecast:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const saveCollaborativeForecast = async (
    sessionId: string,
    forecasts: Omit<SalesForecastData, 'forecast_session_id'>[]
  ) => {
    const forecastsWithSession = forecasts.map(forecast => ({
      ...forecast,
      forecast_session_id: sessionId
    }));

    return saveForecast(forecastsWithSession);
  };

  return { 
    saveForecast, 
    saveCollaborativeForecast,
    saving, 
    error,
    clearError: () => setError(null)
  };
};
