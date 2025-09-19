
import { z } from 'zod';

export const forecastFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  forecast_method: z.enum(['moving_average', 'trend_analysis', 'seasonal_adjustment']),
  time_period_months: z.number().min(1).max(24),
  confidence_threshold: z.number().min(0.1).max(1),
  lead_time_days: z.number().min(1).max(365),
  shipping_time_days: z.number().min(1).max(90),
  target_stock_days: z.number().min(1).max(365),
  selectedItems: z.array(z.string()).min(1, 'Please select at least one item')
});

export type ForecastFormData = z.infer<typeof forecastFormSchema>;
export type ForecastFormValues = ForecastFormData; // Add this export alias
