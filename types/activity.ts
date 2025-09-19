
export interface Activity {
  id: string;
  activity_type: string;
  activity_date: string;
  customer_name?: string;
  customer_code?: string;
  contact_name?: string;
  salesperson_name?: string;
  status?: string;
  notes?: string;
  follow_up_date?: string;
  pipeline_stage?: string;
  project_id?: string;
  sample_request_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ActivityLink {
  id: string;
  lead_id: string;
  activity_id: string;
  linked_at: string;
  activity: Activity;
}
