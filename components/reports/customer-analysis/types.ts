
export interface CustomerAnalytics {
  id: string;
  customer_code: string;
  first_purchase_date: string | null;
  last_purchase_date: string | null;
  total_purchases: number;
  total_amount: number;
  average_order_value: number;
  purchase_frequency: number;
  top_categories: string[] | null;
  favorite_items: string[] | null;
  rfm_score: {
    recency: number;
    frequency: number;
    monetary: number;
    segment: string;
  } | null;
  buying_pattern: string | null;
  created_at: string;
  updated_at: string;
  last_analysis_date: string | null;
  yoy_growth: {
    yearly_growth: Array<{
      year: number;
      amount: number;
      growth_percentage: number;
    }>;
    average_growth: number;
  } | null;
  customer_segments: {
    value_segment: string;
    engagement_segment: string;
    growth_segment: string;
    metrics: {
      avg_order_value: number;
      purchase_frequency: number;
      total_revenue: number;
      growth_trend: number;
    };
  } | null;
}

export interface ItemAnalytics {
  id: string;
  item_code: string;
  first_sale_date: string | null;
  last_sale_date: string | null;
  total_sales_quantity: number;
  total_sales_amount: number;
  average_sales_price: number;
  sales_velocity: number;
  seasonal_patterns: {
    seasonal_months: Array<{
      month: number;
      strength: number;
    }>;
  } | null;
  complementary_items: {
    items: Array<{
      item_code: string;
      co_occurrence_count: number;
      avg_quantity: number;
    }>;
  } | null;
  average_margin: number;
  created_at: string;
  updated_at: string;
  last_analysis_date: string | null;
  price_elasticity: number | null;
  inventory_turnover: number | null;
}

export interface SavedAnalysis {
  id: string;
  customer_code: string;
  customer_name: string;
  search_name?: string | null;
  ai_analysis: string;
  date_range?: string | null;
  created_at: string;
}
