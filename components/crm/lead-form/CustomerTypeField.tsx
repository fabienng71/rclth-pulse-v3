
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { LeadFormValues } from "@/hooks/useLeadForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CustomerTypeFieldProps {
  control: Control<LeadFormValues>;
  disabled: boolean;
}

interface Channel {
  customer_type_code: string;
  channel_name: string;
}

const fetchChannels = async () => {
  const { data, error } = await supabase
    .from('channels')
    .select('customer_type_code, channel_name')
    .order('channel_name');
  
  if (error) throw error;
  return data;
};

export const CustomerTypeField = ({ control, disabled }: CustomerTypeFieldProps) => {
  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: fetchChannels,
  });

  return (
    <FormField
      control={control}
      name="customer_type_code"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-medium">Customer Type</FormLabel>
          <Select
            disabled={disabled || isLoading}
            onValueChange={field.onChange}
            value={field.value || undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading customer types..." : "Select customer type"} />
            </SelectTrigger>
            <SelectContent>
              {isLoading && (
                <SelectItem value="loading">Loading customer types...</SelectItem>
              )}
              {!isLoading && channels.map((channel: Channel) => (
                <SelectItem key={channel.customer_type_code} value={channel.customer_type_code}>
                  {channel.channel_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
