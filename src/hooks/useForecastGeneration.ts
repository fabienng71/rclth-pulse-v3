
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ForecastResult } from '@/types/forecast';
import type { ForecastFormData } from '@/components/procurement/forecast/form/forecastFormSchema';
import { calculateForecast } from './forecast/calculator';
import { fetchIncomingStockForItem } from './forecast/incomingStockUtils';

export const useForecastGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const validateItemData = async (itemCode: string) => {
    console.log(`[Validation] Validating data for item: ${itemCode}`);
    
    // Check historical sales data
    const { data: salesData, error: salesError } = await supabase
      .from('consolidated_sales')
      .select('posting_date, quantity, amount')
      .eq('item_code', itemCode.trim())
      .limit(1);

    // Check current stock data
    const { data: stockData, error: stockError } = await supabase
      .from('stock_onhands')
      .select('quantity, adjust')
      .eq('item_code', itemCode.trim())
      .limit(1);

    // Check incoming stock data
    const incomingStock = await fetchIncomingStockForItem(itemCode);

    const validation = {
      hasHistoricalData: !salesError && salesData && salesData.length > 0,
      hasStockData: !stockError && stockData && stockData.length > 0,
      hasIncomingStock: incomingStock.length > 0,
      itemCode: itemCode.trim()
    };

    console.log(`[Validation] Item ${itemCode} validation result:`, validation);
    return validation;
  };

  const generateForecast = async (formData: ForecastFormData): Promise<ForecastResult[]> => {
    setLoading(true);
    setError(null);
    console.log(`[Forecast] Starting forecast generation for ${formData.selectedItems.length} items`);

    try {
      const results: ForecastResult[] = [];

      for (const itemCode of formData.selectedItems) {
        console.log(`[Forecast] Processing item: ${itemCode}`);
        
        // Validate item data first
        const validation = await validateItemData(itemCode);
        if (!validation.hasHistoricalData) {
          console.warn(`[Forecast] No historical data found for item: ${itemCode}, skipping`);
          continue;
        }

        // Calculate precise date range for the specified time period
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - formData.time_period_months);
        
        console.log(`[Forecast] Fetching data for ${itemCode} from ${startDate.toISOString()} to ${endDate.toISOString()} (${formData.time_period_months} months)`);

        // Fetch historical data for the item with normalized item code
        const normalizedItemCode = itemCode.trim();
        const { data: historicalData, error: historyError } = await supabase
          .from('consolidated_sales')
          .select('posting_date, quantity, amount, description, item_vendor_code')
          .eq('item_code', normalizedItemCode)
          .gte('posting_date', startDate.toISOString())
          .lte('posting_date', endDate.toISOString())
          .order('posting_date');

        if (historyError) {
          console.error(`[Forecast] Error fetching historical data for ${itemCode}:`, historyError);
          throw historyError;
        }

        if (!historicalData || historicalData.length === 0) {
          console.warn(`[Forecast] No historical data found for item: ${itemCode} in the specified time period`);
          continue;
        }

        // Calculate and log total consumption for verification
        const totalHistoricalConsumption = historicalData.reduce((sum, record) => sum + (record.quantity || 0), 0);
        const actualMonths = formData.time_period_months;
        const monthlyAverageConsumption = totalHistoricalConsumption / actualMonths;
        
        console.log(`[Forecast] Item ${itemCode}: Found ${historicalData.length} historical records`);
        console.log(`[Forecast] Total consumption: ${totalHistoricalConsumption} over ${actualMonths} months`);
        console.log(`[Forecast] Monthly average consumption: ${monthlyAverageConsumption}`);
        console.log(`[Forecast] Daily consumption rate: ${monthlyAverageConsumption / 30}`);

        // Fetch current stock data with better error handling
        let currentStock = 0;
        const { data: stockData, error: stockError } = await supabase
          .from('stock_onhands')
          .select('quantity, adjust')
          .eq('item_code', normalizedItemCode)
          .single();

        if (stockError && stockError.code !== 'PGRST116') {
          console.warn(`[Forecast] Error fetching stock for item ${itemCode}:`, stockError);
        } else if (stockData) {
          const rawQuantity = stockData.quantity || 0;
          const adjustQuantity = stockData.adjust || 0;
          // Calculate adjusted stock (ensure we don't get negative quantities)
          currentStock = Math.max(0, rawQuantity - adjustQuantity);
          console.log(`[Forecast] Stock for ${itemCode} - Raw: ${rawQuantity}, Adjust: ${adjustQuantity}, Available: ${currentStock}`);
        } else {
          console.warn(`[Forecast] No stock data found for item ${itemCode}, using 0`);
        }

        // Fetch incoming stock data for this item with enhanced logging
        console.log(`[Forecast] Fetching incoming stock for ${itemCode}...`);
        const incomingStockItems = await fetchIncomingStockForItem(normalizedItemCode);
        const incomingStockTotal = incomingStockItems.reduce((sum, item) => sum + item.quantity, 0);
        
        console.log(`[Forecast] Incoming stock for ${itemCode}: ${incomingStockTotal} units from ${incomingStockItems.length} shipments`);

        // Generate forecast using raw historical data and actual time period
        const forecast = calculateForecast(
          historicalData, // Pass raw data instead of grouped data
          totalHistoricalConsumption,
          actualMonths,
          formData.forecast_method,
          formData.confidence_threshold,
          formData.lead_time_days,
          formData.shipping_time_days,
          currentStock,
          incomingStockItems,
          formData.target_stock_days
        );

        console.log(`[Forecast] Forecast result for ${itemCode}:`, {
          predicted_quantity: forecast.predicted_quantity,
          stock_status: forecast.stock_status,
          days_until_stockout: forecast.days_until_stockout,
          effective_days_until_stockout: forecast.effective_days_until_stockout,
          adjusted_current_stock: currentStock,
          incoming_stock_total: incomingStockTotal,
          monthly_consumption: forecast.monthly_consumption
        });

        results.push({
          item_code: itemCode,
          description: historicalData[0]?.description || '',
          vendor_code: historicalData[0]?.item_vendor_code || undefined,
          historical_data: [], // We'll populate this if needed for display
          predicted_quantity: forecast.predicted_quantity,
          confidence_score: forecast.confidence_score,
          recommended_order_date: forecast.recommended_order_date,
          estimated_arrival_date: forecast.estimated_arrival_date,
          trend: forecast.trend,
          current_stock: currentStock,
          days_until_stockout: forecast.days_until_stockout,
          stock_status: forecast.stock_status,
          incoming_stock_items: incomingStockItems,
          incoming_stock_total: incomingStockTotal,
          effective_days_until_stockout: forecast.effective_days_until_stockout,
          projected_stock_timeline: forecast.projected_stock_timeline,
          monthly_consumption: forecast.monthly_consumption
        });
      }

      console.log(`[Forecast] Generated forecast for ${results.length} items successfully`);
      return results;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate forecast');
      console.error('[Forecast] Error generating forecast:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateForecast,
    loading,
    error
  };
};
