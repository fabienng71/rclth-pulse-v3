
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Building2, User, UserCheck, CheckCircle } from 'lucide-react';
import { useSalespersonsData } from '@/hooks/useCustomersData';
import { useChannelsData } from '@/hooks/useChannelsData';
import { useNavigate } from 'react-router-dom';

const customerSchema = z.object({
  customer_code: z.string().min(1, 'Customer code is required'),
  customer_name: z.string().min(1, 'Customer name is required'),
  search_name: z.string().optional(),
  customer_type_code: z.string().optional(),
  salesperson_code: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  initialData?: Partial<CustomerFormData>;
  isEdit?: boolean;
  isLoading?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  onSubmit,
  initialData = {},
  isEdit = false,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const { salespersons } = useSalespersonsData();
  const { channels, isLoading: isLoadingChannels } = useChannelsData();
  
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customer_code: initialData.customer_code || '',
      customer_name: initialData.customer_name || '',
      search_name: initialData.search_name || '',
      customer_type_code: initialData.customer_type_code || '',
      salesperson_code: initialData.salesperson_code || '',
    },
  });

  const handleSubmit = (data: CustomerFormData) => {
    onSubmit(data);
  };

  // Calculate form completion percentage for new customers
  const watchedValues = form.watch();
  const totalFields = 5; // customer_code, customer_name, search_name, customer_type_code, salesperson_code
  const completedFields = [
    watchedValues.customer_code,
    watchedValues.customer_name,
    watchedValues.search_name,
    watchedValues.customer_type_code,
    watchedValues.salesperson_code
  ].filter(Boolean).length;
  
  const progressPercentage = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress indicator for new customers */}
      {!isEdit && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Form Completion</span>
            <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          {progressPercentage === 100 && (
            <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Ready to submit!
            </div>
          )}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Basic Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customer_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Customer Code
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter customer code"
                          disabled={isEdit || isLoading}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Customer Name
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter customer name"
                          disabled={isLoading}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="search_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Search Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter search name (optional)"
                          disabled={isLoading}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_type_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer Type
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoading || isLoadingChannels}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select customer type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingChannels ? (
                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                          ) : (
                            channels.map((channel) => (
                              <SelectItem key={channel.customer_type_code} value={channel.customer_type_code}>
                                {channel.channel_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Salesperson Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="salesperson_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Salesperson</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select salesperson" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {salespersons.map((person) => (
                          <SelectItem key={person.spp_code} value={person.spp_code}>
                            {person.spp_name} ({person.spp_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/crm/customers")}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Customer' : 'Create Customer')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
