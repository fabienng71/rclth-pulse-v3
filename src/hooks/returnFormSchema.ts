
import { z } from 'zod';

// @deprecated Use EnhancedReturnForm with ReturnRequestFormData instead for multi-item support
console.warn('⚠️ DEPRECATED: returnFormSchema is deprecated. Use EnhancedReturnForm with ReturnRequestFormData instead for multi-item support.');

export const returnFormSchema = z.object({
  customerCode: z.string().min(1, 'Customer is required'),
  productCode: z.string().min(1, 'Product is required'),
  returnQuantity: z.number().min(0.01, 'Quantity must be at least 0.01'),
  returnDate: z.date(),
  reason: z.string().min(1, 'Reason is required'),
  comment: z.string().optional(),
  unit: z.string().optional(),
});

// @deprecated Use ReturnRequestFormData from EnhancedReturnForm instead
export type ReturnFormValues = z.infer<typeof returnFormSchema>;
