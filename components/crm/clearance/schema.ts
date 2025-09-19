
import * as z from "zod";

export const clearanceFormSchema = z.object({
  item_code: z.string().min(1, "Item is required"),
  description: z.string().optional(),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  expiration_date: z.string().min(1, "Expiration date is required"),
  note: z.string().optional(),
  clearance_price: z.number().min(0).optional(),
  uom: z.string().optional(),
  is_done: z.boolean().optional(),
});

export type ClearanceFormValues = z.infer<typeof clearanceFormSchema>;
