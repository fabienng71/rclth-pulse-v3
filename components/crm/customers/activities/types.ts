
export interface CustomerActivity {
  id: string;
  customer_code: string;
  customer_name: string;
  activity_type: string;
  activity_date: string;
  status: string;
  pipeline_stage: string;
  salesperson_name: string;
  contact_name: string;
  notes: string;
  follow_up_date: string | null;
  project_id: string | null;
  sample_request_id: string | null;
}
