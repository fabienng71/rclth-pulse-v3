
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCustomerRequests } from '@/hooks/useCustomerRequests';

interface CustomerRequestFormProps {
  initialData?: any;
  mode: 'create' | 'edit';
  onSubmissionStart?: () => void;
  onSubmissionEnd?: () => void;
}

interface FormData {
  customer_name: string;
  search_name?: string;
  customer_type_code: string;
  salesperson_code: string;
  address?: string;
  city?: string;
  company_name?: string;
  company_address?: string;
  company_city?: string;
  customer_group?: string;
  region?: string;
  contacts: Array<{
    name: string;
    position?: string;
    phone?: string;
    email?: string;
    line?: string;
    whatsapp?: string;
  }>;
  documents: {
    pp20?: boolean;
    company_registration?: boolean;
    id_card?: boolean;
  };
  credit_limit: number;
  credit_terms?: string;
  prepayment: boolean;
}

export const CustomerRequestForm: React.FC<CustomerRequestFormProps> = ({
  initialData,
  mode,
  onSubmissionStart,
  onSubmissionEnd
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { submitRequest } = useCustomerRequests();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      customer_name: initialData?.customer_name || '',
      search_name: initialData?.search_name || '',
      customer_type_code: initialData?.customer_type_code || '',
      salesperson_code: initialData?.salesperson_code || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      company_name: initialData?.company_name || '',
      company_address: initialData?.company_address || '',
      company_city: initialData?.company_city || '',
      customer_group: initialData?.customer_group || '',
      region: initialData?.region || '',
      contacts: initialData?.contacts || [{ name: '', position: '', phone: '', email: '', line: '', whatsapp: '' }],
      documents: initialData?.documents || { pp20: false, company_registration: false, id_card: false },
      credit_limit: initialData?.credit_limit || 0,
      credit_terms: initialData?.credit_terms || '',
      prepayment: initialData?.prepayment || false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    onSubmissionStart?.();

    try {
      if (mode === 'create') {
        await submitRequest(data);
        toast({
          title: "Success",
          description: "Customer request created successfully",
        });
        navigate('/forms/customer');
      } else {
        // Handle edit mode if needed
        toast({
          title: "Success",
          description: "Customer request updated successfully",
        });
      }
    } catch (error) {
      console.error('Error submitting customer request:', error);
      toast({
        title: "Error",
        description: "Failed to submit customer request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      onSubmissionEnd?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Create New Customer Request' : 'Edit Customer Request'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter customer name" {...field} />
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
                      <Input placeholder="Enter search name" {...field} />
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
                    <FormLabel>Customer Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RETAIL">Retail</SelectItem>
                        <SelectItem value="WHOLESALE">Wholesale</SelectItem>
                        <SelectItem value="DISTRIBUTOR">Distributor</SelectItem>
                        <SelectItem value="CORPORATE">Corporate</SelectItem>
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
                    <FormLabel>Salesperson *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter salesperson code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credit_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Limit</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter credit limit" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/forms/customer')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : (mode === 'create' ? 'Create Request' : 'Update Request')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
