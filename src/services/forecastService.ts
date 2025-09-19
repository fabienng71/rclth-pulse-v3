
import { supabase } from '@/integrations/supabase/client';
import type { Forecast, ForecastResult } from '@/types/forecast';
import type { ForecastFormData } from '@/components/procurement/forecast/form/forecastFormSchema';

export const saveForecast = async (
  formData: ForecastFormData,
  results: ForecastResult[],
  userId: string
): Promise<string> => {
  try {
    // First, create the forecast record
    const { data: forecast, error: forecastError } = await supabase
      .from('forecasts')
      .insert({
        title: formData.title,
        description: formData.description,
        forecast_method: formData.forecast_method,
        time_period_months: formData.time_period_months,
        confidence_threshold: formData.confidence_threshold,
        lead_time_days: formData.lead_time_days,
        status: 'completed',
        created_by: userId
      })
      .select()
      .single();

    if (forecastError) throw forecastError;

    const forecastId = forecast.id;

    // Save forecast items with all the detailed data in the notes field
    const forecastItems = results.map(result => ({
      forecast_id: forecastId,
      item_code: result.item_code,
      description: result.description,
      vendor_code: result.vendor_code,
      historical_avg_monthly: result.historical_data.reduce((sum, d) => sum + d.quantity, 0) / result.historical_data.length,
      predicted_quantity: result.predicted_quantity,
      confidence_score: result.confidence_score,
      recommended_order_date: result.recommended_order_date,
      notes: JSON.stringify({
        stock_status: result.stock_status,
        trend: result.trend,
        current_stock: result.current_stock,
        days_until_stockout: result.days_until_stockout,
        effective_days_until_stockout: result.effective_days_until_stockout,
        incoming_stock_total: result.incoming_stock_total,
        incoming_stock_items: result.incoming_stock_items,
        projected_stock_timeline: result.projected_stock_timeline,
        monthly_consumption: result.monthly_consumption
      })
    }));

    const { data: savedItems, error: itemsError } = await supabase
      .from('forecast_items')
      .insert(forecastItems)
      .select();

    if (itemsError) throw itemsError;

    // Save forecast parameters including the new target_stock_days
    const parameters = [
      { forecast_id: forecastId, parameter_name: 'shipping_time_days', parameter_value: formData.shipping_time_days.toString() },
      { forecast_id: forecastId, parameter_name: 'target_stock_days', parameter_value: formData.target_stock_days.toString() },
      { forecast_id: forecastId, parameter_name: 'selected_items', parameter_value: JSON.stringify(formData.selectedItems) }
    ];

    const { error: parametersError } = await supabase
      .from('forecast_parameters')
      .insert(parameters);

    if (parametersError) throw parametersError;

    return forecastId;
  } catch (error) {
    console.error('Error saving forecast:', error);
    throw error;
  }
};

export const fetchForecasts = async (): Promise<Forecast[]> => {
  try {
    const { data, error } = await supabase
      .from('forecasts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(forecast => ({
      ...forecast,
      forecast_method: forecast.forecast_method as 'moving_average' | 'trend_analysis' | 'seasonal_adjustment'
    })) as Forecast[];
  } catch (error) {
    console.error('Error fetching forecasts:', error);
    throw error;
  }
};

export const fetchForecastById = async (id: string) => {
  try {
    const { data: forecast, error: forecastError } = await supabase
      .from('forecasts')
      .select('*')
      .eq('id', id)
      .single();

    if (forecastError) throw forecastError;

    // Fetch forecast items with all detailed data
    const { data: items, error: itemsError } = await supabase
      .from('forecast_items')
      .select('*')
      .eq('forecast_id', id);

    if (itemsError) throw itemsError;

    // Fetch parameters
    const { data: parameters, error: parametersError } = await supabase
      .from('forecast_parameters')
      .select('*')
      .eq('forecast_id', id);

    if (parametersError) throw parametersError;

    // Reconstruct ForecastResult[] from database data
    const forecastResults: ForecastResult[] = items.map(item => {
      // Parse the notes field to get the additional data
      let additionalData;
      try {
        additionalData = item.notes ? JSON.parse(item.notes) : {};
      } catch (e) {
        additionalData = {};
      }

      return {
        item_code: item.item_code,
        description: item.description || '',
        vendor_code: item.vendor_code,
        historical_data: [], // We don't store historical data, but it's not needed for display
        predicted_quantity: item.predicted_quantity,
        confidence_score: item.confidence_score,
        recommended_order_date: item.recommended_order_date,
        estimated_arrival_date: item.recommended_order_date, // Calculate this if needed
        trend: additionalData.trend as 'increasing' | 'decreasing' | 'stable' || 'stable',
        current_stock: additionalData.current_stock || 0,
        days_until_stockout: additionalData.days_until_stockout || 0,
        stock_status: additionalData.stock_status as 'critical' | 'low' | 'normal' | 'high' || 'normal',
        incoming_stock_items: additionalData.incoming_stock_items || [],
        incoming_stock_total: additionalData.incoming_stock_total || 0,
        effective_days_until_stockout: additionalData.effective_days_until_stockout || 0,
        projected_stock_timeline: additionalData.projected_stock_timeline || [],
        monthly_consumption: additionalData.monthly_consumption || 0
      };
    });

    return {
      forecast: {
        ...forecast,
        forecast_method: forecast.forecast_method as 'moving_average' | 'trend_analysis' | 'seasonal_adjustment'
      },
      items: items || [],
      parameters: parameters || [],
      forecastResults // Add the reconstructed results
    };
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
};

export const deleteForecast = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('forecasts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting forecast:', error);
    throw error;
  }
};
