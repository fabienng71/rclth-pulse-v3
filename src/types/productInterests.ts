// Types for product interests and category management

export interface ProductCategory {
  posting_group: string;
  description: string;
}

export interface ProductItem {
  item_code: string;
  description: string;
  posting_group: string;
  vendor_code?: string;
  unit_price?: number;
}

export interface LeadProductInterest {
  id: string;
  lead_id: string;
  posting_group: string;
  specific_items: string[];
  interest_level: 'high' | 'medium' | 'low';
  estimated_monthly_volume?: number;
  price_sensitivity?: 'high' | 'medium' | 'low';
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CategoryPerformance {
  posting_group: string;
  customer_channel: string;
  performance_score: number;
  conversion_rate: number;
  avg_deal_size: number;
  sales_cycle_days: number;
  total_opportunities: number;
  recommendation: string;
}

export interface CategorySelectionData {
  category: ProductCategory;
  items: ProductItem[];
  selectedItems: string[];
  interestLevel: 'high' | 'medium' | 'low';
  estimatedVolume?: number;
  priceSensitivity?: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface ProductInterestFormData {
  interests: CategorySelectionData[];
}