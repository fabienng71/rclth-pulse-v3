export interface Quotation {
  id: string;
  created_at: string;
  title: string;
  customer_code: string;
  customer_name: string;
  customer_address: string;
  quote_number?: string | null;
  salesperson_code: string;
  validity_days: number;
  payment_terms: string;
  notes: string;
  status: QuotationStatus;
  archive: boolean;
  search_name?: string | null;
  is_lead?: boolean;
  lead_id?: string | null;
  lead_name?: string | null;
  quotation_items?: QuotationItem[]; // Optional for list views with items
}

export type QuotationStatus = 'draft' | 'final' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'archived';

export interface QuotationInsert {
  title: string;
  customer_code: string;
  customer_name: string;
  customer_address: string;
  salesperson_code: string;
  validity_days: number;
  payment_terms: string;
  notes: string;
  status: QuotationStatus;
  created_by?: string;
  quote_number?: string;
  archive: boolean;
  is_lead?: boolean;
  lead_id?: string | null;
  lead_name?: string | null;
}

export interface QuotationUpdate {
  title: string;
  customer_code: string;
  customer_name: string;
  customer_address: string;
  salesperson_code: string;
  validity_days: number;
  payment_terms: string;
  notes: string;
  status: QuotationStatus;
  updated_at?: string;
  archive?: boolean;
  is_lead?: boolean;
  lead_id?: string | null;
  lead_name?: string | null;
}

export interface QuotationItem {
  id: string;
  created_at: string;
  quotation_id: string;
  item_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number | null;
  unit_of_measure?: string | null;
}

export interface QuotationItemInsert {
  quotation_id: string;
  item_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number | null;
  unit_of_measure?: string | null;
}

export interface QuotationItemUpdate {
  item_code?: string;
  description?: string;
  quantity?: number;
  unit_price?: number;
  discount_percent?: number | null;
  unit_of_measure?: string | null;
}

export interface QuotationWithItems extends Quotation {
  items: QuotationItem[];
  salesperson_name?: string | null;
}
