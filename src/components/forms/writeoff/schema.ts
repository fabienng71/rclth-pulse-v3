import { z } from 'zod';

export const writeoffFormSchema = z.object({
  reason: z.enum(['expired', 'damaged', 'lost', 'obsolete', 'other'], {
    required_error: 'Please select a reason for the write-off',
  }),
  notes: z.string().min(1, 'Notes are required'),
  items: z.array(z.object({
    item_code: z.string().min(1, 'Item code is required'),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    exp_date: z.date({
      required_error: 'Expiry date is required',
    }),
    cogs_unit: z.number().optional(),
  })).min(1, 'At least one item is required'),
});

export type WriteoffFormValues = z.infer<typeof writeoffFormSchema>;