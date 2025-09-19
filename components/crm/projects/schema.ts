
import * as z from "zod";

export const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  vendor_code: z.string().min(1, "Vendor is required"),
  vendor_name: z.string().optional(),
  target_type: z.enum(["PC", "KG", "Amount"]),
  target_value: z.number().min(0, "Target value must be positive"),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
