
import type { ForecastCalculationResult } from './types';
import { 
  calculateMovingAverage, 
  calculateConfidence, 
  calculateTrend,
  calculateTrendAnalysis,
  calculateSeasonalForecast
} from './algorithms';
import { 
  calculateProjectedStockTimeline, 
  calculateEffectiveDaysUntilStockout 
} from './incomingStockUtils';

export const calculateForecast = (
  rawHistoricalData: any[], // Raw historical data records
  totalHistoricalConsumption: number, // Pre-calculated total
  actualMonths: number, // Actual time period in months
  method: 'moving_average' | 'trend_analysis' | 'seasonal_adjustment',
  confidenceThreshold: number,
  leadTimeDays: number,
  shippingTimeDays: number,
  currentStock: number,
  incomingStock: any[] = [],
  targetStockDays: number = 30
): ForecastCalculationResult & { monthly_consumption: number } => {
  console.log(`[Calculator] Starting calculation with method: ${method}`);
  console.log(`[Calculator] Raw data: ${rawHistoricalData.length} records`);
  console.log(`[Calculator] Total consumption: ${totalHistoricalConsumption} over ${actualMonths} months`);
  console.log(`[Calculator] Current stock: ${currentStock}, incoming items: ${incomingStock.length}`);
  
  // Enhanced logging for incoming stock
  const totalIncomingQuantity = incomingStock.reduce((sum, item) => sum + item.quantity, 0);
  console.log(`[Calculator] Total incoming quantity: ${totalIncomingQuantity}`);
  incomingStock.forEach((item, index) => {
    console.log(`[Calculator] Incoming ${index + 1}: ${item.quantity} units, ETA: ${item.eta}`);
  });
  
  // Calculate monthly average consumption from the total and actual time period
  const monthlyAverageConsumption = actualMonths > 0 ? totalHistoricalConsumption / actualMonths : 0;
  
  console.log(`[Calculator] Monthly average consumption: ${monthlyAverageConsumption}`);
  
  // Extract quantities from raw data for algorithm calculations
  const quantities = rawHistoricalData.map(d => d.quantity || 0);
  
  let monthly_predicted_quantity = 0;
  let confidence_score = 0;
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';

  switch (method) {
    case 'moving_average':
      monthly_predicted_quantity = calculateMovingAverage(quantities);
      confidence_score = calculateConfidence(quantities, monthly_predicted_quantity);
      trend = calculateTrend(quantities);
      break;
    
    case 'trend_analysis':
      const trendResult = calculateTrendAnalysis(quantities);
      monthly_predicted_quantity = trendResult.prediction;
      confidence_score = trendResult.confidence;
      trend = trendResult.trend;
      break;
    
    case 'seasonal_adjustment':
      // For seasonal adjustment, we'll use the monthly average as the baseline
      monthly_predicted_quantity = monthlyAverageConsumption;
      confidence_score = Math.max(0.6, Math.min(0.95, quantities.length / 12));
      trend = calculateTrend(quantities);
      break;
    
    default:
      monthly_predicted_quantity = monthlyAverageConsumption;
      confidence_score = 0.5;
  }

  // Use the actual monthly average consumption for daily consumption calculation
  const dailyConsumption = monthlyAverageConsumption / 30;
  console.log(`[Calculator] Daily consumption rate: ${dailyConsumption} (from monthly average: ${monthlyAverageConsumption})`);
  
  // Calculate recommended order quantity based on target stock days using actual consumption
  const recommended_order_quantity = Math.round(dailyConsumption * targetStockDays);
  
  // Calculate regular days until stockout (without incoming stock)
  const days_until_stockout = dailyConsumption > 0 ? Math.floor(currentStock / dailyConsumption) : 999;
  
  // Enhanced calculation of effective days until stockout (with incoming stock)
  console.log(`[Calculator] Calculating effective days with enhanced method...`);
  const effective_days_until_stockout = calculateEffectiveDaysUntilStockout(
    currentStock, 
    dailyConsumption, 
    incomingStock
  );

  console.log(`[Calculator] Stock analysis - Regular days: ${days_until_stockout}, Effective days: ${effective_days_until_stockout}`);

  // Generate projected stock timeline with extended period
  const timelineDays = Math.max(leadTimeDays + shippingTimeDays + 60, 365); // Extend to at least 1 year
  const projected_stock_timeline = calculateProjectedStockTimeline(
    currentStock,
    dailyConsumption,
    incomingStock,
    timelineDays
  );
  
  // Total procurement time (lead time + shipping time)
  const totalProcurementTime = leadTimeDays + shippingTimeDays;
  
  // Determine stock status based on effective timeline with incoming stock
  let stock_status: 'critical' | 'low' | 'normal' | 'high';
  
  // Use effective days instead of regular days for more accurate risk assessment
  if (effective_days_until_stockout <= totalProcurementTime) {
    stock_status = 'critical';
  } else if (effective_days_until_stockout <= totalProcurementTime + 30) {
    stock_status = 'low';
  } else if (effective_days_until_stockout <= totalProcurementTime + 60) {
    stock_status = 'normal';
  } else {
    stock_status = 'high';
  }

  console.log(`[Calculator] Stock status: ${stock_status} (based on ${effective_days_until_stockout} effective days vs ${totalProcurementTime} procurement time)`);

  // Calculate recommended order date considering incoming stock
  let recommended_order_date: string;
  const today = new Date();
  
  if (stock_status === 'critical') {
    // Order immediately if stock is critical
    recommended_order_date = today.toISOString().split('T')[0];
  } else if (stock_status === 'low') {
    // Order within a few days if stock is low
    const orderDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    recommended_order_date = orderDate.toISOString().split('T')[0];
  } else {
    // Calculate optimal order date based on when we'll need new stock
    // We want to order when we have enough stock to last through procurement time + safety buffer
    const safetyBufferDays = 14; // 2 weeks safety buffer
    const optimalOrderDays = Math.max(0, effective_days_until_stockout - totalProcurementTime - safetyBufferDays);
    const orderDate = new Date(today.getTime() + optimalOrderDays * 24 * 60 * 60 * 1000);
    recommended_order_date = orderDate.toISOString().split('T')[0];
  }

  // Calculate ETA date: Order date + Lead time + Shipping time
  const orderDate = new Date(recommended_order_date);
  const etaDate = new Date(orderDate.getTime() + totalProcurementTime * 24 * 60 * 60 * 1000);
  const estimated_arrival_date = etaDate.toISOString().split('T')[0];

  const result = {
    predicted_quantity: recommended_order_quantity,
    confidence_score: Math.round(confidence_score * 100) / 100,
    recommended_order_date,
    estimated_arrival_date,
    trend,
    days_until_stockout,
    stock_status,
    effective_days_until_stockout,
    projected_stock_timeline,
    monthly_consumption: monthlyAverageConsumption
  };

  console.log(`[Calculator] Final result:`, result);
  return result;
};
