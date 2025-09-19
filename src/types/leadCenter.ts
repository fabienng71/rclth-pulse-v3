// Food ingredients sales stages type
export type FoodIngredientsSalesStage = 'contacted' | 'meeting_scheduled' | 'samples_sent' | 'samples_followed_up' | 'negotiating' | 'closed_won' | 'closed_lost';

export interface LeadCenter {
  id: string;
  lead_title: string;
  lead_description?: string;
  status: FoodIngredientsSalesStage; // Now uses food ingredients sales stages
  lead_source?: string;
  priority: 'Low' | 'Medium' | 'High';
  assigned_to?: string;
  customer_id?: string;
  contact_id?: string;
  next_step?: string;
  next_step_due?: string;
  next_step_completed?: boolean;
  estimated_value?: number;
  close_probability?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Food ingredients industry specific fields
  customer_channel?: string;
  channel_compatibility_score?: number;
  recommended_products?: string[];
  sales_stage?: FoodIngredientsSalesStage; // Legacy field - status is now primary
  
  // Joined data
  assigned_user?: {
    id: string;
    name: string;
    email: string;
  };
  customer?: {
    customer_code: string;
    customer_name: string;
  };
  contact?: {
    id: string;
    contact_name: string;
    email: string;
  };
}

export interface LeadNote {
  id: string;
  lead_id: string;
  note: string;
  note_type: 'general' | 'meeting' | 'call' | 'email' | 'follow_up';
  is_private: boolean;
  created_by: string | null;
  created_at: string;
  
  // Joined data
  created_by_user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LeadCenterFilters {
  status?: string[];
  priority?: string[];
  assigned_to?: string[];
  lead_source?: string;
  next_step_due_from?: string;
  next_step_due_to?: string;
  search?: string;
}

export interface LeadCenterStats {
  total: number;
  open: number;
  in_progress: number;
  won: number;
  lost: number;
  total_value: number;
  avg_probability: number;
  // Enhanced metrics
  overdue_followups: number;
  this_week_conversions: number;
  avg_days_to_close: number;
  high_value_leads: number;
  active_leads: number;
  conversion_rate: number;
  lead_sources: Record<string, number>;
  priority_distribution: Record<string, number>;
  monthly_trend: {
    month: string;
    leads: number;
    conversions: number;
    value: number;
  }[];
}

// Channel product matrix for food ingredients compatibility
export interface ChannelProductMatrix {
  id: string;
  customer_channel: string;
  product_category: string;
  compatibility_level: 'high' | 'medium' | 'low';
  typical_order_size?: string;
  decision_maker?: string;
  sales_cycle_length?: string;
  created_at: string;
  updated_at: string;
}

// Channel information for display
export interface ChannelInfo {
  code: string;
  name: string;
  description: string;
  category: 'hotel' | 'restaurant' | 'retail' | 'other';
}