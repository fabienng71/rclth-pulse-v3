
import * as z from "zod";

export const contactFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  account: z.string().min(1, "Account is required"),
  position: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  telephone: z.string().optional(),
  whatsapp: z.string().optional(),
  line_id: z.string().optional(),
  region: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
