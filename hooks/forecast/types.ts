
export interface ForecastCalculationParams {
  historicalData: HistoricalDataPoint[];
  method: 'moving_average' | 'trend_analysis' | 'seasonal_adjustment';
  confidenceThreshold: number;
  leadTimeDays: number;
  shippingTimeDays: number;
  currentStock: number;
  incomingStock: IncomingStockItem[];
}

export interface ForecastCalculationResult {
  predicted_quantity: number;
  confidence_score: number;
  recommended_order_date: string;
  estimated_arrival_date: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  days_until_stockout: number;
  stock_status: 'critical' | 'low' | 'normal' | 'high';
  effective_days_until_stockout: number;
  projected_stock_timeline: StockProjection[];
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
