
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export interface SalesForecastRecord {
  id: string;
  vendor_code: string;
  item_code: string;
  forecast_quantity: number;
  eta_date: string | null;
  notes: string | null;
  status: 'active' | 'archived';
  salesperson_id: string | null;
  created_at: string;
  updated_at: string;
  // Join fields
  salesperson_name?: string;
  salesperson_email?: string;
  item_description?: string;
  vendor_name?: string;
}

export const useSalesForecastManagement = () => {
  const { user, isAdmin } = useAuthStore();
  const [forecasts, setForecasts] = useState<SalesForecastRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecasts = async (statusFilter: 'active' | 'archived' | 'all' = 'active') => {
    if (!isAdmin) {
      setError('Access denied. Admin privileges required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('sales_forecasts')
        .select(`
          id,
          vendor_code,
          item_code,
          forecast_quantity,
          eta_date,
          notes,
          status,
          salesperson_id,
          created_at,
          updated_at,
          profiles:salesperson_id (
            full_name,
            email
          ),
          items (
            description
          ),
          vendors (
            vendor_name
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(`Failed to fetch forecasts: ${fetchError.message}`);
      }

      const formattedData = data?.map((forecast: any) => ({
        ...forecast,
        salesperson_name: forecast.profiles?.full_name || null,
        salesperson_email: forecast.profiles?.email || null,
        item_description: forecast.items?.description || null,
        vendor_name: forecast.vendors?.vendor_name || null,
      })) || [];

      setForecasts(formattedData);
    } catch (err) {
      console.error('Error fetching forecasts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteForecast = async (forecastId: string) => {
    if (!isAdmin) {
      throw new Error('Access denied. Admin privileges required.');
    }

    const { error: deleteError } = await supabase
      .from('sales_forecasts')
      .delete()
      .eq('id', forecastId);

    if (deleteError) {
      throw new Error(`Failed to delete forecast: ${deleteError.message}`);
    }

    // Remove from local state
    setForecasts(prev => prev.filter(f => f.id !== forecastId));
  };

  const archiveForecast = async (forecastId: string, archive: boolean = true) => {
    if (!isAdmin) {
      throw new Error('Access denied. Admin privileges required.');
    }

    const newStatus = archive ? 'archived' : 'active';

    const { error: updateError } = await supabase
      .from('sales_forecasts')
      .update({ status: newStatus })
      .eq('id', forecastId);

    if (updateError) {
      throw new Error(`Failed to ${archive ? 'archive' : 'unarchive'} forecast: ${updateError.message}`);
    }

    // Update local state
    setForecasts(prev => prev.map(f => 
      f.id === forecastId ? { ...f, status: newStatus } : f
    ));
  };

  return {
    forecasts,
    loading,
    error,
    isAdmin,
    fetchForecasts,
    deleteForecast,
    archiveForecast
  };
};
