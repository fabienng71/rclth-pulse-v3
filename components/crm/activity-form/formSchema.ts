
import * as z from "zod";

export const activityFormSchema = z.object({
  activity_date: z.string().min(1, "Activity date is required"),
  activity_type: z.string().min(1, "Activity type is required"),
  entity_type: z.enum(["customer", "lead"]),
  is_lead: z.boolean().optional(), // Add this field for EntityTypeSelector compatibility
  customer_code: z.string().optional(),
  customer_name: z.string().optional(),
  lead_id: z.string().optional(),
  lead_name: z.string().optional(),
  contact_name: z.string().min(1, "Contact name is required"),
  salesperson_id: z.string().min(1, "Salesperson is required"),
  salesperson_name: z.string().min(1, "Salesperson name is required"),
  notes: z.string().optional(),
  follow_up_date: z.string().optional(),
  sample_request_id: z.string().optional(),
  project_id: z.string().optional(),
  parent_activity_id: z.string().optional(),
  quotation_id: z.string().optional(),
  pipeline_stage: z.string().default("Lead"),
}).refine((data) => {
  if (data.entity_type === "customer") {
    return data.customer_code && data.customer_name;
  } else if (data.entity_type === "lead") {
    return data.lead_id && data.lead_name;
  }
  return false;
}, {
  message: "Please select a valid customer or lead",
  path: ["entity_type"],
});

export type ActivityFormData = z.infer<typeof activityFormSchema>;
export type ActivityFormValues = ActivityFormData;
