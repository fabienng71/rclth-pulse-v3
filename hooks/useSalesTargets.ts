
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SalesTarget {
  id?: string;
  salesperson_code: string;
  month: number;
  year: number;
  target_amount: number;
  created_at?: string;
  updated_at?: string;
}

export const useSalesTargets = (year: number, month: number) => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const { data: targets, isLoading, error } = useQuery({
    queryKey: ['sales-targets', year, month],
    queryFn: async () => {
      console.log('Fetching sales targets for:', { year, month });
      
      const { data, error } = await supabase
        .rpc('get_sales_targets', {
          p_year: year,
          p_month: month
        });

      if (error) {
        console.error('Error fetching sales targets:', error);
        throw error;
      }

      console.log('Fetched sales targets:', data);
      return (data || []) as SalesTarget[];
    },
  });

  const saveTargets = async (targetsToSave: Omit<SalesTarget, 'id' | 'created_at' | 'updated_at'>[]) => {
    setIsSaving(true);
    
    try {
      console.log('Saving sales targets:', { year, month, targets: targetsToSave });
      
      // Validate inputs before saving
      if (!year || !month || month < 1 || month > 12) {
        throw new Error('Invalid year or month parameters');
      }

      const { error } = await supabase
        .rpc('save_sales_targets', {
          p_year: year,
          p_month: month,
          p_targets: targetsToSave
        });

      if (error) {
        console.error('Error saving sales targets:', error);
        throw error;
      }

      console.log('Sales targets saved successfully');

      // Refresh the targets data
      queryClient.invalidateQueries({ queryKey: ['sales-targets', year, month] });
      
    } catch (error) {
      console.error('Save operation failed:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    targets,
    isLoading,
    error,
    saveTargets,
    isSaving,
  };
};
