import { z } from 'zod';

export const ADJUSTMENT_REASONS = [
  { value: 'stock_count', label: 'Stock Count Correction' },
  { value: 'damage', label: 'Damage' },
  { value: 'theft', label: 'Theft/Loss' },
  { value: 'expired', label: 'Expired Items' },
  { value: 'transfer', label: 'Transfer Adjustment' },
  { value: 'system_error', label: 'System Error' },
  { value: 'other', label: 'Other' },
] as const;

export const adjustmentFormSchema = z.object({
  reason: z.enum(['stock_count', 'damage', 'theft', 'expired', 'transfer', 'system_error', 'other'], {
    required_error: 'Please select a reason for the adjustment',
  }),
  notes: z.string().min(1, 'Notes are required'),
  items: z.array(z.object({
    item_code: z.string().min(1, 'Item code is required'),
    description: z.string().min(1, 'Description is required'),
    current_stock: z.number().min(0, 'Current stock must be non-negative'),
    adjustment_value: z.string().refine(
      (val) => {
        // Allow empty for intermediate typing states
        if (val === '' || val === '-' || val === '.' || val === '-.') return true;
        const num = parseFloat(val);
        return !isNaN(num) && num !== 0;
      },
      'Adjustment value must be a valid non-zero number'
    ),
    unit_cost: z.number().min(0, 'Unit cost must be non-negative'),
  })).min(1, 'At least one item is required'),
});

export type AdjustmentFormValues = z.infer<typeof adjustmentFormSchema>;