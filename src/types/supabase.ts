
// This file is now a simple re-export to maintain backwards compatibility
import type { Database } from '@/integrations/supabase/types';

// Re-export with a different name to avoid duplicate identifier
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type { Database as SupabaseDatabase };

// Add missing table types for lead center functionality
export interface LeadSampleLink {
  id: string;
  lead_id: string;
  sample_id: string;
  created_at: string;
  created_by: string | null;
}

export interface LeadActivityLink {
  id: string;
  lead_id: string;
  activity_id: string;
  created_at: string;
  created_by: string | null;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  note: string;
  note_type: 'general' | 'meeting' | 'call' | 'email' | 'follow_up';
  is_private: boolean;
  created_by: string | null;
  created_at: string;
}
