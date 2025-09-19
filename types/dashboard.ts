// Enhanced Dashboard Types with Credit Memo Integration

export interface EnhancedMonthlyTurnover {
  month: string;
  total_quantity: number;
  total_turnover: number;
  total_cost: number;
  total_margin: number;
  margin_percent: number;
  credit_memo_amount: number;
  credit_memo_count: number;
  net_turnover: number;
  net_margin: number;
  net_margin_percent: number;
  credit_memo_impact_percent: number;
  delivery_fee_amount: number;
  delivery_fee_count: number;
  delivery_fee_impact_percent: number;
  net_turnover_excl_delivery: number;
  net_margin_excl_delivery: number;
  net_margin_percent_excl_delivery: number;
  display_month?: string;
}

export interface DashboardSummary {
  monthly_data: EnhancedMonthlyTurnover[];
  total_turnover: number;
  total_cost: number;
  total_margin: number;
  total_credit_memos: number;
  net_turnover: number;
  net_margin: number;
  credit_memo_impact_percent: number;
  // Product-only metrics
  product_revenue: number;
  product_cost: number;
  product_margin: number;
  product_margin_percent: number;
  product_transactions: number;
  product_cogs_coverage_percent: number;
  total_delivery_fees: number;
  delivery_fee_count: number;
  delivery_fee_impact_percent: number;
  net_turnover_excl_delivery: number;
  net_margin_excl_delivery: number;
  last_sales_date: Date | null;
  last_credit_memo_date: Date | null;
  last_transaction_date: Date | null;
  total_transactions: number;
  credit_memo_count: number;
  company_total_turnover: number;
  delivery_fees_included: boolean;
}

export interface CreditMemoSummary {
  lastDate: Date | null;
  totalAmount: number;
  count: number;
  impactPercentage: number;
  monthlyTrend: 'up' | 'down' | 'stable';
  isIncludedInCalculations: boolean;
}

export interface DeliveryFeeSummary {
  totalAmount: number;
  count: number;
  impactPercentage: number;
  monthlyTrend: 'up' | 'down' | 'stable';
  isIncludedInCalculations: boolean;
  lastDate: Date | null;
}

export interface DashboardMetrics {
  totalTurnover: number;
  totalCost: number;
  totalMargin: number;
  marginPercent: number;
  totalCreditMemos: number;
  netTurnover: number;
  netMargin: number;
  netMarginPercent: number;
  creditMemoImpact: number;
  // Product-only metrics
  productRevenue: number;
  productCost: number;
  productMargin: number;
  productMarginPercent: number;
  productTransactions: number;
  productCogsCoverage: number;
  totalDeliveryFees: number;
  deliveryFeeCount: number;
  deliveryFeeImpact: number;
  netTurnoverExclDelivery: number;
  netMarginExclDelivery: number;
  netMarginPercentExclDelivery: number;
  lastSalesDate: Date | null;
  lastCreditMemoDate: Date | null;
  lastTransactionDate: Date | null;
  totalTransactions: number;
  creditMemoCount: number;
  companyTotalTurnover: number;
  salespersonContribution: number;
  deliveryFeesIncluded: boolean;
}

export interface DashboardFilters {
  fromDate: Date;
  toDate: Date;
  salespersonCode?: string;
}

export interface DashboardChartData {
  monthlyTurnover: EnhancedMonthlyTurnover[];
  creditMemoTrend: {
    month: string;
    amount: number;
    count: number;
    impactPercent: number;
  }[];
}

export interface DashboardError {
  message: string;
  code?: string;
  details?: string;
}

export interface DashboardLoadingState {
  isLoadingTotal: boolean;
  isLoadingMonthly: boolean;
  isLoadingCreditMemos: boolean;
  isLoadingLastDates: boolean;
  isLoadingWeeklyData: boolean;
}

// Legacy interface for backward compatibility
export interface MonthlyTurnover {
  month: string;
  total_turnover: number;
  total_cost: number;
  total_margin: number;
  margin_percent: number;
  display_month?: string;
}

// RPC Function Response Types
export interface GetEnhancedMonthlyTurnoverResponse {
  month: string;
  total_quantity: number;
  total_turnover: number;
  total_cost: number;
  total_margin: number;
  margin_percent: number;
  credit_memo_amount: number;
  credit_memo_count: number;
  net_turnover: number;
  net_margin: number;
  net_margin_percent: number;
  credit_memo_impact_percent: number;
}

export interface GetDashboardSummaryResponse {
  monthly_data: any; // JSON data from RPC
  total_turnover: number;
  total_cost: number;
  total_margin: number;
  total_credit_memos: number;
  net_turnover: number;
  net_margin: number;
  credit_memo_impact_percent: number;
  // Product-only metrics
  product_revenue: number;
  product_cost: number;
  product_margin: number;
  product_margin_percent: number;
  product_transactions: number;
  product_cogs_coverage_percent: number;
  total_delivery_fees: number;
  delivery_fee_count: number;
  delivery_fee_impact_percent: number;
  net_turnover_excl_delivery: number;
  net_margin_excl_delivery: number;
  last_sales_date: string | null;
  last_credit_memo_date: string | null;
  last_transaction_date: string | null;
  total_transactions: number;
  credit_memo_count: number;
  company_total_turnover: number;
  delivery_fees_included: boolean;
}

// Chart Configuration Types
export interface ChartConfig {
  showCreditMemos: boolean;
  showNetValues: boolean;
  showTrends: boolean;
  colorScheme: 'default' | 'enhanced' | 'minimal';
}

// Credit Memo Trend Analysis
export interface CreditMemoTrendData {
  month: string;
  amount: number;
  count: number;
  impactPercent: number;
  trend: 'up' | 'down' | 'stable';
  severity: 'low' | 'medium' | 'high';
}

// Dashboard Performance Metrics
export interface DashboardPerformanceMetrics {
  queryTime: number;
  dataSize: number;
  cacheHitRate: number;
  lastUpdated: Date;
}