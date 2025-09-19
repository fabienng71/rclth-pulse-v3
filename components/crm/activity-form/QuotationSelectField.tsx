
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ActivityFormData } from './formSchema';

interface QuotationSelectFieldProps {
  control: Control<ActivityFormData>;
}

interface Quotation {
  id: string;
  quote_number: string | null;
  title: string;
  customer_name: string | null;
  lead_name: string | null;
  status: string;
  created_at: string;
}

export const QuotationSelectField: React.FC<QuotationSelectFieldProps> = ({ control }) => {
  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ['quotations-for-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select('id, quote_number, title, customer_name, lead_name, status, created_at')
        .eq('archive', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotations:', error);
        throw error;
      }

      return data as Quotation[];
    },
  });

  const formatQuotationDisplay = (quotation: Quotation) => {
    const quotationNumber = quotation.quote_number || 'No Number';
    const title = quotation.title || 'Untitled';
    const entityName = quotation.customer_name || quotation.lead_name || 'Unknown';
    
    return `${quotationNumber} - ${title} (${entityName})`;
  };

  return (
    <FormField
      control={control}
      name="quotation_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Quotation (Optional)</FormLabel>
          <Select 
            onValueChange={(value) => {
              // Handle the "none" placeholder value by setting it to undefined
              field.onChange(value === "none" ? undefined : value);
            }} 
            value={field.value || "none"} 
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder={isLoading ? "Loading quotations..." : "Select a quotation"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white border shadow-lg z-50 max-h-[300px]">
              <SelectItem value="none">
                <span className="text-muted-foreground">No quotation selected</span>
              </SelectItem>
              {quotations.map((quotation) => (
                <SelectItem key={quotation.id} value={quotation.id}>
                  {formatQuotationDisplay(quotation)}
                </SelectItem>
              ))}
              {quotations.length === 0 && !isLoading && (
                <SelectItem value="no-quotations" disabled>
                  No quotations available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
