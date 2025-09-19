
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar, Target, Clock, Truck, Package } from 'lucide-react';
import type { ForecastFormData } from './forecastFormSchema';

interface ParametersSectionProps {
  form: UseFormReturn<ForecastFormData>;
}

const ParametersSection: React.FC<ParametersSectionProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <FormField
        control={form.control}
        name="time_period_months"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Historical Period (Months)
            </FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="1" 
                max="24"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confidence_threshold"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Confidence Threshold
            </FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0.1" 
                max="1" 
                step="0.1"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="lead_time_days"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Lead Time (Days)
            </FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="1" 
                max="365"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="shipping_time_days"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Shipping Time (Days)
            </FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="1" 
                max="365"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="target_stock_days"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Target Stock Coverage (Days)
            </FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="1" 
                max="365"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
                placeholder="How many days of stock to order"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ParametersSection;
