
import * as z from "zod";

export const contactFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional().or(z.literal("")),
  account: z.string().min(1, "Account is required"),
  position: z.string().optional(),
  email: z.union([
    z.string().email("Invalid email format"),
    z.literal("")
  ]).optional(),
  telephone: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  line_id: z.string().optional().or(z.literal("")),
  region: z.string().optional().or(z.literal("")),
  customer_code: z.string().optional().or(z.literal("")),
  customer_name: z.string().optional().or(z.literal("")),
  search_name: z.string().optional().or(z.literal("")),
  salesperson: z.string().optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
