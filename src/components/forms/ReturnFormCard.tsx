
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { Customer } from '@/hooks/useCustomersData';
import { Item } from '@/hooks/useItemsData';
import CustomerSection from './CustomerSection';
import ProductSection from './ProductSection';
import ReturnDateSection from './ReturnDateSection';
import ReasonSection from './ReasonSection';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ReturnFormValues } from '@/hooks/returnFormSchema';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReturnFormCardProps {
  form: UseFormReturn<ReturnFormValues>;
  onSubmit: (data: ReturnFormValues) => void;
  selectedCustomer: Customer | null;
  selectedItem: Item | null;
  handleCustomerSelect: (customerCode: string) => void;
  handleItemSelect: (itemCode: string) => void;
  onReasonChange?: (value: string) => void;
  isSubmitting?: boolean;
}

const ReturnFormCard = ({
  form,
  onSubmit,
  selectedCustomer,
  selectedItem,
  handleCustomerSelect,
  handleItemSelect,
  onReasonChange,
  isSubmitting = false
}: ReturnFormCardProps) => {
  React.useEffect(() => {
    console.warn('⚠️ DEPRECATED: ReturnFormCard is deprecated. Please use EnhancedReturnForm instead for multi-item support.');
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Return Request Form (Legacy)</CardTitle>
        <CardDescription>Please fill out the details to initiate a product return request</CardDescription>
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This form is deprecated. Consider using the enhanced multi-item return form for better functionality.
          </AlertDescription>
        </Alert>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CustomerSection 
              control={form.control}
              selectedCustomer={selectedCustomer}
              handleCustomerSelect={handleCustomerSelect}
            />

            <ProductSection 
              control={form.control}
              selectedItem={selectedItem}
              handleItemSelect={handleItemSelect}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="returnQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0.01} 
                        step="any" 
                        placeholder="Enter return quantity" 
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
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Unit" 
                        {...field} 
                        value={field.value || (selectedItem?.base_unit_code || '')}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <ReturnDateSection control={form.control} />

            <ReasonSection 
              control={form.control}
              onReasonChange={onReasonChange}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Return Request'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ReturnFormCard;

