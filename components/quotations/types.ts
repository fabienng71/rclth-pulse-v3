
export interface FormData {
  title: string;
  customer_code: string;
  customer_name?: string;
  customer_address?: string;
  salesperson_code?: string;
  validity_days: number;
  payment_terms?: string;
  notes?: string;
  status: string;
  is_lead?: boolean;
  lead_id?: string;
  lead_name?: string;
}
