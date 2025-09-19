import { z } from 'zod';

export const leadCenterSchema = z.object({
  lead_title: z.string().min(1, 'Lead title is required'),
  lead_description: z.string().optional(),
  status: z.enum(['contacted', 'meeting_scheduled', 'samples_sent', 'samples_followed_up', 'negotiating', 'closed_won', 'closed_lost']),
  lead_source: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']),
  assigned_to: z.string().optional(),
  customer_id: z.string().optional(),
  contact_id: z.string().optional(),
  estimated_value: z.number().positive().optional(),
  close_probability: z.number().min(0).max(100).optional(),
  next_step: z.string().optional(),
  next_step_due: z.string().optional(),
  customer_channel: z.string().optional(),
});

export type LeadCenterFormData = z.infer<typeof leadCenterSchema>;