
// Customer request types
export interface CustomerRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  customer_name: string;
  search_name?: string;
  customer_type_code?: string;
  salesperson_code?: string;
  address?: string;
  city?: string;
  company_name?: string;
  company_address?: string;
  company_city?: string;
  contacts: Array<{
    name: string;
    position?: string;
    phone?: string;
    email?: string;
    line?: string;
    whatsapp?: string;
  }>;
  customer_group?: string;
  region?: string;
  documents: {
    pp20?: boolean;
    company_registration?: boolean;
    id_card?: boolean;
  };
  credit_limit: number;
  credit_terms?: string;
  prepayment: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
}

// Customer request document types
export interface CustomerRequestDocument {
  id: string;
  customer_request_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

// Service response types
export interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface ServiceResult {
  success: boolean;
  error: Error | null;
}
