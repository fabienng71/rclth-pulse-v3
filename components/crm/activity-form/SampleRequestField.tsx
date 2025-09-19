
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Control, FieldValues } from 'react-hook-form';
import { useSampleRequests } from './useSampleRequests';

interface SampleRequestFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
}

export const SampleRequestField = <T extends FieldValues = FieldValues>({ control }: SampleRequestFieldProps<T>) => {
  const { sampleRequests, loading, error } = useSampleRequests();

  return (
    <FormField
      control={control}
      name="sample_request_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Related Sample Request</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value || "none"}
            disabled={loading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Link to a sample request (optional)" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {loading && (
                <SelectItem value="loading">Loading sample requests...</SelectItem>
              )}
              {error && (
                <SelectItem value="error">Failed to load sample requests</SelectItem>
              )}
              {!loading && !error && sampleRequests.length === 0 && (
                <SelectItem value="no-data">No sample requests available</SelectItem>
              )}
              {!loading && !error && sampleRequests.map((request) => {
                // Ensure we have valid values for the key and value props
                const id = request.id || `request-${Math.random().toString(36).substring(7)}`;
                const customerName = request.customer_name || "Unnamed Customer";
                
                return (
                  <SelectItem 
                    key={id} 
                    value={id}
                  >
                    {customerName} - {request.created_at ? formatDate(new Date(request.created_at)) : "No date"}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const formatDate = (date: Date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid date";
  }
  return date.toLocaleDateString();
};
