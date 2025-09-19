export interface AdjustmentRequest {
  id: string;
  request_date: string;
  reason: string;
  notes: string;
  status: 'draft' | 'submitted' | 'approved';
  total_cost: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AdjustmentRequestItem {
  id: string;
  adjustment_request_id: string;
  item_code: string;
  description: string;
  current_stock: number;
  adjustment_value: number;
  unit_cost: number;
  total_cost: number;
}

export interface AdjustmentRequestWithItems extends AdjustmentRequest {
  adjustment_request_items: AdjustmentRequestItem[];
}

export interface AdjustmentFormData {
  reason: string;
  notes: string;
  items: {
    item_code: string;
    description: string;
    current_stock: number;
    adjustment_value: string;
    unit_cost: number;
  }[];
}

export { ADJUSTMENT_REASONS } from '@/components/forms/adjustment/schema';