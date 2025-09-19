
export interface SampleRequestItem {
  item_code: string;
  description?: string;
  quantity: number;
  price?: number;
  is_free?: boolean;
  id?: string;
}

export interface SampleRequestFormData {
  customerCode: string;
  customerName: string;
  searchName?: string;
  notes?: string;
  followUpDate?: Date;
  items?: SampleRequestItem[];
  createdByName?: string;
  salespersonCode?: string;
}

export interface SampleRequest {
  id: string;
  customer_code: string;
  customer_name: string;
  search_name?: string;
  notes?: string;
  follow_up_date?: string;
  created_at: string;
  created_by_name?: string;
  salesperson_code?: string;
  quotation_title?: string;
  items?: SampleRequestItem[];
  sample_request_items?: SampleRequestItem[];
  // Add nested customers object like Return Requests
  customers?: {
    customer_name: string;
    search_name: string | null;
  };
}
