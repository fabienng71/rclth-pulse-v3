
import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContactFormValues } from './schema';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SalespersonSelectProps {
  control: Control<ContactFormValues>;
}

export const SalespersonSelect: React.FC<SalespersonSelectProps> = ({ control }) => {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, spp_code')
        .eq('is_active', true)
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <FormField
      control={control}
      name="salesperson"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Salesperson</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select salesperson" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                <>
                  <SelectItem value="none">
                    <span className="text-gray-400">No salesperson</span>
                  </SelectItem>
                  {profiles?.map((profile) => {
                    const fullName = profile.full_name || `Profile ${profile.id.slice(0, 8)}`;
                    const sppCode = profile.spp_code || profile.id;
                    return (
                      <SelectItem key={profile.id} value={sppCode}>
                        {fullName} {profile.spp_code && `(${profile.spp_code})`}
                      </SelectItem>
                    );
                  })}
                </>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
