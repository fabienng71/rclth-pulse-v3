// Enhanced Items Report v2 Types - Salesperson-Focused Analytics

// Base item interface extending the current Item type
export interface ItemV2 {
  // Core item properties
  item_code: string;
  description: string | null;
  unit_price: number | null;
  base_unit_code: string | null;
  posting_group: string | null;
  vendor_code: string | null;
  brand: string | null;
  attribut_1: string | null;
  pricelist?: boolean | null;
  
  // Enhanced properties for v2
  sales_velocity?: number;
  margin_percent?: number;
  last_sale_date?: Date | null;
  stock_quantity?: number;
  reorder_level?: number;
  commission_rate?: number;
  category_rank?: number;
  demand_trend?: 'up' | 'down' | 'stable';
}

// Sales performance metrics for an item
export interface ItemSalesMetrics {
  item_code: string;
  total_sales_amount: number;
  total_quantity_sold: number;
  avg_selling_price: number;
  total_orders: number;
  unique_customers: number;
  sales_velocity: number; // Sales per day/week/month
  margin_amount: number;
  margin_percent: number;
  commission_amount: number;
  last_sale_date: Date | null;
  first_sale_date: Date | null;
  peak_sales_month: string | null;
  sales_trend: 'up' | 'down' | 'stable';
  performance_rating: 'low' | 'medium' | 'high';
}

// Customer demand patterns for items
export interface ItemCustomerDemand {
  item_code: string;
  customer_code: string;
  customer_name: string;
  total_purchased: number;
  last_purchase_date: Date | null;
  purchase_frequency: number; // Days between purchases
  avg_order_size: number;
  customer_segment: 'high-value' | 'regular' | 'occasional';
  reorder_probability: number; // 0-1 probability score
}

// Inventory intelligence for items
export interface ItemInventoryIntel {
  item_code: string;
  current_stock: number;
  reorder_point: number;
  max_stock_level: number;
  days_of_supply: number;
  stock_status: 'critical' | 'low' | 'adequate' | 'high';
  turnover_ratio: number;
  last_restock_date: Date | null;
  next_reorder_suggestion: Date | null;
  stock_value: number;
}

// Competitive intelligence for items
export interface ItemCompetitiveIntel {
  item_code: string;
  market_share_estimate: number; // 0-100 percentage
  competitor_count: number;
  price_position: 'low' | 'competitive' | 'premium';
  differentiation_factors: string[];
  opportunity_score: number; // 0-100 score
  threat_level: 'low' | 'medium' | 'high';
  recommended_action: string;
}

// Cross-sell and upsell opportunities
export interface ItemOpportunities {
  item_code: string;
  frequently_bought_together: string[]; // Item codes
  upsell_opportunities: string[]; // Higher-value alternatives
  cross_sell_score: number; // 0-100
  seasonal_boost_months: number[]; // Month numbers (1-12)
  target_customer_segments: string[];
  campaign_suggestions: string[];
}

// Comprehensive item analytics combining all data
export interface ItemAnalytics extends ItemV2 {
  sales_metrics: ItemSalesMetrics;
  inventory_intel: ItemInventoryIntel;
  competitive_intel?: ItemCompetitiveIntel;
  opportunities?: ItemOpportunities;
  customer_demand?: ItemCustomerDemand[];
  
  // Calculated insights
  overall_performance_score: number; // 0-100 composite score
  sales_forecast_30_days: number;
  margin_optimization_potential: number;
  commission_impact: number;
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  recommended_actions: string[];
  
  // Cost data from cogs_master integration (Phase 3 enhancement)
  cogs_unit?: number; // Unit cost from cogs_master
  cogs_available?: boolean; // Whether COGS data is available for accurate calculations
}

// Filter options for advanced filtering (Phase 4 enhancement)
export interface FilterOptions {
  categories: string[]; // Distinct posting_group values from items table
  brands: string[]; // Distinct brand values from items table
  vendors: string[]; // Distinct vendor_code values from items table
}

export interface FilterOptionsResponse {
  data: FilterOptions;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Filtering and search options for v2
export interface ItemsV2Filters {
  // Basic filters
  search_term?: string;
  categories?: string[];
  brands?: string[];
  vendors?: string[];
  price_range?: [number, number];
  
  // Performance filters
  performance_rating?: ('low' | 'medium' | 'high')[];
  sales_trend?: ('up' | 'down' | 'stable')[];
  margin_range?: [number, number];
  
  // Inventory filters
  stock_status?: ('critical' | 'low' | 'adequate' | 'high')[];
  has_reorder_alert?: boolean;
  
  // Sales context filters
  my_top_performers?: boolean;
  quick_wins?: boolean; // High margin, fast moving
  customer_favorites?: boolean;
  seasonal_opportunities?: boolean;
  
  // Date filters
  last_sale_after?: Date;
  created_after?: Date;
}

// Sort options for enhanced table/cards
export interface ItemsV2SortOptions {
  field: 'item_code' | 'description' | 'sales_velocity' | 'margin_percent' | 
         'total_sales' | 'last_sale_date' | 'performance_score' | 'commission_impact';
  direction: 'asc' | 'desc';
}

// View configuration for responsive design
export interface ItemsV2ViewConfig {
  layout: 'cards' | 'table' | 'list';
  card_size: 'compact' | 'standard' | 'detailed';
  show_charts: boolean;
  show_metrics: boolean;
  show_actions: boolean;
  columns_visible?: string[]; // For table view
}

// Dashboard summary statistics
export interface ItemsV2DashboardStats {
  total_items: number;
  top_performers: number;
  avg_margin: number;
  quick_wins: number;
  total_sales_value: number;
  commission_earned: number;
  items_sold_today: number;
  low_stock_alerts: number;
  
  // Trend indicators
  sales_trend_7_days: 'up' | 'down' | 'stable';
  margin_trend_7_days: 'up' | 'down' | 'stable';
  new_items_this_month: number;
  best_performing_category: string | null;
  
  // Cost data coverage metrics (Phase 3 enhancement)
  items_with_cogs: number; // Items with COGS data available
  cogs_coverage_percent: number; // Percentage of items with accurate cost data
}

// Quick actions for items
export interface ItemQuickAction {
  id: string;
  label: string;
  icon: string;
  action: 'quote' | 'sample' | 'reorder' | 'share' | 'favorite' | 'analyze';
  requires_selection: boolean;
  admin_only?: boolean;
}

// Export configuration
export interface ItemsV2ExportConfig {
  format: 'csv' | 'excel' | 'pdf';
  include_metrics: boolean;
  include_charts: boolean;
  filtered_data_only: boolean;
  columns?: string[];
  date_range?: [Date, Date];
}

// Pagination for large datasets
export interface ItemsV2Pagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// API response structure
export interface ItemsV2DataResponse {
  items: ItemAnalytics[];
  dashboard_stats: ItemsV2DashboardStats;
  pagination: ItemsV2Pagination;
  applied_filters: ItemsV2Filters;
  execution_time_ms: number;
  cache_hit: boolean;
}

// Error handling
export interface ItemsV2Error {
  code: string;
  message: string;
  details?: string;
  field?: string;
  timestamp: Date;
}

// Loading states for different sections
export interface ItemsV2LoadingState {
  items: boolean;
  dashboard_stats: boolean;
  analytics: boolean;
  export: boolean;
  search: boolean;
}

// User preferences for personalization
export interface ItemsV2UserPreferences {
  default_view: ItemsV2ViewConfig;
  favorite_filters: { name: string; filters: ItemsV2Filters }[];
  quick_actions_order: string[];
  dashboard_widgets: string[];
  notifications_enabled: boolean;
  auto_refresh_interval: number; // minutes
}

// Chart data structures for visualizations
export interface ItemPerformanceChartData {
  item_code: string;
  item_description: string;
  data_points: Array<{
    date: Date;
    sales_amount: number;
    margin_percent: number;
    quantity_sold: number;
  }>;
}

export interface MarginHeatMapData {
  item_code: string;
  category: string;
  brand: string;
  margin_percent: number;
  sales_volume: number;
  color_intensity: number; // 0-1 for heat map coloring
}

// Real-time updates and notifications
export interface ItemsV2Notification {
  id: string;
  type: 'stock_alert' | 'sales_milestone' | 'margin_change' | 'new_opportunity';
  item_code: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  read: boolean;
  action_required: boolean;
  action_url?: string;
}

// Predictive analytics results
export interface ItemPredictiveAnalytics {
  item_code: string;
  demand_forecast_30_days: number;
  confidence_score: number; // 0-1
  seasonal_adjustment: number;
  trend_direction: 'up' | 'down' | 'stable';
  recommended_stock_level: number;
  price_elasticity: number;
  churn_risk_score: number; // Risk of losing sales
}