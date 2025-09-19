
import * as z from "zod";

export const customerRequestSchema = z.object({
  // Basic customer information
  customer_name: z.string().min(1, { message: "Customer name is required" }),
  search_name: z.string().optional(),
  customer_type_code: z.string().min(1, { message: "Customer type is required" }),
  salesperson_code: z.string().min(1, { message: "Salesperson is required" }),
  
  // Address information
  address: z.string().optional(),
  city: z.string().optional(),
  
  // Company information
  company_name: z.string().optional(),
  company_address: z.string().optional(),
  company_city: z.string().optional(),
  
  // Classification
  customer_group: z.string().optional(),
  region: z.string().optional(),
  
  // Contacts - array of contact objects
  contacts: z.array(
    z.object({
      name: z.string().min(1, { message: "Contact name is required" }),
      position: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email({ message: "Invalid email format" }).optional().or(z.string().length(0)),
      line: z.string().optional(),
      whatsapp: z.string().optional(),
    })
  ).default([]),
  
  // Documents
  documents: z.object({
    pp20: z.boolean().default(false),
    company_registration: z.boolean().default(false),
    id_card: z.boolean().default(false),
  }).default({}),
  
  // Financial terms
  credit_limit: z.number().nonnegative().default(0),
  credit_terms: z.string().optional(),
  prepayment: z.boolean().default(false),
});

export type CustomerRequestFormValues = z.infer<typeof customerRequestSchema>;
