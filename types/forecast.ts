
export interface Forecast {
  id: string;
  title: string;
  description?: string;
  forecast_method: 'moving_average' | 'trend_analysis' | 'seasonal_adjustment';
  time_period_months: number;
  confidence_threshold: number;
  lead_time_days: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ForecastItem {
  id: string;
  forecast_id: string;
  item_code: string;
  description?: string;
  vendor_code?: string;
  historical_avg_monthly: number;
  predicted_quantity: number;
  confidence_score: number;
  recommended_order_date?: string;
  notes?: string;
  current_stock?: number;
  days_until_stockout?: number;
  stock_status?: string;
  trend?: string;
  effective_days_until_stockout?: number;
  created_at: string;
  updated_at: string;
}

export interface ForecastParameter {
  id: string;
  forecast_id: string;
  parameter_name: string;
  parameter_value: string;
  created_at: string;
}

export interface ForecastDetailResponse {
  forecast: Forecast;
  items: ForecastItem[];
  parameters: ForecastParameter[];
  forecastResults?: ForecastResult[];
}

export interface HistoricalDataPoint {
  month: string;
  quantity: number;
  amount: number;
}

export interface IncomingStockItem {
  shipment_id: string;
  eta: string;
  quantity: number;
  transport_mode: string;
  vendor_code: string;
  vendor_name: string;
}

export interface StockProjection {
  date: string;
  projected_stock: number;
  consumption: number;
  incoming_delivery: number;
}

export interface ForecastResult {
  item_code: string;
  description: string;
  vendor_code?: string;
  historical_data: HistoricalDataPoint[];
  predicted_quantity: number;
  confidence_score: number;
  recommended_order_date: string;
  estimated_arrival_date: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  current_stock: number;
  days_until_stockout: number;
  stock_status: 'critical' | 'low' | 'normal' | 'high';
  incoming_stock_items: IncomingStockItem[];
  incoming_stock_total: number;
  effective_days_until_stockout: number;
  projected_stock_timeline: StockProjection[];
  monthly_consumption: number;
}
