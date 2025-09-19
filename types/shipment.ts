
import { z } from "zod";

// Shared schema for shipment forms
export const shipmentFormSchema = z.object({
  vendor_code: z.string().min(1, { message: "Vendor code is required" }),
  vendor_name: z.string().min(1, { message: "Vendor name is required" }),
  freight_forwarder: z.string().optional(),
  transport_mode: z.enum(["air", "sea"], { message: "Transport mode must be either air or sea" }),
  shipment_type: z.enum(["Chill", "Dry", "Frozen"], { message: "Shipment type is required" }),
  etd: z.date().optional(),
  eta: z.date().optional(),
});

export type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;

// Item schema with base_unit_code
export const shipmentItemSchema = z.object({
  item_code: z.string().min(1, { message: "Item code is required" }),
  description: z.string(),
  quantity: z.number().min(0.001, { message: "Quantity must be at least 0.001" }),
  base_unit_code: z.string().optional(),
  direct_unit_cost: z.number().optional(),
});

export type ShipmentItemValues = z.infer<typeof shipmentItemSchema>;
