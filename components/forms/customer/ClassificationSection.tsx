
import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomerRequestFormValues } from './schema';
import { useProfilesList } from '@/hooks/useProfilesList';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Updated region options as requested
const regionOptions = [
  { value: 'bangkok', label: 'Bangkok' },
  { value: 'chiangmai', label: 'Chiang Mai' },
  { value: 'phuket', label: 'Phuket' },
  { value: 'huahin', label: 'Hua Hin' },
  { value: 'pattaya', label: 'Pattaya' },
  { value: 'others', label: 'Others' },
];

// Sample data for customer types
const customerTypeOptions = [
  { value: 'individual', label: 'Individual' },
  { value: 'company', label: 'Company' },
  { value: 'government', label: 'Government' },
  { value: 'non-profit', label: 'Non-Profit' },
];

// Fetch channels data for customer groups
const useChannelsData = () => {
  return useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('channels')
        .select('customer_type_code, channel_name')
        .order('channel_name');
      
      if (error) throw error;
      return data || [];
    }
  });
};

// SalespersonOptions component using the useProfilesList hook
const SalespersonOptions = () => {
  const { data: profiles, isLoading, error } = useProfilesList();

  if (isLoading) {
    return <SelectItem value="loading">Loading...</SelectItem>;
  }

  if (error) {
    return <SelectItem value="error">Error loading salespeople</SelectItem>;
  }

  return (
    <>
      {profiles?.filter(profile => profile.spp_code).map((profile) => (
        <SelectItem key={profile.spp_code} value={profile.spp_code}>
          {profile.full_name || 'Unnamed User'} ({profile.spp_code})
        </SelectItem>
      ))}
    </>
  );
};

export const ClassificationSection = () => {
  const form = useFormContext<CustomerRequestFormValues>();
  const { data: channels = [], isLoading: isLoadingChannels } = useChannelsData();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Classification</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="customer_type_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Type <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customerTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="salesperson_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salesperson <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select salesperson" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SalespersonOptions />
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="customer_group"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Group</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingChannels ? (
                    <SelectItem value="loading">Loading...</SelectItem>
                  ) : (
                    channels.map((channel) => (
                      <SelectItem key={channel.customer_type_code} value={`${channel.channel_name} (${channel.customer_type_code})`}>
                        {channel.channel_name} ({channel.customer_type_code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {regionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
