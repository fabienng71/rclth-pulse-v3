export interface WriteoffRequest {
  id: string;
  status: 'submitted' | 'approved';
  reason: 'expired' | 'damaged' | 'lost' | 'obsolete' | 'other';
  notes: string | null;
  total_cost: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface WriteoffRequestItem {
  id: string;
  writeoff_request_id: string;
  item_code: string;
  description: string | null;
  quantity: number;
  exp_date: string;
  cogs_unit: number | null;
  total_cost: number;
  created_at: string;
}

export interface WriteoffRequestWithItems extends WriteoffRequest {
  writeoff_request_items: WriteoffRequestItem[];
}

export interface WriteoffFormData {
  reason: 'expired' | 'damaged' | 'lost' | 'obsolete' | 'other';
  notes: string;
  items: {
    item_code: string;
    description: string;
    quantity: number;
    exp_date: Date;
    cogs_unit?: number;
  }[];
}

export const WRITEOFF_REASONS = [
  { value: 'expired', label: 'Expired' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'lost', label: 'Lost' },
  { value: 'obsolete', label: 'Obsolete' },
  { value: 'other', label: 'Other' }
] as const;